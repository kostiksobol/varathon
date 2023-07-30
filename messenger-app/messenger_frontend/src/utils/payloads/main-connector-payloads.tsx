export const getRegisterPubKeyPayload = (pubkey: string) => {
  return { RegisterPubkey: { pubkey } };
}

export const getCreateGroupConnectionPayload = (encrypted_symkey: string) => {
  return { CreateGroupConnection: { encrypted_symkey } };
}