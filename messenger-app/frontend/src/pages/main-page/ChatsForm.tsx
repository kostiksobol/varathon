import { HexString } from '@gear-js/api';
import { useAccount, useSendMessage } from '@gear-js/react-hooks';
import { useProgramMetadata } from 'hooks';
import React, { useEffect, useMemo, useState } from 'react'
import { encryptDataWithPubKey } from 'utils/crypto-defence/public-private-key-encryption';

import metaGroupConnectionTxt from 'assets/meta/user_contract.meta.txt';
import { ChatButton } from './utilts/ChatButton';
import CreateNewChatButton from './UI/CreateNewChatButton';
import { db, getLastRecordIdByUserId, setLastRecordIdForUserId } from 'utils/indexedDB';
import GetChatIds from './GetChatIds';
import { YourInfo } from './MainLayer';
import { createSymmetricKey, encryptText, symmetricKeyToString } from 'utils/crypto-defence/symmetric-key-encryption';
import { createHMACWithNonce } from 'utils/crypto-defence/HMAC';
import MessagesLoaderForAllUsers from './MessagesLoaderForAllUsers';

export type Invitation = {
  sym_key: string;
  from_contract_id: HexString;
}

export type InvitationMessage = {
  name: string;
  invited: HexString;
  members: HexString[];
}

export default function ChatsForm() {
  const { account } = useAccount();
  const [contract, setContract] = useState<HexString>("0x");

  const [chatIds, setChatIds] = useState<string[]>([]);
  const [lengthChatIds, setLengthChatIds] = useState<number>(0);
  const [isChatIdsLoaded, setIsChatIdsLoaded] = useState(false);

  const [privateKey, setPrivateKey] = useState<string>();

  const payload = account ? useMemo(() => ({ GetLastRecords: { from: lengthChatIds } }), [lengthChatIds]) : null;

  useEffect(() => {
    const raw_info = localStorage.getItem(account!.address);
    if (raw_info) {
      const info: YourInfo = JSON.parse(raw_info);
      setContract(info.contract);
      setPrivateKey(info.privateKey);
    }
    getLastRecordIdByUserId(account!.address).then(lastRecordId => {
      if (lastRecordId) {
        setLengthChatIds(lastRecordId);
      }
      else {
        setLastRecordIdForUserId(account!.address, 0).then(() => {
          setLengthChatIds(0);
        })
      }
    })

    db.chats.where("userId").equals(account!.address).toArray().then(allChats => {
      const newChatIds: string[] = [];
      allChats.forEach(chat => {
        newChatIds.push(chat.chatId);
      });
      setChatIds(newChatIds.reverse());
      setIsChatIdsLoaded(true);
    })
      .catch(error => {
        console.error("Error loading chat ids:", error);
      });
  }, []);

  const createNewChat = useSendMessage(contract, useProgramMetadata(metaGroupConnectionTxt));

  function handleCreateChatClick(name: string) {
    return async () => {
      const sym_key = await createSymmetricKey();
      const str_sym_key = await symmetricKeyToString(sym_key);
      const raw_info = localStorage.getItem(account!.address);
      if (raw_info) {
        const info: YourInfo = JSON.parse(raw_info);
        const invitation: Invitation = {sym_key: str_sym_key, from_contract_id: info.contract}
        const str_invitation = JSON.stringify(invitation);
        
        const record = encryptDataWithPubKey(info.publivKey, str_invitation);
        const message: InvitationMessage = {name, invited: account!.decodedAddress, members: [account!.decodedAddress]};
        const encrypted_content = await encryptText(JSON.stringify(message), sym_key);
        const tag = await createHMACWithNonce(str_sym_key);
        createNewChat({ AddInvitation: { encrypted_content, tag, record } });
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
      {isChatIdsLoaded && payload && privateKey ? (<GetChatIds payload={payload} privateKey={privateKey} setChatIds={setChatIds} setLengthChatIds={setLengthChatIds} />) : null}

      {account && chatIds?.map((id) => (
        <React.Fragment key={id}>
          <ChatButton chat_id={id} />
          <MessagesLoaderForAllUsers chatId={id} />
        </React.Fragment>
      ))}
      <CreateNewChatButton handleCreateChatClick={handleCreateChatClick} />
    </div>
  );
}