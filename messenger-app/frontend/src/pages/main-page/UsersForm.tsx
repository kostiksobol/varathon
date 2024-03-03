import { HexString } from '@gear-js/api';
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { UserForm } from './utilts/UserForm';
import { useAccount, useSendMessage } from '@gear-js/react-hooks';

import metaGroupConnectionTxt from 'assets/meta/user_contract.meta.txt'
import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt'
import AddNewUserForm from './UI/AddNewUserForm';
import { decryptDataWithPrivKey, encryptDataWithPubKey } from 'utils/crypto-defence/public-private-key-encryption';
import { useProgramMetadata } from 'hooks';
import { gearApiContext } from 'context';
import { readContractState } from 'hooks/hooks';
import { MAIN_CONTRACT_ADDRESS } from 'consts';
import { IUser, User, db, getNameByChatId, getSymmetricKeyByChatId, getUsersByChatId } from 'utils/indexedDB';
import { stringToHex } from '@polkadot/util';
import { YourInfo } from './MainLayer';
import { Invitation, InvitationMessage } from './ChatsForm';
import { encryptText, stringToSymmetricKey } from 'utils/crypto-defence/symmetric-key-encryption';
import { createHMACWithNonce } from 'utils/crypto-defence/HMAC';

export default function UsersForm() {
  const [contract, setContract] = useState<HexString>("0x");
  const { account } = useAccount();

  const params = useParams<{ id: string }>();
  const chat_id = params.id!;
  const api = useContext(gearApiContext);

  const [symKey, setSymKey] = useState<CryptoKey>();
  const [users, setUsers] = useState<User[]>([]);
  const [chatName, setChatName] = useState<string>();

  useEffect(() => {
    const raw_info = localStorage.getItem(account!.address);
    if (raw_info) {
      const info: YourInfo = JSON.parse(raw_info);
      setContract(info.contract);
    }

    getUsersByChatId(chat_id, account!.address)
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
        if (symkey) {
          setSymKey(symkey);
        }
        else {
          console.error("Error retriving symkey:");
        }
      });

    getNameByChatId(chat_id)
      .then((name) => {
        if (name) {
          setChatName(name);
        }
        else {
          console.error("Error retriving name:");
        }
      });

    const creatingHook = function (primKey: any, obj: IUser, trans: any) {
      if (obj.chatId == chat_id && obj.userId == account!.address) {
        setUsers(prevUsers => [...prevUsers, obj.user])
      }
    };

    db.users.hook('creating', creatingHook);
    return (() => {
      db.users.hook('creating').unsubscribe(creatingHook);
    });
  }, [chat_id]);

  const addUserMessage = useSendMessage(contract, useProgramMetadata(metaGroupConnectionTxt));
  const [showNotification, setShowNotification] = useState(false);

  // function handleAddUserClickk(newUser: string){
  //   return async () => {
  //     if(api){
  //       if(newUser[0] === '0' && newUser[1] === 'x'){
  //         const state = await readContractState<{ User: { res: { address: HexString, login: string, name: string, pubkey: string } } }>(api, MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, { GetUserByAddress: { address: newUser } });
  //         if(symKey && state.User.res.pubkey.length > 0){

  //         }
  //       }
  //       else{

  //       }
  //     }
  //   }
  // }

  function handleAddUserClick(newUser: string) {
    return () => {
      if (api) {
        if (newUser[0] === '0' && newUser[1] === 'x') {
          readContractState<{ User: { res: { address: HexString, login: string, name: string, pubkey: string } } }>(api, MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, { GetUserByAddress: { address: newUser } })
            .then((state) => {
              if (symKey) {
                if (state.User.res.pubkey.length > 0) {
                  setShowNotification(false);

                  const members = users.map(user => user.address);
                  members.push(state.User.res.address);

                  if (chatName) {
                    const invitation_message: InvitationMessage = { name: chatName, invited: state.User.res.address, members };
                    encryptText(JSON.stringify(invitation_message), symKey).then(encrypted_content => {
                      createHMACWithNonce(chat_id).then(tag => {
                        const invitation: Invitation = { sym_key: chat_id, from_contract_id: contract };
                        const record = encryptDataWithPubKey(state.User.res.pubkey, JSON.stringify(invitation));
                        addUserMessage({ AddInvitation: { encrypted_content, tag, record } });
                      })
                    })
                  }
                }
                else {
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
        else {
          readContractState<{ User: { res: { address: HexString, login: string, name: string, pubkey: string } } }>(api, MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, { GetUserByLogin: { login: newUser } })
            .then((state) => {
              if (symKey) {
                if (state.User.res.pubkey.length > 0) {
                  setShowNotification(false);

                  const members = users.map(user => user.address);
                  members.push(state.User.res.address);

                  if (chatName) {
                    const invitation_message: InvitationMessage = { name: chatName, invited: state.User.res.address, members };
                    encryptText(JSON.stringify(invitation_message), symKey).then(encrypted_content => {
                      createHMACWithNonce(chat_id).then(tag => {
                        const invitation: Invitation = { sym_key: chat_id, from_contract_id: contract };
                        const record = encryptDataWithPubKey(state.User.res.pubkey, JSON.stringify(invitation));
                        addUserMessage({ AddInvitation: { encrypted_content, tag, record } });
                      })
                    })
                  }
                }
                else {
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
        <UserForm key={index} address={user.address} login={user.login} name={user.name} />
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
      <div><AddNewUserForm handleAddUserClick={handleAddUserClick} /></div>
    </div>
  )
}
