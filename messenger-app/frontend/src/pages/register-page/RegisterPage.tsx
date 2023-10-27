// import { useAccount, useSendMessage } from '@gear-js/react-hooks';
// import { MAIN_CONTRACT_ADDRESS } from 'consts';
// import {useEffect, useState} from 'react'
// import { useNavigate } from 'react-router-dom';

// import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt';

// import './RegisterPage.css';
// import { generateKeyPair } from 'utils/crypto-defence/public-private-key-encryption';
// import { useContractState } from 'hooks/hooks';
// import { useProgramMetadata } from 'hooks';

// export default function Register() {
//   const navigate = useNavigate();

//   const [isRegister, setIsRegister] = useState(false);

//   const {account} = useAccount();
//   const addr = account?.address;

//   const [privkey, Setprivkey] = useState<string>();

//   const { state: pubkey } = useContractState<{UserPubKey: {res: string}}>(MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, {GetUserPubKey: {user: account!.decodedAddress}});

//   const sendMessageToMainContract = useSendMessage(MAIN_CONTRACT_ADDRESS, useProgramMetadata(metaMainConnectorTxt));

//   const handleClickRegisterButton = () => {
//     const {publicKey, privateKey} = generateKeyPair();
//     sendMessageToMainContract({RegisterPubKey: {pubkey: publicKey}});
//     Setprivkey(privateKey);
//   }

//   useEffect(() => {
//     if(pubkey && pubkey.UserPubKey){
//       if(pubkey.UserPubKey.res.length > 50 && addr && privkey){
//         localStorage.setItem(addr, privkey);
//         localStorage.setItem(account.decodedAddress, pubkey.UserPubKey.res);
//         setIsRegister(true);
//       }
//     }
//   }, [pubkey]);

//   const handleClickContinueButton = () => {
//     navigate(`/${account?.meta.name}`);
//   }

//   const handleCopyPrivateKey = () => {
//     if (addr) {
//       const privateKeyToCopy = localStorage.getItem(addr);
//       if (privateKeyToCopy) {
//         navigator.clipboard.writeText(privateKeyToCopy);
//         alert('Private key copied to clipboard!');
//       }
//     }
//   }

//   return (
//     <div className="register-container">
//       {!isRegister ? (
//         <button className="register-button" onClick={handleClickRegisterButton}>Register</button>
//       ) : (
//         <div className="registered-section">
//           {addr ? (
//             <>
//               <div className="private-key-container">
//                 <h2>Your private key:</h2>
//                 <div className="private-key-content">
//                   {localStorage.getItem(addr)}
//                   <button className="copy-button" onClick={handleCopyPrivateKey}>Copy</button>
//                 </div>
//               </div>
//               <button className="continue-button" onClick={handleClickContinueButton}>Continue</button>
//             </>
//           ) : (
//             <></>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

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

  const { state: user } = useContractState<{User: {res: {address: HexString, login: string, name: string, pubkey: string}}}>(
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
      readContractState<{User: {res: {address: HexString, login: string, name: string, pubkey: string}}}>(api, MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, {GetUserByLogin: {login}})
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
        // localStorage.setItem(addr, privkey);
        // localStorage.setItem(account.decodedAddress, user.User.res.pubkey);
        const info: YourInfo = {privateKey: privkey, publivKey: user.User.res.pubkey, login: user.User.res.login, name: user.User.res.name};
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
              maxWidth: '500px', // Increased max-width to accommodate longer keys
              fontSize: '14px', // Adjusted font size to fit longer text
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
              maxWidth: '500px', // Increased max-width to accommodate longer keys
              fontSize: '14px', // Adjusted font size to fit longer text
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

