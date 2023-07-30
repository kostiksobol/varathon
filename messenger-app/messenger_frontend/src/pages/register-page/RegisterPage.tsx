import { useAccount, useSendMessage } from '@gear-js/react-hooks';
import { MAIN_CONTRACT_ADDRESS } from 'consts';
import {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom';

import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt'

import './RegisterPage.css';
import { useMainState } from 'hooks';
import { useMetadata } from 'hooks/useMetadata';
import { getRegisterPubKeyPayload } from 'utils/payloads/main-connector-payloads';
import { generateKeyPair } from 'utils/crypto-defence/public-private-key-encryption';

export default function Register() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);

  const {account} = useAccount();
  const addr = account?.address;

  const [privkey, Setprivkey] = useState<string>();

  const { state: pubkey } = useMainState<string>('get_user_pubkey', account?.decodedAddress);

  const sendMessageToMainContract = useSendMessage(MAIN_CONTRACT_ADDRESS, useMetadata(metaMainConnectorTxt));

  const handleClickRegisterButton = () => {
    const {publicKey, privateKey} = generateKeyPair();
    sendMessageToMainContract(getRegisterPubKeyPayload(publicKey));
    Setprivkey(privateKey);
  }

  useEffect(() => {
    if(pubkey !== undefined){
      if(pubkey.length > 50 && addr && privkey){
        localStorage.setItem(addr, privkey);
        setIsRegister(true);
      }
    }
  }, [pubkey]);

  const handleClickContinueButton = () => {
    navigate(`/`);
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
