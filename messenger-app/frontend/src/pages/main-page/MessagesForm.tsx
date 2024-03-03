import { HexString } from "@gear-js/api";
import { useAccount, useSendMessage, ApiProvider } from "@gear-js/react-hooks";
import { useParams } from "react-router-dom";
import { Message, MessageForm, MessageWithRealFile } from "./utilts/MessageForm";
import { decryptDataWithPrivKey } from "utils/crypto-defence/public-private-key-encryption";
import { useContext, useEffect, useRef, useState } from "react";
import SendMessageForm from "./UI/SendMessageForm";

import metaGroupConnectionTxt from 'assets/meta/user_contract.meta.txt'
import { useProgramMetadata } from "hooks";
import { IMessage, db, getMessagesForChat, getSymmetricKeyByChatId } from "utils/indexedDB";
import { IpfsFile } from './utilts/MessageForm';
import { create } from "ipfs-http-client";
import { encryptFile, encryptText } from "utils/crypto-defence/symmetric-key-encryption";
import { createHMACWithNonce } from "utils/crypto-defence/HMAC";
import { YourInfo } from "./MainLayer";

const client = create({ host: 'localhost', port: 5001, protocol: 'http' });

export function MessagesForm(){
    const params = useParams<{ id: string }>();
    const chat_id = params.id!;

    const {account} = useAccount();

    const [contract, setContract] = useState<HexString>("0x");

    const [symKey, setSymKey] = useState<CryptoKey>();
    const [messages, setMessages] = useState<MessageWithRealFile[]>([]);

    useEffect(() => {
        const raw_info = localStorage.getItem(account!.address);
        if (raw_info) {
          const info: YourInfo = JSON.parse(raw_info);
          setContract(info.contract);
        }

        // console.log("CHAT_ID" + chat_id)
        getMessagesForChat(chat_id, account!.address)
        .then((allMessages) => {
            // console.log(allMessages)
            allMessages.sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)));
            // console.log(allMessages);
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

        // const creatingHook = function(primKey: any, obj: IMessage, trans: any) {
        //     if(obj.chatId == chat_id && obj.userId == account!.address){
        //         const files: IpfsFile[] = obj.files.map((file) => {
        //             return {name: file.name, tip: file.tip, sizet: file.sizet, hashipfs: file.hashipfs};
        //         })
        //         const message: MessageWithRealFile = {from: obj.from, encryptedContent: obj.content, timestamp: obj.timestamp, files: obj.files};
        //         setMessages(prevMessages => [...prevMessages, message]);
        //     }
        //   };

        const creatingHook = function(primKey: any, obj: IMessage, trans: any) {
            if(obj.chatId == chat_id && obj.userId == account!.address){
                const files: IpfsFile[] = obj.files.map((file) => {
                    return {name: file.name, tip: file.tip, sizet: file.sizet, hashipfs: file.hashipfs};
                })
                const message: MessageWithRealFile = {from: obj.from, encryptedContent: obj.content, timestamp: obj.timestamp, files: obj.files};
        
                setMessages(prevMessages => {
                    // Find the right index to insert the new message
                    const insertAt = prevMessages.findIndex(m => String(m.timestamp).localeCompare(String(message.timestamp)) > 0);
        
                    // If insertAt is -1, it means the new message has the latest timestamp, add it to the end
                    if (insertAt === -1) {
                        return [...prevMessages, message];  
                    }
        
                    // Otherwise, insert the message at the correct index
                    return [
                        ...prevMessages.slice(0, insertAt),
                        message,
                        ...prevMessages.slice(insertAt)
                    ];
                });
            }
        };        

          db.messages.hook('creating', creatingHook);
          return(() => {
            db.messages.hook('creating').unsubscribe(creatingHook);
          });
    }, [chat_id]);

    const sendMessage = useSendMessage(contract, useProgramMetadata(metaGroupConnectionTxt));

    function handleSendMessageClick(message: string, files: FileList | null){
        return async () => {
            if(message === '' && !files){
                return;
            }
    
            if(symKey){
                const ipfsfiles: IpfsFile[] = [];
                if(files){
                    for(let i = 0; i < files.length; i++){
                        const file = files[i];
                        const encrypted_file_blob = await encryptFile(file, symKey);
                        const added = await client.add(encrypted_file_blob);
                        const hash = added.path;
                        ipfsfiles.push({name: file.name, tip: file.type, sizet: file.size.toString(), 
                            hashipfs: hash});
                        // uploadToIpfs(file)
                        // .then((hash) => {
                        //     ipfsfiles.push({name: encryptData(file.name, symKey), tip: encryptData(file.type, symKey), sizet: encryptData(file.size.toString(), symKey), 
                        //         hashipfs: encryptData(hash, symKey)});
                        // })
                    }
                }
                const msg: Message = {encryptedContent: message, files: ipfsfiles};
                const encrypted_shit = await encryptText(JSON.stringify(msg), symKey);
                const tag = await createHMACWithNonce(chat_id);
                sendMessage({AddMessage: {encrypted_content: encrypted_shit, tag}});
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