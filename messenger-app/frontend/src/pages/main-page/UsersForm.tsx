import { HexString } from '@gear-js/api';
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { UserForm } from './utilts/UserForm';
import { useAccount, useSendMessage } from '@gear-js/react-hooks';

import metaGroupConnectionTxt from 'assets/meta/group_connection.meta.txt'
import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt'
import AddNewUserForm from './UI/AddNewUserForm';
import { decryptDataWithPrivKey, encryptDataWithPubKey } from 'utils/crypto-defence/public-private-key-encryption';
import { useProgramMetadata } from 'hooks';
import { gearApiContext } from 'context';
import { readContractState } from 'hooks/hooks';
import { MAIN_CONTRACT_ADDRESS } from 'consts';
import { IUser, db, getSymmetricKeyByChatId, getUsersByChatId } from 'utils/indexedDB';

export default function UsersForm() {
  const params = useParams<{ id: HexString }>();
  const chat_id = params.id!;
  const api = useContext(gearApiContext);

  const [symKey, setSymKey] = useState<string>();
  const [users, setUsers] = useState<HexString[]>([]);

  useEffect(() => {
      getUsersByChatId(chat_id)
      .then((allUsers) => {
          setUsers(allUsers.map((msg) => {
              return msg.user;
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

      const creatingHook = function(primKey: any, obj: IUser, trans: any) {
          if(obj.chatId == chat_id){
              setUsers(prevUsers => [...prevUsers, obj.user])
          }
        };

        db.users.hook('creating', creatingHook);
        return(() => {
          db.users.hook('creating').unsubscribe(creatingHook);
        });
  }, [chat_id]);

  const addUserMessage = useSendMessage(chat_id, useProgramMetadata(metaGroupConnectionTxt));
  const [showNotification, setShowNotification] = useState(false);

  function handleAddUserClick(newUser: HexString){
      return () => {
        if(api){
            readContractState<{UserPubKey: {res: string}}>(api, MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, {GetUserPubKey: {user: newUser}})
            .then((state) => {
                if(symKey){
                    setShowNotification(false);
                    console.log(symKey);
                    console.log(state.UserPubKey.res);
                    const encrypted_symkey = encryptDataWithPubKey(state.UserPubKey.res, symKey);
                    addUserMessage({    Add: {
                        user: newUser,
                        encrypted_symkey,
                    }}); 
                }
            })
          .catch((error) => {
            setShowNotification(true);
            console.error(error)
            setTimeout(() => {
              setShowNotification(false);
            }, 2000);
          });
        }
      }
  }
    
  
  return (
    <div
    style={{
      padding: '0.5rem',
      backgroundColor: '#222',
    }}
    >
      {users.map((user, index) => (
        <UserForm key={index} address={user} />
      ))}
        {showNotification && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            backgroundColor: '#222',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '20px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
          }}
        >
          User is not registered
        </div>
      )}
      <div><AddNewUserForm handleAddUserClick={handleAddUserClick}/></div>
    </div>
  )
}
