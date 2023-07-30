import { GearApi, HexString } from "@gear-js/api";
import { createContext } from "react";

export const ChatIds_SymKeys_Context = createContext<Map<HexString, string> | undefined>(undefined);
export const ChatIds = createContext<HexString[] | undefined>(undefined);
export const MyPubKey = createContext<string | undefined>(undefined);
export const gearApiContext = createContext<GearApi | null>(null);