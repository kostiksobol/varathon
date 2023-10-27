import { useContractState } from 'hooks/hooks';
import React, { useEffect } from 'react'
import { Message } from './utilts/MessageForm';
import { HexString } from '@gear-js/api';
import metaGroupConnectionTxt from 'assets/meta/group_connection.meta.txt';
import { addMessage, db } from 'utils/indexedDB';
import { decryptData } from 'utils/crypto-defence/symmetric-key-encryption';
import { IpfsFile } from './utilts/MessageForm';

interface ContractComponentProps {
    payload: {
      GetMessagesStartFrom: {
        from: number;
      };
    };
    setLastLength: React.Dispatch<React.SetStateAction<number>>;
    chatId: HexString;
    symKey: string;
  }

export default function GetMessages({payload, setLastLength, chatId, symKey} : ContractComponentProps) {
    
    const { state: serverMessages  } = useContractState<{ MessagesStartFrom: { res: Message[] } }>(chatId, metaGroupConnectionTxt, payload);
    useEffect(() => {
        if (serverMessages && serverMessages.MessagesStartFrom.res.length > 0) {
          const newMessages = serverMessages.MessagesStartFrom.res;
        newMessages.forEach((msg) => {
            const ipfsfiles: IpfsFile[] = msg.files.map((encr_file) => {
              return {name: decryptData(encr_file.name, symKey), tip: decryptData(encr_file.tip, symKey), sizet: decryptData(encr_file.sizet, symKey), hashipfs: decryptData(encr_file.hashipfs, symKey)};
            })
            addMessage({chatId: chatId, content: decryptData(msg.encryptedContent, symKey), from: msg.from, files: ipfsfiles, timestamp: msg.timestamp})
            .then()
            .catch((error) => {
                console.error("Error in adding message", error);
            })
        });
          setLastLength(prevLength => prevLength + newMessages.length);
        }
      }, [serverMessages]);
    return null;
}
