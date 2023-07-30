import { HexString } from "@gear-js/api";

export const getAddNewUserToGroupPayload = (user: HexString, encrypted_symkey: string) => {
  return { Add: { user, encrypted_symkey } };
};

export const getSendMessageToGroupPayload = (encrypted_content: string) => {
  return { Send: { encrypted_content } };
};