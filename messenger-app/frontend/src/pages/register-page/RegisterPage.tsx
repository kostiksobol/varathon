import { useAccount, useSendMessage } from '@gear-js/react-hooks';
import { MAIN_CONTRACT_ADDRESS } from 'consts';
import {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom';

import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt';

import './RegisterPage.css';
import { generateKeyPair } from 'utils/crypto-defence/public-private-key-encryption';
import { useContractState } from 'hooks/hooks';
import { useProgramMetadata } from 'hooks';

export default function Register() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);

  const {account} = useAccount();
  const addr = account?.address;

  const [privkey, Setprivkey] = useState<string>();

  const { state: pubkey } = useContractState<{UserPubKey: {res: string}}>(MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, {GetUserPubKey: {user: account!.decodedAddress}});

  const sendMessageToMainContract = useSendMessage(MAIN_CONTRACT_ADDRESS, useProgramMetadata(metaMainConnectorTxt));

  const handleClickRegisterButton = () => {
    const {publicKey, privateKey} = generateKeyPair();
    sendMessageToMainContract({RegisterPubKey: {pubkey: publicKey}});
    Setprivkey(privateKey);
  }

  useEffect(() => {
    if(pubkey && pubkey.UserPubKey){
      if(pubkey.UserPubKey.res.length > 50 && addr && privkey){
        localStorage.setItem(addr, privkey);
        localStorage.setItem(account.decodedAddress, pubkey.UserPubKey.res);
        setIsRegister(true);
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
