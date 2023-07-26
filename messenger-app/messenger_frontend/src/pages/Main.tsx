var forge = require('node-forge');
var CryptoJS = require('crypto-js');

// Function to generate a random symmetric key
function generateSymmetricKey(): string {
  return CryptoJS.lib.WordArray.random(32 / 8).toString();
}

// Function to encrypt data using a symmetric key
function encryptData(data: string, key: string): string {
  const a =  CryptoJS.AES.encrypt(data, key).toString();
  return a;
}

// Function to decrypt data using a symmetric key
function decryptData(encryptedData: string, key: string): string | null {
  try {
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
    return decryptedData;
  } catch (error) {
    return '/////////NOT A VALID STRING//////////';
  }
}

// var cryptico = require('cryptico');

// function encryptDataWithPubKey(data: string, publicKey: string): string {
//   const encrypted = cryptico.publicEncrypt(data, publicKey);
//   return encrypted;
// }

// function decryptDataWithPrivKey(encryptedData: string, privateKey: string): string {
//   const decrypted = cryptico.privateDecrypt(encryptedData, privateKey);
//   return decrypted.toString(CryptoJS.enc.Utf8);
// }



// Function to encrypt data using RSA public key
function encryptDataWithPubKey(publicKey: string, data: string): string {
  const rsaPublicKey = forge.pki.publicKeyFromPem(publicKey);
  
  // Encrypt the data
  let encrypted = rsaPublicKey.encrypt(data, 'RSA-OAEP');

  // encrypted is a Uint8Array, convert to base64 string
  encrypted = forge.util.encode64(encrypted);

  return encrypted;
}

// Add error handling for decryption failures
function decryptDataWithPrivKey(privateKey: string, encryptedData: string): string {
  const rsaPrivateKey = forge.pki.privateKeyFromPem(privateKey);

  // Decode the base64 encrypted data to Uint8Array
  let encrypted = forge.util.decode64(encryptedData);

  // Decrypt the data
  let decrypted = rsaPrivateKey.decrypt(encrypted, 'RSA-OAEP');

  // Convert the Uint8Array to a string
  // decrypted = String.fromCharCode.apply(null, decrypted);

  return decrypted
}












import React, { useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
  Outlet,
} from 'react-router-dom';

import { useReadFullState, useSendMessage, useReadWasmState } from '@gear-js/react-hooks';
import { HexString } from '@polkadot/util/types';
import metaGroupConnectionTxt from 'assets/meta/group_connection.meta.txt'
import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt'
import stateMainConnectorMetaWasm from 'assets/wasm/main_connector_state.meta.wasm';
import stateGroupConnectionMetaWasm from 'assets/wasm/group_connection_state.meta.wasm';
import { useAccount } from '@gear-js/react-hooks';
import { useMetadata, useWasmMetadata } from './useMetadata';
import { MAIN_CONTRACT_ADDRESS } from 'consts';




export function useMainState<T>(functionName: string, payload?: any) {
  const programId = MAIN_CONTRACT_ADDRESS;
  const { buffer } = useWasmMetadata(stateMainConnectorMetaWasm);

  return useReadWasmState<T>(
    programId,
    buffer,
    functionName,
    payload,
  );
}

function useGroupState<T>(functionName: string, programId: HexString, payload?: any) {
  const { buffer } = useWasmMetadata(stateGroupConnectionMetaWasm);

  return useReadWasmState<T>(
    programId,
    buffer,
    functionName,
    payload,
  );
}

const getAddNewUserToGroupPayload = (user: HexString, encrypted_symkey: string) => {
  return { Add: { user, encrypted_symkey } };
};

const getSendMessageToGroupPayload = (encrypted_content: string) => {
  return { Send: { encrypted_content } };
};

const getCreateGroupConnectionPayload = (encrypted_symkey: string) => {
  return { CreateGroupConnection: { encrypted_symkey } };
}

// type GroupConnectionState = {
//   users: HexString[];
//   messages: Message[];
// }










export function MessagesForm() {
  const params = useParams<{ id: HexString }>();
  const chat_id = params.id!;


  // const { state } = useReadFullState<GroupConnectionState>(chat_id, useMetadata(metaGroupConnectionTxt));
  // const messages = state?.messages;

  const {account} = useAccount();
  const { state: encrypted_symkey_for_selected_chat_id} = useGroupState<string>('get_user_encrypted_symkey', chat_id, account?.decodedAddress);

  const { state: messages } = useGroupState<Message[]>('get_all_messages', chat_id, null);

  function decodeEncryptedContent(encrypted_message: string): string | null{
    if(account){
      const priv_key = localStorage.getItem(account?.address)
      if(priv_key && encrypted_symkey_for_selected_chat_id){
        const sym_key = decryptDataWithPrivKey(priv_key, encrypted_symkey_for_selected_chat_id.slice(2));
        const message = decryptData(encrypted_message, sym_key);
        return message;
      }
    }
    return null;
  }

  return (
    <div
      style={{
        width: '70%',
        padding: '1rem',
        overflowY: 'auto',
        backgroundColor: '#222',
      }}
    >
      {!messages && <div><h1>Loading ...</h1></div>}
      {messages && messages.map((message, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', color: '#ddd' }}>
            {message.from}
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              backgroundColor: '#444',
              padding: '10px',
              borderRadius: '5px',
            }}
          >
            {decodeEncryptedContent(message.encryptedContent)}
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: '#888',
              textAlign: 'right',
            }}
          >
            {new Date(
              Number(message.timestamp.toString().replace(/,/g, ''))
            ).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function UsersForm() {
  const params = useParams<{ id: HexString }>();
  const chat_id = params.id!;
  
  // const { state } = useReadFullState<GroupConnectionState>(chat_id, useMetadata(metaGroupConnectionTxt));
  // const users = state?.users;

  const { state: users } = useGroupState<HexString[]>('get_all_users', chat_id, null);

  return (
    <div
      style={{
        width: '30%',
        padding: '1rem',
        overflowY: 'auto',
        backgroundColor: '#222',
      }}
    >
      {!users && <div><h1>Loading ...</h1></div>}
      {users && users.map((user, index) => (
        // <div key={index} style={{ marginBottom: '10px' }}>
          <div key={user} style={{ fontWeight: 'bold', color: '#ddd' }}>{user}</div>
        // </div>
      ))}
    </div>
  );
}

export function MessagesUsersForm() {
  return (
    <div style={{ display: 'flex' }}>
      <MessagesForm />
      <UsersForm />
    </div>
  );
}

function Chat({ chat_id, selectedChatId,  }: { chat_id: string; selectedChatId: string }) {
  const navigate = useNavigate();
  const {account} = useAccount();

  const onClick = React.useCallback(() => {
    navigate(`/${account?.meta.name}/chat/${chat_id}`, {replace: true});
  }, [navigate, chat_id]);

  return (
      <button
        key={chat_id}
        onClick={onClick}
        style={{
          marginBottom: '10px',
          fontWeight: selectedChatId === chat_id ? 'bold' : 'normal',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: selectedChatId === chat_id ? '#444' : 'inherit',
          padding: '10px',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.3s',
          width: 'fit-content',
        }}
      >
          <div>
            <div style={{ fontWeight: 'bold', color: '#ddd' }}>{chat_id}</div>
          </div>
      </button>
  );
}
// { children }: { children: React.ReactNode }
export function ChatsForm() {
  const navigate = useNavigate();

  const [newUser, setNewUser] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const { account } = useAccount();
  const { state } = useMainState<HexString[]>('get_user_connections', account?.decodedAddress);
  const { state: pubkey } = useMainState<string>('get_user_pubkey', account?.decodedAddress);

  const [privKey, SetprivKey] = useState<string>();

  useEffect(() => {
    if(pubkey !== undefined){
      if(pubkey.length < 50){
          navigate(`/${account?.meta.name}/register`, {replace: true});
      }
      else{
        const addr = account?.address;
        if(addr){
          const privkey = localStorage.getItem(addr);
          if(privkey === null){
            navigate(`/${account?.meta.name}/login`);
          }
          else{
            SetprivKey(privkey);
          }
        }
      }
    }
  }, [pubkey]);

  const chat_ids = state;

  const params = useParams<{ id: HexString }>();
  const chat_id = params.id!;
  const selectedChatId = chat_id;

  const { state: encrypted_symkey_for_selected_chat_id} = useGroupState<string>('get_user_encrypted_symkey', selectedChatId, account?.decodedAddress);

  const addUserMessage = useSendMessage(selectedChatId, useMetadata(metaGroupConnectionTxt));
  const sendMessage = useSendMessage(selectedChatId, useMetadata(metaGroupConnectionTxt));
  const createNewChat = useSendMessage(MAIN_CONTRACT_ADDRESS, useMetadata(metaMainConnectorTxt));

  const [add_user, SetAddUser] = useState<string>();
  const {state: add_user_pubkey} = useMainState<string>('get_user_pubkey', add_user);
  const [clickCounter, setClickCounter] = useState(0);
  
  useEffect(() => {
    if(privKey && encrypted_symkey_for_selected_chat_id){
      const sym_key = decryptDataWithPrivKey(privKey, encrypted_symkey_for_selected_chat_id.slice(2));
      // const {state: user_pubkey} = useMainState<string>('get_user_pubkey', user);
      if(add_user_pubkey){
        try{
          const encrypted_symkey = encryptDataWithPubKey(add_user_pubkey, sym_key);
          addUserMessage(getAddNewUserToGroupPayload(`0x${newUser.slice(2, newUser.length)}`, encrypted_symkey)); 
        }
        catch{
          console.log('The user is not registered');
        }
      }
    }
  }, [clickCounter, add_user_pubkey])

  const handleAddUserClick = () => {
    // Implement the logic to add a new user to the current chat
    // You can use the newUser state variable to access the entered user
    if (newUser.slice(0, 2) == '0x'){
      const user = `0x${newUser.slice(2, newUser.length)}`;
      SetAddUser(user);
      setClickCounter(prevCounter => prevCounter + 1);
    }
  };

  const handleCreateChatClick = () => {
    // Implement the logic to create a new chat
    // You can use the newChat state variable to access the entered chat name
    const sym_key = generateSymmetricKey();
    console.log(sym_key);
    if(pubkey !== undefined){
      const a = pubkey.slice(2);
      console.log(a);
      const encrypted_symkey = encryptDataWithPubKey(a, sym_key);
      createNewChat(getCreateGroupConnectionPayload(encrypted_symkey));
    }
  };

  const handleSendMessageClick = () => {
    // Implement the logic to send the message
    // You can use the newMessage state variable to access the entered message
    if(newMessage === ''){
      return;
    }

    if(selectedChatId === null){
      return;
    }

    if(privKey && encrypted_symkey_for_selected_chat_id){
      const a = encrypted_symkey_for_selected_chat_id.slice(2);
      // console.log(a);
      const sym_key = decryptDataWithPrivKey(privKey, a);
      // console.log(sym_key);

      const encrypted_content = encryptData(newMessage, sym_key);
      // console.log(encrypted_content);
      // const decrypted_content = decryptData(encrypted_content, sym_key);
      // console.log(decrypted_content);

      sendMessage(getSendMessageToGroupPayload(encrypted_content));
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#333',
        color: '#fff',
      }}
    >
      <div
        style={{
          width: '40%',
          borderRight: '1px solid #555',
          backgroundColor: '#222',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
        }}
      >
        {chat_ids?.map((id) => (
          <Chat key={id} chat_id={id} selectedChatId={selectedChatId} />
        ))}
        <div style={{ marginTop: '1rem' }}>
          <input
            type="text"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            placeholder="Enter User Id"
            style={{
              marginRight: '0.5rem',
              padding: '0.5rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#444',
              color: '#fff',
            }}
          />
          <button
            onClick={handleAddUserClick}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#007bff',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
          >
            Add New User in the Chat
          </button>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={handleCreateChatClick}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#007bff',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
          >
            Create New Chat
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '1rem' }}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter your message"
            style={{
              marginBottom: '1rem',
              padding: '0.5rem',
              border: 'none',
              borderRadius:'4px',
              backgroundColor: '#444',
              color: '#fff',
              height: '100px',
              resize: 'vertical',
            }}
          />
          <button
            onClick={handleSendMessageClick}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#007bff',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
          >
            Send Message
          </button>
        </div>
      </div>
      <div style={{ width: '70%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}

type Chat = {
  id: HexString;
  messages: Message[];
};

type Message = {
  from: HexString;
  encryptedContent: string;
  timestamp: number;
};
