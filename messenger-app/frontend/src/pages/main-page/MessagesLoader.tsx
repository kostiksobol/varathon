import React, { useEffect, useMemo, useState } from 'react'
import { IUser } from 'utils/indexedDB';
import GetMessages from './GetMessages';

export default function MessagesLoader({ user, symkey }: { user: IUser, symkey: CryptoKey }) {
  const [lastLength, setLastLength] = useState<number>(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  useEffect(() => {
    setLastLength(user.lastMessagesId);
    setDataLoaded(true);
  }, []);

  const payload = useMemo(() => ({ GetLastMessages: { from: lastLength } }), [lastLength]);

  return (
    <>
      {dataLoaded ? (
        <GetMessages
          key={user.chatId}
          payload={payload}
          setLastLength={setLastLength}
          user={user}
          symKey={symkey}
        />
      ) : null}
    </>
  );
}
