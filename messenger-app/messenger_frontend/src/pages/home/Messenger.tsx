import React, { useState, useEffect } from 'react';
import { useReadFullState, useSendMessage, useReadWasmState } from '@gear-js/react-hooks';
import { HexString } from '@polkadot/util/types';
import { ProgramMetadata, getProgramMetadata } from '@gear-js/api';
import metaTxt from 'assets/meta/meta.txt'
import metaTxt1 from 'assets/meta/meta1.txt'
import stateMetaWasm from 'assets/wasm/state.meta.wasm';
import { useWasmMetadata } from './useMetadata';
import { useAccount } from '@gear-js/react-hooks';
import { useMetadata } from './useMetadata';
import { state } from '@polkadot/types/interfaces/definitions';
import { MAIN_CONTRACT_ADDRESS } from 'consts';
import { stringToHex } from '@polkadot/util';
import { createKeywordTypeNode } from 'typescript';

function useMainState<T>(functionName: string, payload?: any) {
    const programId = '0xc76f82e256045ce6e138356f84126549d0e4ee04179fd25d48019c65d88a881d';
    const { buffer } = useWasmMetadata(stateMetaWasm);
  
    return useReadWasmState<T>(
      programId,
      buffer,
      functionName,
      payload,
    );
  }
  
  function useSendSendMessage(){
    return useSendMessage('0x8a03dfc31c3c144e3f49389fe2356b182a07842bad6b60ffd9d5e6052b0c9840', 
      useMetadata(metaTxt),
      false);
  }
  
  const getConnectPayload = (to: HexString) => {
    return { Connect: { to } };
  };
  
  const getSendPayload = (encrypted_content: string) => {
    return { Send: { encrypted_content } };
  };
  
  type MainState = {
    users:[HexString, HexString[]][];
    connections_users: [HexString, [HexString, HexString]][];
  }
  
  const ChatItem = ({index, programId, onchange}: {index: number, programId : HexString, onchange: any} ) => {
    const { state } = useReadFullState<Message[]>(programId, useMetadata(metaTxt));
  
    useEffect(() => {
      onchange(index, programId, state);
    }, [state])
  
    return null;
    // return (
    //   <div>
    //         {state?.map((message, index) => (
    //         <div key={index}>
    //           <p>Content: {message?.encryptedContent}</p>
    //           <p>From: {message?.from}</p>
    //           <p>Time: {message?.timestamp}</p>
    //         </div>
    //       ))}
    //     </div>
    // )
  };
  
  function MainState({onchange}: {onchange: any}) {
    // const { account } = useAccount();
    // const {state} = useMainState<HexString[]>('get_connections', account?.decodedAddress);
    // return state;
    const { account } = useAccount();
    const { state } = useMainState<HexString[]>('get_connections', account?.decodedAddress);
  
    return (
      <div>{
        state?.map((programId, chatIndex) => (
          <ChatItem index={chatIndex} programId={programId} onchange={onchange}/>
        ))
      }</div>
    );
  }


  interface Chat {
    name: HexString;
    messages: Message[];
  }
  
  type Message = {
    from: HexString;
    encryptedContent: string;
    timestamp: number;
  };
  
//   const fakeServerChats: Chat[] = [
//     {
//       name: 'Chat 1',
//       messages: [
//         { from: 'User A', encryptedContent: 'Hello', timestamp: 8568 },
//         { from: 'User B', encryptedContent: 'Hi', timestamp: 8567 },
//         { from: 'User A', encryptedContent: 'How are you?', timestamp: 5867 },
//       ],
//     },
//     {
//       name: 'Chat 2',
//       messages: [
//         { from: 'User C', encryptedContent: 'Hi', timestamp: 5867 },
//         { from: 'User A', encryptedContent: 'I am fine', timestamp: 5867 },
//       ],
//     },
//     {
//       name: 'Chat 3',
//       messages: [
//         { from: 'User D', encryptedContent: 'Hey', timestamp: 8657 },
//         { from: 'User E', encryptedContent: 'Hello', timestamp: 53434 },
//         { from: 'User D', encryptedContent: "What's up?", timestamp: 243 },
//       ],
//     },
//   ];

function Messenger(): JSX.Element {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatName, setSelectedChatName] = useState<string | null>(null);
  const [newMessageNotifications, setNewMessageNotifications] = useState<{ [key: string]: boolean }>({});
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [newChatName, setNewChatName] = useState<string>('0x'); // new state for handling the new chat name

  useEffect(() => {
      setTmp(chats.findIndex((chat) => chat.name === selectedChatName));
  }, []);

  const changeState = (index: number, programId: HexString, change: Message[]) => {
      setChats(prevstate => {
          const updatedstate = [...prevstate];
          // let ci = 0;
          // for(let i = 0; i < updatedstate.length; i++){
          //   if(updatedstate[i].name == programId){
          //     ci = i;
          //     break;
          //   }
          // }
          
          updatedstate[index] = {name: programId, messages: change};
          if (updatedstate[index].name !== selectedChatName) {
            setNewMessageNotifications((prevNotifications) => ({
                ...prevNotifications,
                [updatedstate[index].name]: true,
            }));
          }
          return updatedstate;
      });
  };

  const handleChatClick = (chatName: string) => {
      setSelectedChatName(chatName);
      setNewMessageNotifications((prevNotifications) => ({
          ...prevNotifications,
          [chatName]: false,
      }));
  };

  const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewMessageText(e.target.value);
  };

  const [tmp, setTmp] = useState<number>(0);

  const sendMessage = useSendMessage(chats[tmp]?.name, useMetadata(metaTxt), false)
  const connectMessage = useSendMessage(MAIN_CONTRACT_ADDRESS, useMetadata(metaTxt1))

  const handleSendMessage = () => {
      if (newMessageText.trim() === '') {
          return;
      }

      const chatIndex = chats.findIndex((chat) => chat.name === selectedChatName);
      if (chatIndex !== -1) {
          setTmp(chatIndex);
          sendMessage(getSendPayload(newMessageText));
          setNewMessageText('');
      }
  };

  const handleGenerateNewMessage = () => {
      const randomChatIndex = Math.floor(Math.random() * chats.length);
      const randomChat = chats[randomChatIndex];

      if (randomChat && randomChat.messages) {
          const newMessage: Message = {
              from: '0xUser X',
              encryptedContent: `New message ${randomChat.messages.length}`,
              timestamp: 0,
          };

          const updatedChats = chats.map((chat) => {
              if (chat.name === randomChat.name) {
                  return {
                      ...chat,
                      messages: [...chat.messages, newMessage],
                  };
              }
              return chat;
          });

          setChats(updatedChats);

          if (randomChat.name !== selectedChatName) {
              setNewMessageNotifications((prevNotifications) => ({
                  ...prevNotifications,
                  [randomChat.name]: true,
              }));
          }
      }
  };

  const handleGenerateNewChat = () => {
      // const newChat: Chat = {
      //     name: newChatName || `0xChat ${chats.length + 1}`, // use the value from input or default
      //     messages: [],
      // };
      
      if (newChatName.slice(0, 2) == '0x'){
        connectMessage(getConnectPayload(`0x${newChatName.slice(2, newChatName.length)}`));
      }
      // else{
      // connectMessage(getConnectPayload(`0x${newChatName}`));};
      // setChats((prevChats) => [...prevChats, newChat]);
      // setNewChatName('0x'); // clear the input
  };

  const handleNewChatNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewChatName(e.target.value);
  };

  return (
      <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#333', color: '#fff' }}>
                   {/* List of chats */}
 <MainState onchange={changeState}/>
          {/* List of chats */}
          <div
              style={{
                width: '30%',
                borderRight: '1px solid #555',
                backgroundColor: '#222',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {chats.map((chat) => (
                <button
                  key={chat.name}
                  onClick={() => handleChatClick(chat.name)}
                  style={{
                    marginBottom: '10px',
                    fontWeight: selectedChatName === chat.name ? 'bold' : 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: selectedChatName === chat.name ? '#444' : 'inherit',
                    padding: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                  }}
                >
                  <div style={{ marginRight: '10px', fontSize: '1.2rem', color: '#888' }}>
                    {newMessageNotifications[chat.name] && selectedChatName !== chat.name ? '🔔' : ''}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#ddd' }}>{chat.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                      {chat.messages && chat.messages.length > 0
                        ? `${chat.messages[chat.messages.length - 1].from}: ${chat.messages[chat.messages.length - 1].encryptedContent}`
                        : 'No messages'}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected chat */}
            <div style={{ width: '70%', padding: '1rem', overflowY: 'auto', backgroundColor: '#222' }}>
              {selectedChatName &&
                chats
                  .find((chat) => chat.name === selectedChatName)
                  ?.messages.map((message, index) => (
                    <div key={index} style={{ marginBottom: '10px' }}>
                      <div style={{ fontWeight: 'bold', color: '#ddd' }}>{message.from}</div>
                      <div
                        style={{ fontSize: '0.9rem', backgroundColor: '#444', padding: '10px', borderRadius: '5px' }}
                      >
                        {message.encryptedContent}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#888', textAlign: 'right' }}>{new Date(Number(message.timestamp.toString().replace(/,/g, ''))).toLocaleString()}</div>
                    </div>
                  ))}
            </div>
          <div
              style={{
                  position: 'fixed',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
              }}
          >
              <input
                  type="text"
                  value={newChatName}
                  onChange={handleNewChatNameChange}
                  placeholder="Enter new chat name..."
                  style={{
                      marginRight: '10px',
                      padding: '10px',
                      border: 'none',
                      borderRadius: '5px',
                      flex: '1',
                      fontSize: '1rem',
                      backgroundColor: '#444',
                      color: '#ddd',
                  }}
              />
              <button
                  onClick={handleGenerateNewChat}
                  style={{
                      marginRight: '10px',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                      backgroundColor: '#2196f3',
                      color: '#fff',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s',
                  }}
              >
                  Add Chat
              </button>
              <input
                  type="text"
                  value={newMessageText}
                  onChange={handleNewMessageChange}
                  placeholder="Enter your message..."
                  style={{
                      marginRight: '10px',
                      padding: '10px',
                      border: 'none',
                      borderRadius: '5px',
                      flex: '1',
                      fontSize: '1rem',
                      backgroundColor: '#444',
                      color: '#ddd',
                  }}
              />
              <button
                  onClick={handleSendMessage}
                  style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                      backgroundColor: '#4caf50',
                      color: '#fff',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s',
                  }}
              >
                  Send
              </button>
              <button
                  onClick={handleGenerateNewMessage}
                  style={{
                      marginLeft: '10px',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                      backgroundColor: '#2196f3',
                      color: '#fff',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s',
                  }}
              >
                  Generate Message
              </button>
          </div>
      </div>
  );
}

  
  // function Messenger(): JSX.Element {
  //   const [chats, setChats] = useState<Chat[]>([]);
  //   const [selectedChatName, setSelectedChatName] = useState<string | null>(null);
  //   const [newMessageNotifications, setNewMessageNotifications] = useState<{ [key: string]: boolean }>({});
  //   const [newMessageText, setNewMessageText] = useState<string>('');
  
  //   useEffect(() => {
  //       setTmp(chats.findIndex((chat) => chat.name === selectedChatName));
  //   //   setChats(fakeServerChats);
  //   }, []);

  //   const changeState = (index: number, programId: HexString, change: Message[]) => {
  //       setChats(prevstate => {
  //       const updatedstate = [...prevstate];
  //       updatedstate[index] = {name: programId, messages: change};
  //       return updatedstate; 
  //   });
  //   }
  
  //   const handleChatClick = (chatName: string) => {
  //     setSelectedChatName(chatName);
  //     setNewMessageNotifications((prevNotifications) => ({
  //       ...prevNotifications,
  //       [chatName]: false,
  //     }));
  //   };
  
  //   const handleNewMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     setNewMessageText(e.target.value);
  //   };

  //   const [tmp, setTmp] = useState<number>(0);

  //   const sendMessage = useSendMessage(chats[tmp]?.name, 
  //       useMetadata(metaTxt),
  //       false)
  
  //   const handleSendMessage = () => {
  //     if (newMessageText.trim() === '') {
  //       return;
  //     }
  
  //     const chatIndex = chats.findIndex((chat) => chat.name === selectedChatName);
  //     if (chatIndex !== -1) {
  //       // const newMessage: Message = {
  //       //   from: 'User A',
  //       //   encryptedContent: newMessageText,
  //       //   timestamp: 0,
  //       // };
  //       // const updatedChats = [...chats];
  //       // updatedChats[chatIndex].messages.push(newMessage);
  //       // setChats(updatedChats);
  //       setTmp(chatIndex);
  //       sendMessage(getSendPayload(newMessageText));
  //       setNewMessageText('');
  //     }
  //   };
  
  //   const handleGenerateNewMessage = () => {
  //     const randomChatIndex = Math.floor(Math.random() * chats.length);
  //     const randomChat = chats[randomChatIndex];
  
  //     if (randomChat && randomChat.messages) {
  //       const newMessage: Message = {
  //         from: '0xUser X',
  //         encryptedContent: `New message ${randomChat.messages.length}`,
  //         timestamp: 0,
  //       };
  
  //       const updatedChats = chats.map((chat) => {
  //         if (chat.name === randomChat.name) {
  //           return {
  //             ...chat,
  //             messages: [...chat.messages, newMessage],
  //           };
  //         }
  //         return chat;
  //       });
  
  //       setChats(updatedChats);
  
  //       if (randomChat.name !== selectedChatName) {
  //         setNewMessageNotifications((prevNotifications) => ({
  //           ...prevNotifications,
  //           [randomChat.name]: true,
  //         }));
  //       }
  //     }
  //   };
  
  //   const handleGenerateNewChat = () => {
  //     const newChat: Chat = {
  //       name: `0xChat ${chats.length + 1}`,
  //       messages: [],
  //     };
  
  //     setChats((prevChats) => [...prevChats, newChat]);
  //   };
  
  //   return (
  //     <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: '#333', color: '#fff' }}>
  //       {/* List of chats */}
  //       <MainState onchange={changeState}/>
  //       <div
  //         style={{
  //           width: '30%',
  //           borderRight: '1px solid #555',
  //           backgroundColor: '#222',
  //           overflowY: 'auto',
  //           display: 'flex',
  //           flexDirection: 'column',
  //         }}
  //       >
  //         {chats.map((chat) => (
  //           <button
  //             key={chat.name}
  //             onClick={() => handleChatClick(chat.name)}
  //             style={{
  //               marginBottom: '10px',
  //               fontWeight: selectedChatName === chat.name ? 'bold' : 'normal',
  //               display: 'flex',
  //               alignItems: 'center',
  //               backgroundColor: selectedChatName === chat.name ? '#444' : 'inherit',
  //               padding: '10px',
  //               border: 'none',
  //               cursor: 'pointer',
  //               transition: 'background-color 0.3s',
  //             }}
  //           >
  //             <div style={{ marginRight: '10px', fontSize: '1.2rem', color: '#888' }}>
  //               {newMessageNotifications[chat.name] && selectedChatName !== chat.name ? '🔔' : ''}
  //             </div>
  //             <div>
  //               <div style={{ fontWeight: 'bold', color: '#ddd' }}>{chat.name}</div>
  //               <div style={{ fontSize: '0.8rem', color: '#888' }}>
  //                 {chat.messages && chat.messages.length > 0
  //                   ? `${chat.messages[chat.messages.length - 1].from}: ${chat.messages[chat.messages.length - 1].encryptedContent}`
  //                   : 'No messages'}
  //               </div>
  //             </div>
  //           </button>
  //         ))}
  //         <button
  //           onClick={handleGenerateNewChat}
  //           style={{
  //             marginBottom: '10px',
  //             fontWeight: 'bold',
  //             display: 'flex',
  //             alignItems: 'center',
  //             backgroundColor: 'inherit',
  //             padding: '10px',
  //             border: 'none',
  //             cursor: 'pointer',
  //             transition: 'background-color 0.3s',
  //           }}
  //         >
  //           <div style={{ marginRight: '10px', fontSize: '1.2rem', color: '#888' }}>+</div>
  //           <div style={{ fontWeight: 'bold', color: '#ddd' }}>Add Chat</div>
  //         </button>
  //       </div>
  
  //       {/* Selected chat */}
  //       <div style={{ width: '70%', padding: '1rem', overflowY: 'auto', backgroundColor: '#222' }}>
  //         {selectedChatName &&
  //           chats
  //             .find((chat) => chat.name === selectedChatName)
  //             ?.messages.map((message, index) => (
  //               <div key={index} style={{ marginBottom: '10px' }}>
  //                 <div style={{ fontWeight: 'bold', color: '#ddd' }}>{message.from}</div>
  //                 <div
  //                   style={{ fontSize: '0.9rem', backgroundColor: '#444', padding: '10px', borderRadius: '5px' }}
  //                 >
  //                   {message.encryptedContent}
  //                 </div>
  //                 <div style={{ fontSize: '0.8rem', color: '#888', textAlign: 'right' }}>{new Date(Number(message.timestamp.toString().replace(/,/g, ''))).toLocaleString()}</div>
  //               </div>
  //             ))}
  //       </div>
  
  //       {/* New message input, send button, and generate button */}
  //       <div
  //         style={{
  //           position: 'fixed',
  //           bottom: '20px',
  //           left: '50%',
  //           transform: 'translateX(-50%)',
  //           display: 'flex',
  //           alignItems: 'center',
  //         }}
  //       >
  //         <input
  //           type="text"
  //           value={newMessageText}
  //           onChange={handleNewMessageChange}
  //           placeholder="Enter your message..."
  //           style={{
  //             marginRight: '10px',
  //             padding: '10px',
  //             border: 'none',
  //             borderRadius: '5px',
  //             flex: '1',
  //             fontSize: '1rem',
  //             backgroundColor: '#444',
  //             color: '#ddd',
  //           }}
  //         />
  //         <button
  //           onClick={handleSendMessage}
  //           style={{
  //             padding: '10px 20px',
  //             border: 'none',
  //             borderRadius: '5px',
  //             backgroundColor: '#4caf50',
  //             color: '#fff',
  //             fontSize: '1rem',
  //             cursor: 'pointer',
  //             transition: 'background-color 0.3s',
  //           }}
  //         >
  //           Send
  //         </button>
  //         <button
  //           onClick={handleGenerateNewMessage}
  //           style={{
  //             marginLeft: '10px',
  //             padding: '10px 20px',
  //             border: 'none',
  //             borderRadius: '5px',
  //             backgroundColor: '#2196f3',
  //             color: '#fff',
  //             fontSize: '1rem',
  //             cursor: 'pointer',
  //             transition: 'background-color 0.3s',
  //           }}
  //         >
  //           Generate Message
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }
  
  export default Messenger;