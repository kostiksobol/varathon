import { HexString } from "@gear-js/api";
import { useAccount, useSendMessage, ApiProvider } from "@gear-js/react-hooks";
import { useGroupState } from "hooks";
import { useParams } from "react-router-dom";
import { Message, MessageForm } from "./utilts/MessageForm";
import { decryptDataWithPrivKey } from "utils/crypto-defence/public-private-key-encryption";
import { useContext, useEffect, useRef, useState } from "react";
import SendMessageForm from "./UI/SendMessageForm";
import { encryptData } from "utils/crypto-defence/symmetric-key-encryption";
import { getSendMessageToGroupPayload } from "utils/payloads/group-connection-payloads";
import { useMetadata } from "hooks/useMetadata";

import metaGroupConnectionTxt from 'assets/meta/group_connection.meta.txt'
import { ChatIds_SymKeys_Context } from "context";


export function MessagesForm(){
    const params = useParams<{ id: HexString }>();
    const chat_id = params.id!;

    const symKey = useContext(ChatIds_SymKeys_Context)?.get(chat_id);
  
    const { state: messages } = useGroupState<Message[]>('get_all_messages', chat_id, null);

    const sendMessage = useSendMessage(chat_id, useMetadata(metaGroupConnectionTxt));

    function handleSendMessageClick(newMessage: string){
        return () => {
            if(newMessage === ''){
                return;
            }
    
            if(symKey){
                const encrypted_content = encryptData(newMessage, symKey);
    
                sendMessage(getSendMessageToGroupPayload(encrypted_content));
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
                {messages?.map((message, index) => (
                    symKey && <MessageForm key={index} message={message} symKey={symKey}/>
                ))}
            </div>
            <div style={{height: '20vh'}}><SendMessageForm handleSendMessageClick={handleSendMessageClick}/></div>
        </div>
    );
}