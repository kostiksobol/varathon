import { HexString } from '@gear-js/api';
import { useAccount, useSendMessage } from '@gear-js/react-hooks';
import { MAIN_CONTRACT_ADDRESS } from 'consts';
import { useMainState } from 'hooks';
import { useMetadata } from 'hooks/useMetadata';
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { encryptDataWithPubKey } from 'utils/crypto-defence/public-private-key-encryption';
import { generateSymmetricKey } from 'utils/crypto-defence/symmetric-key-encryption';
import { getCreateGroupConnectionPayload } from 'utils/payloads/main-connector-payloads';

import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt'
import { ChatButton } from './utilts/ChatButton';
import CreateNewChatButton from './UI/CreateNewChatButton';
import { ChatIds, ChatIds_SymKeys_Context, MyPubKey } from 'context';

export default function ChatsForm() {
    const navigate = useNavigate();

    const chat_ids = useContext(ChatIds);

    const my_pub_key = useContext(MyPubKey);

    const createNewChat = useSendMessage(MAIN_CONTRACT_ADDRESS, useMetadata(metaMainConnectorTxt));

    const handleCreateChatClick = () => {
      const sym_key = generateSymmetricKey();
      if(my_pub_key){
        const encrypted_symkey = encryptDataWithPubKey(my_pub_key.slice(2), sym_key);
        createNewChat(getCreateGroupConnectionPayload(encrypted_symkey));
      }
    };
  
    return (
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
        {chat_ids?.map((id, index) => (
          <ChatButton key={index} chat_id={id} />
        ))}
        <CreateNewChatButton onClick={handleCreateChatClick} />
      </div>
    );
}
