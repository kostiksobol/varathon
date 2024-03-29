import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useSendMessage } from '@gear-js/react-hooks';
import { MAIN_CONTRACT_ADDRESS } from 'consts';
import { generateKeyPair } from 'utils/crypto-defence/public-private-key-encryption';
import { readContractState, useContractState } from 'hooks/hooks';
import { useProgramMetadata } from 'hooks';

import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt';

import './RegisterPage.css';
import { gearApiContext } from 'context';
import { HexString } from '@gear-js/api';
import { YourInfo } from 'pages/main-page/MainLayer';

export default function Register() {
  const api = useContext(gearApiContext);
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const { account } = useAccount();
  const addr = account?.address;
  const [privkey, Setprivkey] = useState<string>();
  const [login, setLogin] = useState('');
  const [name, setName] = useState('');

  const [showNotification, setShowNotification] = useState(false);

  const { state: user } = useContractState<{User: {res: {address: HexString, login: string, name: string, pubkey: string, contract: HexString}}}>(
    MAIN_CONTRACT_ADDRESS,
    metaMainConnectorTxt,
    { GetUserByAddress: { address: account!.decodedAddress } }
  );

  const sendMessageToMainContract = useSendMessage(
    MAIN_CONTRACT_ADDRESS,
    useProgramMetadata(metaMainConnectorTxt)
  );

  const handleClickRegisterButton = () => {
    if (login.trim() === '') {
      alert('Please enter a valid Login.');
      return;
    }
    if(api){
      readContractState<{User: {res: {address: HexString, login: string, name: string, pubkey: string, contract: HexString}}}>(api, MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, {GetUserByLogin: {login}})
      .then((state) => {
        if(state.User.res.pubkey.length > 0){
          setShowNotification(true);
          setTimeout(() => {
            setShowNotification(false);
          }, 2000);
        }
        else{
          const { publicKey, privateKey } = generateKeyPair();
          sendMessageToMainContract({ Register: { login, name, pubkey: publicKey } });
          Setprivkey(privateKey);
        }
      })
      .catch((error) => {
        console.error(error);
      })
    }
  };

  useEffect(() => {
    if (user && user.User) {
      if (user.User.res.pubkey.length > 50 && addr && privkey) {
        const info: YourInfo = {privateKey: privkey, publivKey: user.User.res.pubkey, login: user.User.res.login, name: user.User.res.name, contract: user.User.res.contract};
        localStorage.setItem(addr, JSON.stringify(info));
        setIsRegister(true);
      }
    }
  }, [user]);

  const handleClickContinueButton = () => {
    if(addr && localStorage.getItem(addr)){
      navigate(`/${account?.meta.name}`);
    }
  };

  const handleCopyPrivateKey = () => {
    if (addr) {
      const raw_info = localStorage.getItem(addr);
      const privateKeyToCopy = raw_info ? JSON.parse(raw_info).privateKey : "";
      if (privateKeyToCopy) {
        navigator.clipboard.writeText(privateKeyToCopy);
        alert('Private key copied to clipboard!');
      }
    }
  };

  return (
    <div className="register-container">
      {!isRegister ? (
        <div className="registration-form">
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
              Login taken by someone
            </div>
          )}
          <input
            type="text"
            placeholder="Login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="input-field"
            style={{
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              padding: '10px',
              marginBottom: '20px',
              borderRadius: '5px',
              width: '100%',
              maxWidth: '500px',
              fontSize: '14px',
            }}
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            style={{
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              padding: '10px',
              marginBottom: '20px',
              borderRadius: '5px',
              width: '100%',
              maxWidth: '500px',
              fontSize: '14px',
            }}
          />
          <button className="register-button" onClick={handleClickRegisterButton}>
            Register
          </button>
        </div>
      ) : (
        <div className="registered-section">
          {addr ? (
            <>
              <div className="private-key-container">
                <h2>Your private key:</h2>
                <div className="private-key-content">
                  {localStorage.getItem(addr) !== null ? JSON.parse(localStorage.getItem(addr)!).privateKey : null}
                  <button className="copy-button" onClick={handleCopyPrivateKey}>Copy</button>
                </div>
              </div>
              <button className="continue-button" onClick={handleClickContinueButton}>Continue</button>
            </>
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  );
}

