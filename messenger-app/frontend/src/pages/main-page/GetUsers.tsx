import { useContractState } from 'hooks/hooks';
import React, { useEffect } from 'react'
import { Message } from './utilts/MessageForm';
import { HexString } from '@gear-js/api';
import metaGroupConnectionTxt from 'assets/meta/group_connection.meta.txt';
import { addMessage, addUser, db } from 'utils/indexedDB';
import { decryptData } from 'utils/crypto-defence/symmetric-key-encryption';

interface ContractComponentProps {
    payload: {
      GetUsersStartFrom: {
        from: number;
      };
    };
    setLastLength: React.Dispatch<React.SetStateAction<number>>;
    chatId: HexString;
  }

export default function GetUsers({payload, setLastLength, chatId} : ContractComponentProps) {
    
    const { state: serverUsers } = useContractState<{ UsersStartFrom: { res: HexString[] } }>(chatId, metaGroupConnectionTxt, payload);
    useEffect(() => {
        if (serverUsers && serverUsers.UsersStartFrom.res.length > 0) {
          const newUsers = serverUsers.UsersStartFrom.res;
          // db.strings.bulkAdd(newStrings.map(value => ({ value })));
        //   newStrings.forEach((str) => {
        //     db.strings.add({value: str});
        //   })
        newUsers.forEach((msg) => {
            addUser({chatId: chatId, user: msg})
            .then()
            .catch((error) => {
                console.error("Error in adding message", error);
            })
        });
          setLastLength(prevLength => prevLength + newUsers.length);
        }
      }, [serverUsers]);
    return null;
}
