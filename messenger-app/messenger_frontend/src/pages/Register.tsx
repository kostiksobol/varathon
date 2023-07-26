import { useAccount, useSendMessage } from '@gear-js/react-hooks';
import { MAIN_CONTRACT_ADDRESS } from 'consts';
import {useEffect, useState} from 'react'
import { useMetadata } from './useMetadata';
import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt'
import { useMainState } from './Main';
import { useNavigate } from 'react-router-dom';

import './Register.css';

var forge = require('node-forge');
// var cryptico = require('cryptico');

const getRegisterPubKeyPayload = (pubkey: string) => {
  return { RegisterPubkey: { pubkey } };
}

// Function to generate an RSA key pair and return keys as strings
function generateKeyPair(): { publicKey: string; privateKey: string } {
  const keyPair = forge.pki.rsa.generateKeyPair({ bits: 512, e: 0x10001 });

  const publicKeyBase64 = forge.pki.publicKeyToPem(keyPair.publicKey);
  const privateKeyBase64 = forge.pki.privateKeyToPem(keyPair.privateKey);

  return {
    publicKey: publicKeyBase64,
    privateKey: privateKeyBase64,
  };
}

// function generateKeyPair() {
//   const key = cryptico.generateRSAKey(1024, '10001');
//   return {
//     privateKey: key.toPrivatePem('base64'),
//     publicKey: key.toPublicPem('base64') 
//   };
// }


export default function Register() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);

  const {account} = useAccount();
  const addr = account?.address;

  const [privkey, Setprivkey] = useState<string>();

  const { state: pubkey } = useMainState<string>('get_user_pubkey', account?.decodedAddress);

  const lalala = useSendMessage(MAIN_CONTRACT_ADDRESS, useMetadata(metaMainConnectorTxt));

  const handleClickRegisterButton = () => {
    const {publicKey, privateKey} = generateKeyPair();
    // console.log(publicKey);
    lalala(getRegisterPubKeyPayload(publicKey));
    Setprivkey(privateKey);
  }

  useEffect(() => {
    if(pubkey !== undefined){
      if(pubkey.length > 50){
        console.log(pubkey);
        if(addr && privkey){
          localStorage.setItem(addr, privkey);
          setIsRegister(true);
        }
      }
    }
  }, [pubkey]);

  const handleClickContinueButton = () => {
    navigate(`/${account?.meta.name}`);
  }

  const handleCopyPrivateKey = () => {
    if (addr) {
      const privateKeyToCopy = localStorage.getItem(addr);
      if (privateKeyToCopy) {
        navigator.clipboard.writeText(privateKeyToCopy);
        alert('Private key copied to clipboard!');
      }
    }
  }

  return (
    <div className="register-container">
      {!isRegister ? (
        <button className="register-button" onClick={handleClickRegisterButton}>Register</button>
      ) : (
        <div className="registered-section">
          {addr ? (
            <>
              <div className="private-key-container">
                <h2>Your private key:</h2>
                <div className="private-key-content">
                  {localStorage.getItem(addr)}
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
  )
}
