import { HexString } from '@gear-js/api';
import React, { useEffect, useMemo, useState } from 'react'
import { Message } from './utilts/MessageForm';
import { db, getMessagesByChatId, getSymmetricKeyByChatId, getUsersByChatId } from 'utils/indexedDB';
import GetMessages from './GetMessages';
import GetUsers from './GetUsers';

export default function UsersLoader({chatId}: {chatId: HexString}) {
    const [lastLength, setLastLength] = useState<number>(0);

    const [dataLoaded, setDataLoaded] = useState(false);
    // console.log("ChatId: ", chatId, "lastLength: ", lastLength, "dataLoaded: ", dataLoaded)
    useEffect(() => {
        getUsersByChatId(chatId)
        .then(allUsers => {
            // console.log("ChatId: ", chatId, "allUsers: ", allUsers)
            setLastLength(allUsers.length);
            setDataLoaded(true);
        })
        .catch(error => {
            console.error("Error loading strings:", error);
        });
    }, []);

    const payload = useMemo(() => ({ GetUsersStartFrom: { from: lastLength } }), [lastLength]);

    return (
        <>
            {dataLoaded ? (
          <GetUsers
                key={chatId}
                payload={payload}
                setLastLength={setLastLength}
                chatId={chatId}
          />
        ) : null}
        </>
      );
}
