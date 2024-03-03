import { HexString } from '@gear-js/api';
import React, { useEffect, useMemo, useState } from 'react'
import { IUser, User, db, getSymmetricKeyByChatId, getUsersByChatId } from 'utils/indexedDB';
import GetMessages from './GetMessages';
import MessagesLoader from './MessagesLoader';
import { useAccount } from '@gear-js/react-hooks';

export default function MessagesLoaderForAllUsers({chatId}: {chatId: string}) {
    const [users, setUsers] = useState<IUser[]>([]);
    const [symKey, setSymKey] = useState<CryptoKey>();
    const {account} = useAccount();

    const [dataLoaded, setDataLoaded] = useState(false);
    useEffect(() => {
        getUsersByChatId(chatId, account!.address)
        .then((allUsers) => {
            setUsers(allUsers);
            setDataLoaded(true);
        })
        .catch((error) => {
            console.error(error);
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
        const creatingHook = function (primKey: any, obj: IUser, trans: any) {
            if (obj.chatId == chatId && obj.userId == account!.address) {
              setUsers(prevUsers => [...prevUsers, obj])
            }
          };
      
          db.users.hook('creating', creatingHook);
          return (() => {
            db.users.hook('creating').unsubscribe(creatingHook);
          });
    }, []);

    // console.log(chatId);
    // console.log(users);
    // console.log(dataLoaded);
    // console.log(symKey);

    return (
        <>
            {dataLoaded && symKey ? (
                users.map((user) => (
                    <MessagesLoader key={chatId} user={user} symkey={symKey}/>
                ))
        ) : null}
        </>
      );
}
