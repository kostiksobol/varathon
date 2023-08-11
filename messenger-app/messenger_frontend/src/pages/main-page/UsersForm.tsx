import { HexString } from '@gear-js/api';
import { useGroupState, useMainState } from 'hooks';
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { UserForm } from './utilts/UserForm';
import { useAccount, useSendMessage } from '@gear-js/react-hooks';
import { useMetadata } from 'hooks/useMetadata';

import metaGroupConnectionTxt from 'assets/meta/group_connection.meta.txt'
import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt'
import AddNewUserForm from './UI/AddNewUserForm';
import { decryptDataWithPrivKey, encryptDataWithPubKey } from 'utils/crypto-defence/public-private-key-encryption';
import { getAddNewUserToGroupPayload } from 'utils/payloads/group-connection-payloads';
import { ChatIds_SymKeys_Context, gearApiContext } from 'context';
import { ReadMainState, useReadMainStateOnce } from 'hooks/api';

export default function UsersForm() {
  const params = useParams<{ id: HexString }>();
  const chat_id = params.id!;

  const api = useContext(gearApiContext);

  const symKey = useContext(ChatIds_SymKeys_Context)?.get(chat_id);
  
  const { state: users } = useGroupState<HexString[]>('get_all_users', chat_id, null);

  const addUserMessage = useSendMessage(chat_id, useMetadata(metaGroupConnectionTxt));

  // const [addUser, setAddUser] = useState<HexString>();
  // const add_user_pubkey = useReadMainStateOnce<string>(api, 'get_user_pubkey', addUser);
  // const [clickCounter, setClickCounter] = useState(0);

  // useEffect(() => {
  //     if(symKey && add_user_pubkey && addUser){
  //         try{
  //           setShowNotification(false);
  //           const encrypted_symkey = encryptDataWithPubKey(add_user_pubkey, symKey);
  //           addUserMessage(getAddNewUserToGroupPayload(addUser, encrypted_symkey)); 
  //         }
  //         catch{
  //           setShowNotification(true);
  //           setTimeout(() => {
  //             setShowNotification(false);
  //           }, 2000);
  //         }
  //     }
  // }, [clickCounter, add_user_pubkey, addUser])
  const [showNotification, setShowNotification] = useState(false);

  function handleAddUserClick(newUser: HexString){
      return () => {
        // setAddUser(newUser);
        // setClickCounter((prevValue) => (prevValue + 1));
        // setShowNotification(false);
        if(api){
          ReadMainState<string>(api, 'get_user_pubkey', newUser).then((add_pub_key) => {
            if(symKey){
              setShowNotification(false);
              const encrypted_symkey = encryptDataWithPubKey(add_pub_key, symKey);
              addUserMessage(getAddNewUserToGroupPayload(newUser, encrypted_symkey)); 
            }
          })
          .catch((err) => {
            setShowNotification(true);
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
      {users?.map((user, index) => (
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
