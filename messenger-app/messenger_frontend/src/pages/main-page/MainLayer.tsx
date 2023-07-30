import React, { useContext, useEffect, useState } from 'react'
import ChatsForm from './ChatsForm'
import { Outlet, useNavigate } from 'react-router-dom'
import { useMainState } from 'hooks';
import { useAccount } from '@gear-js/react-hooks';
import { ChatIds, ChatIds_SymKeys_Context, MyPubKey, gearApiContext } from 'context';
import { HexString } from '@gear-js/api';
import { useReadGroupStatesOnce, useReadMainStateOnce } from 'hooks/api';
import { decryptDataWithPrivKey, fuckDecryptDataWithPrivKey } from 'utils/crypto-defence/public-private-key-encryption';

export default function MainLayer() {
    const navigate = useNavigate();
    const api = useContext(gearApiContext);
    
    const { account } = useAccount();

    const myPubKey = useReadMainStateOnce<string>(api, 'get_user_pubkey', account?.decodedAddress);

    const { state: chat_ids } = useMainState<HexString[]>('get_user_connections', account?.decodedAddress);

    const help_decrypt_symKey = (encrypted_symKey: string) => {
      if(account){
        let privKey = localStorage.getItem(account.address);
        if(privKey){
          return decryptDataWithPrivKey(privKey, encrypted_symKey.slice(2));
        }
      }
      return "";
    }

    const chatIds_symKeys = useReadGroupStatesOnce<string, string>(api, 'get_user_encrypted_symkey', chat_ids, help_decrypt_symKey, account !== undefined && localStorage.getItem(account.address) !== undefined, account?.decodedAddress);

    useEffect(() => {
        if(myPubKey){
          if(myPubKey.length < 50){
              navigate(`/register`, {replace: true});
          }
          else{
            const addr = account?.address;
            if(addr){
              const privkey = localStorage.getItem(addr);
              if(!privkey){
                navigate(`/login`, {replace: true});
              }
            }
          }
        }
    }, [myPubKey]);
    
  return (
    <ChatIds.Provider value={chat_ids}>
      <MyPubKey.Provider value={myPubKey}>
        <ChatIds_SymKeys_Context.Provider value={chatIds_symKeys}>
          <div
            style={{
              display: 'flex',
              height: '100vh',
              fontFamily: 'Arial, sans-serif',
              backgroundColor: '#333',
              color: '#fff',
            }}
          >
              <ChatsForm />
              <div style={{ width: '70%'}}>
                <Outlet />
              </div>
          </div>
        </ChatIds_SymKeys_Context.Provider>
      </MyPubKey.Provider>
    </ChatIds.Provider>
  )
}
