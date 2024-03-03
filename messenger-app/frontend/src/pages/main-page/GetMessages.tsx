import { readContractState, useContractState } from 'hooks/hooks';
import React, { useContext, useEffect } from 'react'
import { IpfsFileWithRealFile, Message } from './utilts/MessageForm';
import { HexString } from '@gear-js/api';
import metaGroupConnectionTxt from 'assets/meta/user_contract.meta.txt';
import { IUser, addMessage, addUser, checkIfUserAlreadyAdded, db, setLastMessageId } from 'utils/indexedDB';
import { IpfsFile } from './utilts/MessageForm';
import { decryptFile, decryptText } from 'utils/crypto-defence/symmetric-key-encryption';
import { verifyHMACWithNonce } from 'utils/crypto-defence/HMAC';
import { Invitation, InvitationMessage } from './ChatsForm';
import { gearApiContext } from 'context';
import { MAIN_CONTRACT_ADDRESS } from 'consts';
import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt';
import { useAccount } from '@gear-js/react-hooks';

interface ContractComponentProps {
    payload: {
        GetLastMessages: {
            from: number;
        };
    };
    setLastLength: React.Dispatch<React.SetStateAction<number>>;
    user: IUser;
    symKey: CryptoKey;
}

export default function GetMessages({ payload, setLastLength, user, symKey }: ContractComponentProps) {
    const api = useContext(gearApiContext);
    const {account} = useAccount();

    const { state: serverMessages } = useContractState<{ LastMessages: { res: { encryptedContent: string, tag: string, timestamp: number }[] } }>(user.user.contract, metaGroupConnectionTxt, payload);
    // console.log(serverMessages)
    // console.log(payload);
    useEffect(() => {
        (async () => { // IIFE (Immediately Invoked Function Expression) to allow for async operations
            while (!api || !account) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            if (serverMessages && serverMessages.LastMessages.res.length > 0) {
                const newMessages = serverMessages.LastMessages.res;

                for (let msg of newMessages) {
                    const check = await verifyHMACWithNonce(msg.tag, user.chatId);
                    if (check) {
                        const decrypted_message = await decryptText(msg.encryptedContent, symKey);
                        // console.log(decrypted_message);
                        try {
                            const message = JSON.parse(decrypted_message) as Message;

                            const ipfsfilesPromises = message.files.map(async (encr_file) => {
                                const name = encr_file.name
                                const tip = encr_file.tip
                                const sizet = encr_file.sizet
                                const hashipfs = encr_file.hashipfs

                                const ipfsLink = `http://ipfs.io/ipfs/${hashipfs}`;
                                const response = await fetch(ipfsLink);
                                const encryptedBlob = await response.blob();
                                const decryptedFile = await decryptFile(encryptedBlob, symKey, tip);
                                return {
                                    name, tip, sizet, hashipfs,
                                    real_file: decryptedFile
                                };
                            });
                            const ipfsfiles: IpfsFileWithRealFile[] = await Promise.all(ipfsfilesPromises);

                            try {
                                await addMessage({
                                    userId: account.address,
                                    chatId: user.chatId,
                                    content: message.encryptedContent,
                                    from: user.user.address,
                                    files: ipfsfiles,
                                    timestamp: msg.timestamp
                                });
                            } catch (error) {
                                console.error("Error in adding message", error);
                            }
                        }
                        catch {
                            try {
                                const invitation_message = JSON.parse(decrypted_message) as InvitationMessage;
                                // console.log(invitation_message);
                                const check = await checkIfUserAlreadyAdded(user.chatId, account.address, invitation_message.invited);
                                if (check) {

                                }
                                else {
                                    const member_state = await readContractState<{ User: { res: { address: HexString, login: string, name: string, pubkey: string, contract: HexString } } }>(api, MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, { GetUserByAddress: { address: invitation_message.invited } });
                                    // console.log(member_state);
                                    await addUser({ userId: account.address, chatId: user.chatId, user: { address: member_state.User.res.address, login: member_state.User.res.login, name: member_state.User.res.name, contract: member_state.User.res.contract }, lastMessagesId: 0 });
                                }
                            }
                            catch {
                            }
                        }
                    }

                }

                // Finally, after processing all messages, update setLastLength
                await setLastMessageId(user.id!, newMessages.length);
                setLastLength(prevLength => prevLength + newMessages.length);
            }
        })();
    }, [serverMessages]);

    return null;
}
