import { HexString } from '@gear-js/api';
import React, { useEffect, useMemo, useState } from 'react'
import { Message } from './utilts/MessageForm';
import { db, getMessageCountForChatId, getSymmetricKeyByChatId } from 'utils/indexedDB';
import GetMessages from './GetMessages';

export default function MessagesLoader({chatId}: {chatId: HexString}) {
    const [lastLength, setLastLength] = useState<number>(0);
    const [symKey, setSymKey] = useState<CryptoKey>();

    const [dataLoaded, setDataLoaded] = useState(false);
    useEffect(() => {
        getMessageCountForChatId(chatId)
        .then(length => {
            setLastLength(length);
            setDataLoaded(true);
        })
        .catch(error => {
            console.error("Error loading strings:", error);
        });
        getSymmetricKeyByChatId(chatId)
        .then((symkey) => {
            if(symkey){
                setSymKey(symkey);
            }
            else{
                console.error("Error retriving symkey:");
            }
        })
    }, []);

    const payload = useMemo(() => ({ GetMessagesStartFrom: { from: lastLength } }), [lastLength]);

    return (
        <>
            {dataLoaded && symKey ? (
          <GetMessages
                key={chatId}
                payload={payload}
                setLastLength={setLastLength}
                chatId={chatId}
                symKey={symKey}
          />
        ) : null}
        </>
      );
}
