import { HexString } from "@polkadot/util/types";

const ADDRESS = {
  NODE: process.env.REACT_APP_NODE_ADDRESS as string,
};

const LOCAL_STORAGE = {
  ACCOUNT: 'account',
};

const MAIN_CONTRACT_ADDRESS: HexString = '0xb7a08953ee1eaf08970196320fe29ebcdf28f3bfae2877ae36767367d6afbdd3'

export { ADDRESS, LOCAL_STORAGE, MAIN_CONTRACT_ADDRESS };
