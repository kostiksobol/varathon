import { useAccount } from '@gear-js/react-hooks';
import React from 'react'
import GetPubKey from './GetPubKey';
import ChatsForm from './ChatsForm';
import { Outlet } from 'react-router-dom';

export type YourInfo = {
  privateKey: string;
  publivKey: string;
  login: string;
  name: string;
}

export default function MainLayer() {
  const { account } = useAccount();
  const raw_info = account ? localStorage.getItem(account.address) : undefined;

  return (
      <div
      style={{
        display: 'flex',
        height: '85vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#333',
        color: '#fff',
      }}>
          {raw_info == null && account ? (<GetPubKey address={account.decodedAddress}/>) : null}
          
          {raw_info !== null && raw_info !== undefined ? (
              <>
              <div style={{
                  position: 'fixed',
                  top: '10px',
                  right: '10px',
                  padding: '10px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
              }}>
                  <div>Login: {JSON.parse(raw_info).login}</div>
                  <div>Name: {JSON.parse(raw_info).name}</div>
              </div>
              <ChatsForm />
              <div style={{ width: '70%'}}>
                  <Outlet />
              </div>
              </>
          ) : null}
      </div>
  )
}

