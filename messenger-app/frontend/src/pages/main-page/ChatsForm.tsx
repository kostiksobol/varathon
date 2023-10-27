import { HexString } from '@gear-js/api';
import { useAccount, useSendMessage } from '@gear-js/react-hooks';
import { MAIN_CONTRACT_ADDRESS } from 'consts';
import { useProgramMetadata } from 'hooks';
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { encryptDataWithPubKey } from 'utils/crypto-defence/public-private-key-encryption';
import { encryptData, generateSymmetricKey } from 'utils/crypto-defence/symmetric-key-encryption';

import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt'
import { ChatButton } from './utilts/ChatButton';
import CreateNewChatButton from './UI/CreateNewChatButton';
import { db } from 'utils/indexedDB';
import GetChatIds from './GetChatIds';
import MessagesLoader from './MessagesLoader';
import UsersLoader from './UsersLoader';
import { YourInfo } from './MainLayer';

export default function ChatsForm() {
    const { account } = useAccount();

    const [chatIds, setChatIds] = useState<HexString[]>([]);
    const [lengthChatIds, setLengthChatIds] = useState<number>(0);
    const [isChatIdsLoaded, setIsChatIdsLoaded] = useState(false);

    const payload = account ? useMemo(() => ({ GetLastChatIdsFrom: { from: lengthChatIds, for_whom: account.decodedAddress } }), [lengthChatIds]) : null;

    useEffect(() => {
        db.chats.where("userId").equals(account!.address).toArray().then(allChats => {
            // const newMap = new Map<HexString, string>();
            const newChatIds: HexString[] = [];
            allChats.forEach(chat => {
                // newMap.set(chat.chatId, chat.symmetricKey);
                newChatIds.push(chat.chatId);
            });
            setChatIds(newChatIds.reverse());
            // setChatIdsWithSymKeys(newMap);
            setLengthChatIds(allChats.length);
            setIsChatIdsLoaded(true);
        })
        .catch(error => {
            console.error("Error loading chat ids:", error);
        });
    }, []);

    const createNewChat = useSendMessage(MAIN_CONTRACT_ADDRESS, useProgramMetadata(metaMainConnectorTxt));

    function handleCreateChatClick(name: string) {
      return () => {
        const sym_key = generateSymmetricKey();
        const raw_info = localStorage.getItem(account!.address);
        if(raw_info){
          const info: YourInfo = JSON.parse(raw_info);
          const encrypted_symkey = encryptDataWithPubKey(info.publivKey, sym_key);
          const encrypted_name = encryptData(name, sym_key);
          createNewChat({CreateGroupConnection: { encrypted_name, encrypted_symkey }});
        }
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
        {isChatIdsLoaded && payload ? (<GetChatIds payload={payload} setChatIds={setChatIds} setLengthChatIds={setLengthChatIds}/>) : null}

        {chatIds?.map((id) => (
            <React.Fragment key={id}>
            <ChatButton chat_id={id} />
            <MessagesLoader chatId={id}/>
            <UsersLoader chatId={id}/>
            </React.Fragment>
        ))}
        <CreateNewChatButton handleCreateChatClick={handleCreateChatClick} />
      </div>
    );
}