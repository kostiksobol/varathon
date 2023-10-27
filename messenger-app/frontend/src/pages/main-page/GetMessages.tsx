import { useContractState } from 'hooks/hooks';
import React, { useEffect } from 'react'
import { IpfsFileWithRealFile, Message } from './utilts/MessageForm';
import { HexString } from '@gear-js/api';
import metaGroupConnectionTxt from 'assets/meta/group_connection.meta.txt';
import { addMessage, db } from 'utils/indexedDB';
import { IpfsFile } from './utilts/MessageForm';
import { decryptFile, decryptText } from 'utils/crypto-defence/symmetric-key-encryption';

interface ContractComponentProps {
    payload: {
      GetMessagesStartFrom: {
        from: number;
      };
    };
    setLastLength: React.Dispatch<React.SetStateAction<number>>;
    chatId: HexString;
    symKey: CryptoKey;
  }

export default function GetMessages({payload, setLastLength, chatId, symKey} : ContractComponentProps) {
    
    const { state: serverMessages  } = useContractState<{ MessagesStartFrom: { res: Message[] } }>(chatId, metaGroupConnectionTxt, payload);
    useEffect(() => {
      (async () => { // IIFE (Immediately Invoked Function Expression) to allow for async operations
          if (serverMessages && serverMessages.MessagesStartFrom.res.length > 0) {
              const newMessages = serverMessages.MessagesStartFrom.res;
  
              for (let msg of newMessages) {
                  // First, handle the ipfsfiles mapping operation
                  const ipfsfilesPromises = msg.files.map(async (encr_file) => {
                      const name = await decryptText(encr_file.name, symKey);
                      const tip = await decryptText(encr_file.tip, symKey);
                      const sizet = await decryptText(encr_file.sizet, symKey);
                      const hashipfs = await decryptText(encr_file.hashipfs, symKey);

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
                  
                  // Second, handle the addMessage operation
                  try {
                      await addMessage({
                          chatId: chatId,
                          content: await decryptText(msg.encryptedContent, symKey),
                          from: msg.from,
                          files: ipfsfiles,
                          timestamp: msg.timestamp
                      });
                  } catch (error) {
                      console.error("Error in adding message", error);
                  }
              }
  
              // Finally, after processing all messages, update setLastLength
              setLastLength(prevLength => prevLength + newMessages.length);
          }
      })();
  }, [serverMessages]);
  
    return null;
}
