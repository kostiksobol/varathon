import { useAccount } from '@gear-js/react-hooks';
import React from 'react'
import GetPubKey from './GetPubKey';
import ChatsForm from './ChatsForm';
import { Outlet } from 'react-router-dom';

export default function MainLayer() {
    const { account } = useAccount();
    const myPrivKey = account ? localStorage.getItem(account.address) : undefined;

    return (
        <div
        style={{
          display: 'flex',
          height: '85vh',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#333',
          color: '#fff',
        }}>
            {myPrivKey == null && account ? (<GetPubKey address={account.decodedAddress}/>) : null}
            
            {myPrivKey !== null && myPrivKey !== undefined ? (<>
            <ChatsForm />
              <div style={{ width: '70%'}}>
                <Outlet />
              </div>
            </>) : null}
        </div>
    )
}
