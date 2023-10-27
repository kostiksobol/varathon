import { HexString } from '@gear-js/api';
import Dexie from 'dexie';
import { IpfsFile } from 'pages/main-page/utilts/MessageForm';

class MessengerDB extends Dexie {
    chats: Dexie.Table<IChat, number>;  // Using string as the primary key type (chatId)
    messages: Dexie.Table<IMessage, number>;  // Using number (autoIncrement)
    users: Dexie.Table<IUser, number>;

    constructor() {
        super("MessengerDB");

        this.version(1).stores({
            chats: '++id, userId, chatId, symmetricKey',
            messages: '++id, chatId, from, content, timestamp',
            users: '++id, chatId, user.address'
        });

        this.chats = this.table("chats");
        this.messages = this.table("messages");
        this.users = this.table("users");
    }
}

export type User = {
    address: HexString;
    login: string;
    name: string;
}

export interface IChat {
    id?: number;
    userId: string,
    chatId: HexString;
    symmetricKey: string;
    name: string;
}

export interface IMessage {
    id?: number;  
    chatId: HexString;
    from: HexString;
    content: string;
    files: IpfsFile[];
    timestamp: number;
}

export interface IUser {
    id?: number;
    chatId: HexString;
    user: User;
}

export const db = new MessengerDB();

export async function addChat(chat: IChat): Promise<number> {
    return await db.chats.add(chat);
}

export async function addMessage(message: IMessage): Promise<number> {
    return await db.messages.add(message);
}

export async function addUser(user: IUser): Promise<number> {
    return await db.users.add(user);
}

export async function getMessagesByChatId(chatId: HexString): Promise<IMessage[]> {
    return await db.messages.where("chatId").equals(chatId).toArray();
}
export async function getUsersByChatId(chatId: HexString): Promise<IUser[]> {
    return await db.users.where("chatId").equals(chatId).toArray();
}
export async function getSymmetricKeyByChatId(chatId: HexString): Promise<string | undefined> {
    const chat = await db.chats.where("chatId").equals(chatId).first();
    return chat ? chat.symmetricKey : undefined;
}
export async function getNameByChatId(chatId: HexString): Promise<string | undefined> {
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
