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

interface SetChatIdsComponentProps {
    payload: {
        GetLastChatIdsFrom: { from: number, for_whom: HexString },
    };
    setChatIds: React.Dispatch<React.SetStateAction<HexString[]>>;
    setChatIdsWithSymKeys: React.Dispatch<React.SetStateAction<Map<HexString, string>>>;
    setLengthChatIds: React.Dispatch<React.SetStateAction<number>>;
  }

export default function GetChatIds({payload, setChatIds, setChatIdsWithSymKeys, setLengthChatIds}: SetChatIdsComponentProps) {
    console.log("GetChatIds");

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
    
                const updateSymKeysAndChatIds = async () => {
                    const promiseArray: Promise<[`0x${string}`, string]>[] = new_chat_ids.map((chat_id) => {
                        return readContractState<{ UserEncryptedSymkey: { res: string } }>(
                            api, chat_id, metaGroupConnectionTxt, { GetUserEncryptedSymkey: { user: account.decodedAddress } }
                        ).then((state) => {
                            const sym_key = decryptDataWithPrivKey(localStorage.getItem(account.address)!, state.UserEncryptedSymkey.res);
                            addChat({ userId: account.address, chatId: chat_id, symmetricKey: sym_key });
                            return [chat_id, state.UserEncryptedSymkey.res];
                        });
                    });
    
                    const results = await Promise.all(promiseArray);
    
                    setChatIdsWithSymKeys((prevMap) => {
                        const newMap = new Map(prevMap);
                        results.forEach(([chat_id, symKey]) => {
                            newMap.set(chat_id, symKey);
                        });
                        return newMap;
                    });
    
                    setChatIds(prevChatIds => [...new_chat_ids, ...prevChatIds]);
                    setLengthChatIds(prevLen => prevLen + new_chat_ids.length);
                };
    
                await updateSymKeysAndChatIds();
            }
        }
        processChatIds();
    }, [newChatIds]);
    
    
    return null;
}
