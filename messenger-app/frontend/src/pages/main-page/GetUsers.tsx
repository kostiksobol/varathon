// import { readContractState, useContractState } from 'hooks/hooks';
// import React, { useContext, useEffect } from 'react'
// import { HexString } from '@gear-js/api';
// import metaGroupConnectionTxt from 'assets/meta/group_connection.meta.txt';
// import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt';
// import { addChat, addMessage, addUser, db } from 'utils/indexedDB';
// import { gearApiContext } from 'context';
// import { MAIN_CONTRACT_ADDRESS } from 'consts';

// interface ContractComponentProps {
//     payload: {
//       GetUsersStartFrom: {
//         from: number;
//       };
//     };
//     setLastLength: React.Dispatch<React.SetStateAction<number>>;
//     chatId: HexString;
//   }

// export default function GetUsers({payload, setLastLength, chatId} : ContractComponentProps) {

//     const api = useContext(gearApiContext);
    
//     const { state: serverUsers } = useContractState<{ UsersStartFrom: { res: HexString[] } }>(chatId, metaGroupConnectionTxt, payload);
//     useEffect(() => {
//       const processChatIds = async () => {
//         while (!api) {
//             await new Promise(resolve => setTimeout(resolve, 1000));
//         }

//         if (api && serverUsers && serverUsers.UsersStartFrom.res.length > 0) {
//             const newUsers = serverUsers.UsersStartFrom.res;

//             const promises = newUsers.map(async (user_id) => {
//                 const state = await readContractState<{User: {res: {address: HexString, login: string, name: string, pubkey: string}}}>(api, MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, {GetUserByAddress: {address: user_id}});
//                 addUser({chatId, user: {address: state.User.res.address, login: state.User.res.login, name: state.User.res.name}});
//             });

//             await Promise.all(promises);

//             setLastLength(prevLength => prevLength + newUsers.length);
//         }
//       };

//       processChatIds();
//     }, [serverUsers]);
//     return null;
// }
