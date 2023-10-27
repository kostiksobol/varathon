import { HexString } from "@gear-js/api";

const ADDRESS = {
  NODE: process.env.REACT_APP_NODE_ADDRESS as string,
};

const LOCAL_STORAGE = {
  ACCOUNT: 'account',
  WALLET: 'wallet',
};

const MAIN_CONTRACT_ADDRESS: HexString = '0x17e6f24cb08447631defed286439b5d8289a05b282586dcd84706f8ff208415f'

export { ADDRESS, LOCAL_STORAGE, MAIN_CONTRACT_ADDRESS };
