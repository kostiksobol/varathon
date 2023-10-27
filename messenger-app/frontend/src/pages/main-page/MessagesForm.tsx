import { HexString } from "@gear-js/api";
import { useAccount, useSendMessage, ApiProvider } from "@gear-js/react-hooks";
import { useParams } from "react-router-dom";
import { Message, MessageForm, MessageWithRealFile } from "./utilts/MessageForm";
import { decryptDataWithPrivKey } from "utils/crypto-defence/public-private-key-encryption";
import { useContext, useEffect, useRef, useState } from "react";
import SendMessageForm from "./UI/SendMessageForm";

import metaGroupConnectionTxt from 'assets/meta/group_connection.meta.txt'
import { useProgramMetadata } from "hooks";
import { IMessage, db, getMessagesForChat, getSymmetricKeyByChatId } from "utils/indexedDB";
import { IpfsFile } from './utilts/MessageForm';
import { create } from "ipfs-http-client";
import { encryptFile, encryptText } from "utils/crypto-defence/symmetric-key-encryption";

const client = create({ host: 'localhost', port: 5001, protocol: 'http' });

export function MessagesForm(){
    const params = useParams<{ id: HexString }>();
    const chat_id = params.id!;

    const [symKey, setSymKey] = useState<CryptoKey>();
    const [messages, setMessages] = useState<MessageWithRealFile[]>([]);

    useEffect(() => {
        getMessagesForChat(chat_id)
        .then((allMessages) => {
            setMessages(allMessages.map((msg) => {
                return {from: msg.from, encryptedContent: msg.content, timestamp: msg.timestamp, files: msg.files};
            }))
        })
        .catch((error) => {
            console.error(error);
        });

        getSymmetricKeyByChatId(chat_id)
        .then((symkey) => {
            if(symkey){
                setSymKey(symkey);
            }
            else{
                console.error("Error retriving symkey:");
            }
        });

        const creatingHook = function(primKey: any, obj: IMessage, trans: any) {
            if(obj.chatId == chat_id){
                const files: IpfsFile[] = obj.files.map((file) => {
                    return {name: file.name, tip: file.tip, sizet: file.sizet, hashipfs: file.hashipfs};
                })
                const message: MessageWithRealFile = {from: obj.from, encryptedContent: obj.content, timestamp: obj.timestamp, files: obj.files};
                setMessages(prevMessages => [...prevMessages, message]);
            }
          };

          db.messages.hook('creating', creatingHook);
          return(() => {
            db.messages.hook('creating').unsubscribe(creatingHook);
          });
    }, [chat_id]);

    const sendMessage = useSendMessage(chat_id, useProgramMetadata(metaGroupConnectionTxt));

    function handleSendMessageClick(message: string, files: FileList | null){
        return async () => {
            if(message === '' && !files){
                return;
            }
    
            if(symKey){
                const encrypted_content = await encryptText(message, symKey);
                const ipfsfiles = [];
                if(files){
                    for(let i = 0; i < files.length; i++){
                        const file = files[i];
                        const encrypted_file_blob = await encryptFile(file, symKey);
                        const added = await client.add(encrypted_file_blob);
                        const hash = added.path;
                        ipfsfiles.push({name: await encryptText(file.name, symKey), tip: await encryptText(file.type, symKey), sizet: await encryptText(file.size.toString(), symKey), 
                            hashipfs: await encryptText(hash, symKey)});
                        // uploadToIpfs(file)
                        // .then((hash) => {
                        //     ipfsfiles.push({name: encryptData(file.name, symKey), tip: encryptData(file.type, symKey), sizet: encryptData(file.size.toString(), symKey), 
                        //         hashipfs: encryptData(hash, symKey)});
                        // })
                    }
                }
                sendMessage({Send: {encrypted_content, files: ipfsfiles}});
            }
        }
    }

    return (
        <div >
            <div
            style={{
            paddingRight: '0.5rem',
            backgroundColor: '#222',
            height: "63vh",
            overflowY: "auto",
            }}
            >
                {messages.map((message, index) => (<MessageForm key={index} message={message}/>
                ))}
            </div>
            <div style={{height: '20vh'}}><SendMessageForm handleSendMessageClick={handleSendMessageClick}/></div>
        </div>
    );
}