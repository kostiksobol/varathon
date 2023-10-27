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
import { IUser, User, db, getSymmetricKeyByChatId, getUsersByChatId } from 'utils/indexedDB';
import { stringToHex } from '@polkadot/util';

export default function UsersForm() {
  const params = useParams<{ id: HexString }>();
  const chat_id = params.id!;
  const api = useContext(gearApiContext);

  const [symKey, setSymKey] = useState<string>();
  const [users, setUsers] = useState<User[]>([]);

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

  function handleAddUserClick(newUser: string){
      return () => {
        if(api){
          if(newUser[0] === '0' && newUser[1] === 'x'){
            readContractState<{User: {res: {address: HexString, login: string, name: string, pubkey: string}}}>(api, MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, {GetUserByAddress: {address: newUser}})
            .then((state) => {
                if(symKey){
                    if(state.User.res.pubkey.length > 0){
                      setShowNotification(false);
                      const encrypted_symkey = encryptDataWithPubKey(state.User.res.pubkey, symKey);
                      addUserMessage({    Add: {
                          user: newUser,
                          encrypted_symkey,
                      }}); 
                    }
                    else{
                      setShowNotification(true);
                      setTimeout(() => {
                        setShowNotification(false);
                      }, 2000);
                    }
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
          else{
            readContractState<{User: {res: {address: HexString, login: string, name: string, pubkey: string}}}>(api, MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, {GetUserByLogin: {login: newUser}})
            .then((state) => {
                if(symKey){
                    if(state.User.res.pubkey.length > 0){
                      setShowNotification(false);
                      const encrypted_symkey = encryptDataWithPubKey(state.User.res.pubkey, symKey);
                      addUserMessage({    Add: {
                          user: state.User.res.address,
                          encrypted_symkey,
                      }}); 
                    }
                    else{
                      setShowNotification(true);
                      setTimeout(() => {
                        setShowNotification(false);
                      }, 2000);
                    }
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
  }
    
  
  return (
    <div
    style={{
      padding: '0.5rem',
      backgroundColor: '#222',
    }}
    >
      {users.map((user, index) => (
        <UserForm key={index} address={user.address} login={user.login} name={user.name}/>
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
