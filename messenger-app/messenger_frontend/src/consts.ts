import { HexString } from "@polkadot/util/types";

const ADDRESS = {
  NODE: process.env.REACT_APP_NODE_ADDRESS as string,
};

const LOCAL_STORAGE = {
  ACCOUNT: 'account',
  WALLET: 'wallet',
};

const MAIN_CONTRACT_ADDRESS: HexString = '0x907e91afc204f06e8ab0ea24b11bb8fb636317c1d46d7a9e4d01d35bf5283c0e'

export { ADDRESS, LOCAL_STORAGE, MAIN_CONTRACT_ADDRESS };
