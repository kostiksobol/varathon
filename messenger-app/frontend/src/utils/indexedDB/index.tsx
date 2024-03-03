import { HexString } from '@gear-js/api';
import Dexie from 'dexie';
import { IpfsFile, IpfsFileWithRealFile } from 'pages/main-page/utilts/MessageForm';

class MessengerDB extends Dexie {
    fuckyou: Dexie.Table<IFuckYou, string>;
    chats: Dexie.Table<IChat, number>; 
    messages: Dexie.Table<IMessage, number>; 
    users: Dexie.Table<IUser, number>;

    constructor() {
        super("MessengerDB");

        this.version(1).stores({
            fuckyou: 'userId',
            chats: '++id, userId, [chatId+userId], chatId',
            messages: '++id, userId, [chatId+userId], chatId',
            users: '++id, [chatId+userId], userId, chatId, user.address, [chatId+userId+user.address]'
        });

        this.fuckyou = this.table("fuckyou");
        this.chats = this.table("chats");
        this.messages = this.table("messages");
        this.users = this.table("users");
    }
}

export type User = {
    address: HexString;
    login: string;
    name: string;
    contract: HexString;
}

export interface IFuckYou{
    userId: string,
    lastRecordId: number;
}

export interface IChat {
    id?: number;
    userId: string,
    chatId: string;
    symmetricKey: CryptoKey;
    name: string;
}

export interface IMessage {
    id?: number;  
    userId: string,
    chatId: string;
    from: HexString;
    content: string;
    files: IpfsFileWithRealFile[];
    timestamp: number;
}

export interface IUser {
    id?: number;
    userId: string;
    chatId: string;
    user: User;
    lastMessagesId: number;
}

export const db = new MessengerDB();

export async function setLastRecordIdForUserId(userId: string, delta: number): Promise<void> {
    const exists = await db.fuckyou.get(userId);
    if (exists) {
        await db.fuckyou.where({ userId }).modify(record => {
            record.lastRecordId += delta;
        });
    } else {
        await db.fuckyou.put({ userId, lastRecordId: 0 });
    }
}

export async function setLastMessageId(id: number, delta: number): Promise<void> {
    await db.users.where({ id }).modify(user => {
        user.lastMessagesId += delta;
    });
}



// export async function setLastRecordIdForUserId(userId: string, lastRecordId: number): Promise<void> {
//     await db.fuckyou.put({ userId, lastRecordId });
// }

export async function getLastRecordIdByUserId(userId: string): Promise<number | undefined> {
    const record = await db.fuckyou.get(userId);
    return record?.lastRecordId;
}



export async function addChat(chat: IChat): Promise<number> {
    return await db.chats.add(chat);
}

export async function addMessage(message: IMessage): Promise<number> {
    return await db.messages.add(message);
}

export async function addUser(user: IUser): Promise<number> {
    return await db.users.add(user);
}

// export async function getMessageCountForChatId(chatId: string): Promise<number> {
//     return await db.messages.where("chatId").equals(chatId).count();
// }
export async function getMessagesForChat(chatId: string, userId: string): Promise<IMessage[]> {
    return await db.messages.where("[chatId+userId]").equals([chatId, userId]).toArray();
}
export async function getFilesByMessageId(messageId: number): Promise<IpfsFileWithRealFile[] | undefined> {
    const message = await db.messages.get(messageId);
    if(message){
        return message.files;
    }
    else{
        return undefined;
    }
}

export async function getUsersByChatId(chatId: string, userId: string): Promise<IUser[]> {
    return await db.users.where("[chatId+userId]").equals([chatId, userId]).toArray();
}
export async function checkIfUserAlreadyAdded(chatId: string, userId: string, address: HexString): Promise<boolean> {
    const a = await db.users.where('[chatId+userId+user.address]').equals([chatId, userId, address]).first();
    if(a){
        return true;
    }
    else{
        return false;
    }
}

export async function getSymmetricKeyByChatId(chatId: string): Promise<CryptoKey | undefined> {
    const chat = await db.chats.where("chatId").equals(chatId).first();
    return chat ? chat.symmetricKey : undefined;
}
// export async function getStrSymmetricKeyByChatId(chatId: HexString): Promise<string | undefined> {
//     const chat = await db.chats.where("chatId").equals(chatId).first();
//     return chat ? chat.str_symmetricKey : undefined;
// }
export async function getNameByChatId(chatId: string): Promise<string | undefined> {
    const chat = await db.chats.where("chatId").equals(chatId).first();
    return chat ? chat.name: undefined;
}
export async function getUserByAddress(address: HexString): Promise<IUser | undefined> {
    try {
      const user = await db.users
        .where('user.address')
        .equals(address)
        .first();
      return user;
    } catch (error) {
      console.error('Error fetching user by address:', error, address);
      return undefined;
    }
  }
