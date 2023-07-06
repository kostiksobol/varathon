import React, { useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
} from 'react-router-dom';



import { useReadFullState, useSendMessage, useReadWasmState } from '@gear-js/react-hooks';
import { HexString } from '@polkadot/util/types';
import metaGroupConnectionTxt from 'assets/meta/group_connection.meta.txt'
import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt'
import stateMainConnectorMetaWasm from 'assets/wasm/main_connector_state.meta.wasm';
import { useAccount } from '@gear-js/react-hooks';
import { useMetadata } from './useMetadata';
import { MAIN_CONTRACT_ADDRESS } from 'consts';
import { useWasmMetadata } from './useMetadata';





function useMainState<T>(functionName: string, payload?: any) {
  const programId = MAIN_CONTRACT_ADDRESS;
  const { buffer } = useWasmMetadata(stateMainConnectorMetaWasm);

  return useReadWasmState<T>(
    programId,
    buffer,
    functionName,
    payload,
  );
}

const getAddNewUserPayload = (user: HexString) => {
  return { Add: { user } };
};

const getSendMessagePayload = (encrypted_content: string) => {
  return { Send: { encrypted_content } };
};

const getCreateGroupConnectionPayload = () => {
  return { CreateGroupConnection: {} };
}

type GroupConnectionState = {
  users: HexString[];
  messages: Message[];
}










export function MessagesForm() {
  const params = useParams<{ id: HexString }>();
  const chat_id = params.id!;


  const { state } = useReadFullState<GroupConnectionState>(chat_id, useMetadata(metaGroupConnectionTxt));
  const messages = state?.messages;

  return (
    <div
      style={{
        width: '70%',
        padding: '1rem',
        overflowY: 'auto',
        backgroundColor: '#222',
      }}
    >
      {messages?.map((message, index) => (
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
            {message.encryptedContent}
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
  
  const { state } = useReadFullState<GroupConnectionState>(chat_id, useMetadata(metaGroupConnectionTxt));
  const users = state?.users;

  return (
    <div
      style={{
        width: '30%',
        padding: '1rem',
        overflowY: 'auto',
        backgroundColor: '#222',
      }}
    >
      {users?.map((user, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <div style={{ fontWeight: 'bold', color: '#ddd' }}>{user}</div>
        </div>
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

  const onClick = React.useCallback(() => {
    navigate(`/chat/${chat_id}`);
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

export function ChatsForm({ children }: { children: React.ReactNode }) {
  const [newUser, setNewUser] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const { account } = useAccount();
  const { state } = useMainState<HexString[]>('get_user_connections', account?.decodedAddress);
  const chat_ids = state;

  const params = useParams<{ id: HexString }>();
  const chat_id = params.id!;
  const selectedChatId = chat_id;

  const addUserMessage = useSendMessage(selectedChatId, useMetadata(metaGroupConnectionTxt));
  const sendMessage = useSendMessage(selectedChatId, useMetadata(metaGroupConnectionTxt));
  const createNewChat = useSendMessage(MAIN_CONTRACT_ADDRESS, useMetadata(metaMainConnectorTxt));

  const handleAddUserClick = () => {
    // Implement the logic to add a new user to the current chat
    // You can use the newUser state variable to access the entered user
    if (newUser.slice(0, 2) == '0x'){
      addUserMessage(getAddNewUserPayload(`0x${newUser.slice(2, newUser.length)}`));
    }
  };

  const handleCreateChatClick = () => {
    // Implement the logic to create a new chat
    // You can use the newChat state variable to access the entered chat name
    createNewChat(getCreateGroupConnectionPayload());
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

    sendMessage(getSendMessagePayload(newMessage));
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
          <Chat chat_id={id} selectedChatId={selectedChatId} />
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
        {children}
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