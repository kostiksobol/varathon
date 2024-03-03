import { HexString } from '@gear-js/api';
import { MAIN_CONTRACT_ADDRESS } from 'consts';
import { readContractState, useContractState } from 'hooks/hooks';
import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt';
import metaUserContractTxt from 'assets/meta/user_contract.meta.txt';
import React, { useContext, useEffect } from 'react'
import { gearApiContext } from 'context';
import { useAccount } from '@gear-js/react-hooks';
import { addChat, addUser, setLastRecordIdForUserId } from 'utils/indexedDB';
import { decryptDataWithPrivKey } from 'utils/crypto-defence/public-private-key-encryption';
import { YourInfo } from './MainLayer';
import { decryptText, stringToSymmetricKey } from 'utils/crypto-defence/symmetric-key-encryption';
import { Invitation, InvitationMessage } from './ChatsForm';

interface SetChatIdsComponentProps {
    payload: {
        GetLastRecords: { from: number },
    };
    setChatIds: React.Dispatch<React.SetStateAction<string[]>>;
    setLengthChatIds: React.Dispatch<React.SetStateAction<number>>;
}

export default function GetChatIds({ payload, setChatIds, setLengthChatIds }: SetChatIdsComponentProps) {
    const api = useContext(gearApiContext);
    const { account } = useAccount();

    const { state: newChatIds } = useContractState<{ LastRecords: { res: { record: string, index: number }[] } }>(MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, payload);

    useEffect(() => {
        const processChatIds = async () => {
            while (!api || !account) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            if (account && api && newChatIds && newChatIds.LastRecords.res.length > 0) {
                // console.log("GetChatIds");
                const new_chat_ids = newChatIds.LastRecords.res;

                const new_chats: string[] = [];
                const promises = new_chat_ids.map(async (chat_id) => {
                    const info: YourInfo = JSON.parse(localStorage.getItem(account.address)!);
                    try {
                        const decrypted_record = await decryptDataWithPrivKey(info.privateKey, chat_id.record);
                        // console.log(decrypted_record);
                        // const decrypted_record = await decryptDataWithPrivKey(info.privateKey, chat_id.record);
                        const invitation = JSON.parse(decrypted_record) as Invitation;
                        // console.log(invitation)
                        const state = await readContractState<{ Message: { res: { encryptedContent: string, tag: string, timestamp: number } } }>(api, invitation.from_contract_id, metaUserContractTxt, { GetMessage: { index: chat_id.index } });
                        // console.log(state)
                        const sym_key = await stringToSymmetricKey(invitation.sym_key);
                        // console.log(sym_key)
                        // console.log(state.Message.res.encryptedContent)
                        const decrypted_message = await decryptText(state.Message.res.encryptedContent, sym_key);
                        // console.log(decrypted_message)
                        const invitation_message = JSON.parse(decrypted_message) as InvitationMessage;
                        // console.log(invitation_message)
                        for (const member of invitation_message.members) {
                            const member_state = await readContractState<{User: {res: {address: HexString, login: string, name: string, pubkey: string, contract: HexString}}}>(api, MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, {GetUserByAddress: {address: member}});
                            // console.log(member_state);
                            await addUser({userId: account.address, chatId: invitation.sym_key, user: {address: member_state.User.res.address, login: member_state.User.res.login, name: member_state.User.res.name, contract: member_state.User.res.contract}, lastMessagesId: 0});
                        }
                        // invitation_message.members.forEach(member => {
                        //     const member_state = await readContractState<{User: {res: {address: HexString, login: string, name: string, pubkey: string, contract: HexString}}}>(api, MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, {GetUserByAddress: {address: member}});
                        //     await addUser({chatId: invitation.sym_key, user: {address: member_state.User.res.address, login: member_state.User.res.login, name: member_state.User.res.name, contract: member_state.User.res.contract}});
                        // });
                        new_chats.push(invitation.sym_key);
                        await addChat({userId: account.address, chatId: invitation.sym_key, name: invitation_message.name, symmetricKey: sym_key});
                    } catch (e: any) {
                        // console.log(e);
                }});

                await Promise.all(promises);

                await setLastRecordIdForUserId(account!.address, new_chat_ids.length);
                setChatIds(prevChatIds => [...new_chats, ...prevChatIds]);
                setLengthChatIds(prevLen => prevLen + new_chat_ids.length);
            }
        };

        processChatIds();
    }, [newChatIds]);


    return null;
}
