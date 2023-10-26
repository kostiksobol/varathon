import { HexString } from '@gear-js/api';
import { useAccount, useSendMessage } from '@gear-js/react-hooks';
import { MAIN_CONTRACT_ADDRESS } from 'consts';
import { useProgramMetadata } from 'hooks';
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { encryptDataWithPubKey } from 'utils/crypto-defence/public-private-key-encryption';
import { generateSymmetricKey } from 'utils/crypto-defence/symmetric-key-encryption';

import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt'
import { ChatButton } from './utilts/ChatButton';
import CreateNewChatButton from './UI/CreateNewChatButton';
import { db } from 'utils/indexedDB';
import GetChatIds from './GetChatIds';
import MessagesLoader from './MessagesLoader';
import UsersLoader from './UsersLoader';

export default function ChatsForm() {
    const { account } = useAccount();

    const [chatIds, setChatIds] = useState<HexString[]>([]);
    const [chatIdsWithSymKeys, setChatIdsWithSymKeys] = useState<Map<HexString, string>>(new Map());
    const [lengthChatIds, setLengthChatIds] = useState<number>(0);
    const [isChatIdsLoaded, setIsChatIdsLoaded] = useState(false);

    console.log(lengthChatIds);

    const payload = account ? useMemo(() => ({ GetLastChatIdsFrom: { from: lengthChatIds, for_whom: account.decodedAddress } }), [lengthChatIds]) : null;

    useEffect(() => {
        db.chats.where("userId").equals(account!.address).toArray().then(allChats => {
            const newMap = new Map<HexString, string>();
            const newChatIds: HexString[] = [];
            allChats.forEach(chat => {
                newMap.set(chat.chatId, chat.symmetricKey);
                newChatIds.push(chat.chatId);
            });
            setChatIds(newChatIds.reverse());
            setChatIdsWithSymKeys(newMap);
            setLengthChatIds(allChats.length);
            setIsChatIdsLoaded(true);
        })
        .catch(error => {
            console.error("Error loading chat ids:", error);
        });
        console.log("ChatsForm")
    }, []);

    const createNewChat = useSendMessage(MAIN_CONTRACT_ADDRESS, useProgramMetadata(metaMainConnectorTxt));

    const handleCreateChatClick = () => {
      const sym_key = generateSymmetricKey();
      const my_pub_key = localStorage.getItem(account!.decodedAddress);
      if(my_pub_key){
        console.log(my_pub_key);
        console.log(sym_key);
        const encrypted_symkey = encryptDataWithPubKey(my_pub_key, sym_key);
        createNewChat({CreateGroupConnection: { encrypted_symkey }});
      }
    };
    
  
    return (
      <div
        style={{
          width: '30%',
          borderRight: '1px solid #555',
          backgroundColor: '#222',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
        }}
      >
        {isChatIdsLoaded && payload ? (<GetChatIds payload={payload} setChatIds={setChatIds} setChatIdsWithSymKeys={setChatIdsWithSymKeys} setLengthChatIds={setLengthChatIds}/>) : null}

        {chatIds?.map((id) => (
            <React.Fragment key={id}>
            <ChatButton chat_id={id} />
            <MessagesLoader chatId={id}/>
            <UsersLoader chatId={id}/>
            </React.Fragment>
        ))}
        <CreateNewChatButton onClick={handleCreateChatClick} />
      </div>
    );
}