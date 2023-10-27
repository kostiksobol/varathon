import { HexString } from "@gear-js/api";

const ADDRESS = {
  NODE: process.env.REACT_APP_NODE_ADDRESS as string,
};

const LOCAL_STORAGE = {
  ACCOUNT: 'account',
  WALLET: 'wallet',
};

const MAIN_CONTRACT_ADDRESS: HexString = '0xfe77a1228ac5298070eee152515b9c18d4ea4805fdc64550a1fdbf26c4ff5dc7'

export { ADDRESS, LOCAL_STORAGE, MAIN_CONTRACT_ADDRESS };
