import { HexString } from '@gear-js/api';
import { MAIN_CONTRACT_ADDRESS } from 'consts';
import { readContractState, useContractState } from 'hooks/hooks';
import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt';
import metaGroupConnectionTxt from 'assets/meta/group_connection.meta.txt';
import React, { useContext, useEffect } from 'react'
import { gearApiContext } from 'context';
import { useAccount } from '@gear-js/react-hooks';
import { addChat } from 'utils/indexedDB';
import { decryptDataWithPrivKey } from 'utils/crypto-defence/public-private-key-encryption';
import { YourInfo } from './MainLayer';
import { decryptText, stringToSymmetricKey } from 'utils/crypto-defence/symmetric-key-encryption';

interface SetChatIdsComponentProps {
    payload: {
        GetLastChatIdsFrom: { from: number, for_whom: HexString },
    };
    setChatIds: React.Dispatch<React.SetStateAction<HexString[]>>;
    setLengthChatIds: React.Dispatch<React.SetStateAction<number>>;
  }

export default function GetChatIds({payload, setChatIds, setLengthChatIds}: SetChatIdsComponentProps) {
    const api = useContext(gearApiContext);
    const {account} = useAccount();
    
    const { state: newChatIds  } = useContractState<{LastChatIds: {res: HexString[]}}>(MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, payload);

    useEffect(() => {
        const processChatIds = async () => {
            while (!api || !account) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
    
            if (account && api && newChatIds && newChatIds.LastChatIds.res.length > 0) {
                const new_chat_ids = newChatIds.LastChatIds.res;
    
                const promises = new_chat_ids.map(async (chat_id) => {
                    const state = await readContractState<{ UserEncryptedSymkey: { res: string } }>(
                        api, chat_id, metaGroupConnectionTxt, { GetUserEncryptedSymkey: { user: account.decodedAddress } }
                    );
                    const info: YourInfo = JSON.parse(localStorage.getItem(account.address)!);
                    const str_sym_key = decryptDataWithPrivKey(info.privateKey, state.UserEncryptedSymkey.res);
                    const sym_key = await stringToSymmetricKey(str_sym_key);
                    // const sym_key = decryptDataWithPrivKey(localStorage.getItem(account.address)!, state.UserEncryptedSymkey.res);
                    const statename = await readContractState<{ Name: { res: string } }>(api, chat_id, metaGroupConnectionTxt, { GetName: {} });
                    const name = await decryptText(statename.Name.res, sym_key);
                    addChat({ userId: account.address, chatId: chat_id, symmetricKey: sym_key, str_symmetricKey: str_sym_key, name });
                });
    
                await Promise.all(promises);
    
                setChatIds(prevChatIds => [...new_chat_ids, ...prevChatIds]);
                setLengthChatIds(prevLen => prevLen + new_chat_ids.length);
            }
        };
    
        processChatIds();
    }, [newChatIds]);
    
    
    return null;
}
