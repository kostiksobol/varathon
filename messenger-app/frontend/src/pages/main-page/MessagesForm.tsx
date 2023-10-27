import { HexString } from "@gear-js/api";
import { useAccount, useSendMessage, ApiProvider } from "@gear-js/react-hooks";
import { useParams } from "react-router-dom";
import { Message, MessageForm } from "./utilts/MessageForm";
import { decryptDataWithPrivKey } from "utils/crypto-defence/public-private-key-encryption";
import { useContext, useEffect, useRef, useState } from "react";
import SendMessageForm from "./UI/SendMessageForm";
import { encryptData } from "utils/crypto-defence/symmetric-key-encryption";

import metaGroupConnectionTxt from 'assets/meta/group_connection.meta.txt'
import { useProgramMetadata } from "hooks";
import { IMessage, db, getMessagesByChatId, getSymmetricKeyByChatId } from "utils/indexedDB";
import { IpfsFile } from './utilts/MessageForm';
import { create } from "ipfs-http-client";

const client = create({ host: 'localhost', port: 5001, protocol: 'http' });

export function MessagesForm(){
    const params = useParams<{ id: HexString }>();
    const chat_id = params.id!;

    const [symKey, setSymKey] = useState<string>();
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        getMessagesByChatId(chat_id)
        .then((allMessages) => {
            setMessages(allMessages.map((msg) => {
                const a: Message = {from: msg.from, encryptedContent: msg.content, files: msg.files, timestamp: msg.timestamp};
                return a;
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
                const newMessage: Message = {from: obj.from, encryptedContent: obj.content, files: obj.files, timestamp: obj.timestamp};
                setMessages(prevMessages => [...prevMessages, newMessage])
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
                const encrypted_content = encryptData(message, symKey);
                const ipfsfiles: IpfsFile[] = [];
                if(files){
                    for(let i = 0; i < files.length; i++){
                        const file = files[i];
                        const added = await client.add(file)
                        const hash = added.path;
                        ipfsfiles.push({name: encryptData(file.name, symKey), tip: encryptData(file.type, symKey), sizet: encryptData(file.size.toString(), symKey), 
                            hashipfs: encryptData(hash, symKey)});
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