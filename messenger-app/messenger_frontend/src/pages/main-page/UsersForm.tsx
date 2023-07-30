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
import { useReadMainStateOnce } from 'hooks/api';

export default function UsersForm() {
  const params = useParams<{ id: HexString }>();
  const chat_id = params.id!;

  const api = useContext(gearApiContext);

  const symKey = useContext(ChatIds_SymKeys_Context)?.get(chat_id);
  
  const { state: users } = useGroupState<HexString[]>('get_all_users', chat_id, null);

  const addUserMessage = useSendMessage(chat_id, useMetadata(metaGroupConnectionTxt));

  const [addUser, setAddUser] = useState<HexString>();
  const add_user_pubkey = useReadMainStateOnce<string>(api, 'get_user_pubkey', addUser);
  const [clickCounter, setClickCounter] = useState(0);

  useEffect(() => {
      if(symKey && add_user_pubkey && addUser){
          try{
            const encrypted_symkey = encryptDataWithPubKey(add_user_pubkey, symKey);
            addUserMessage(getAddNewUserToGroupPayload(addUser, encrypted_symkey)); 
          }
          catch{
            console.log('The user is not registered');
          }
      }
  }, [clickCounter, add_user_pubkey, addUser])

  function handleAddUserClick(newUser: HexString){
      return () => {
        setAddUser(newUser);
        setClickCounter((prevValue) => (prevValue + 1));
      }
  }
    
  return (
    <div
    style={{
      padding: '1rem',
      backgroundColor: '#222',
    }}
    >
      {users?.map((user, index) => (
        <UserForm key={index} address={user} />
      ))}
      <div><AddNewUserForm handleAddUserClick={handleAddUserClick}/></div>
    </div>
  )
}
