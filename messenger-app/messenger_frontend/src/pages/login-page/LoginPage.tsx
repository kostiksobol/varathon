import { useAccount } from '@gear-js/react-hooks';
import { MyPubKey, gearApiContext } from 'context';
import { useReadMainStateOnce } from 'hooks/api';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkCorrectPrivateAndPublicKeys } from 'utils/crypto-defence/public-private-key-encryption';

export default function LoginPage() {
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();
  const { account } = useAccount();
  const addr = account?.address;

  const api = useContext(gearApiContext);

  const myPubKey = useReadMainStateOnce<string>(api, 'get_user_pubkey', account?.decodedAddress);

  const [showNotification, setShowNotification] = useState(false);

  const handleButtonClick = () => {
    const privKey = inputValue;
    if (myPubKey && addr) {
      try{
        if (checkCorrectPrivateAndPublicKeys(privKey, myPubKey.slice(2))) {
          localStorage.setItem(addr, privKey);
          navigate(`/${account?.meta.name}`);
        } else {
          setShowNotification(true);
          setTimeout(() => {
            setShowNotification(false);
          }, 2000);
        }
      }
      catch{
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 2000);
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#222',
        color: 'white',
        padding: '20px', // Added padding for better spacing
      }}
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter your private key"
        style={{
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '5px',
          width: '100%',
          maxWidth: '500px', // Increased max-width to accommodate longer keys
          fontSize: '14px', // Adjusted font size to fit longer text
        }}
      />
      <button
        onClick={handleButtonClick}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
        }}
      >
        Login
      </button>
      {showNotification && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#333',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '20px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
          }}
        >
          Wrong private key
        </div>
      )}
    </div>
  );
}
