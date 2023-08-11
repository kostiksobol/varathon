import { HexString } from "@polkadot/util/types";

const ADDRESS = {
  NODE: process.env.REACT_APP_NODE_ADDRESS as string,
};

const LOCAL_STORAGE = {
  ACCOUNT: 'account',
  WALLET: 'wallet',
};

const MAIN_CONTRACT_ADDRESS: HexString = '0x0c72ea878559764bae69f4d39f82f34231cdbfff702a958d56a3264361b1d2c0'

export { ADDRESS, LOCAL_STORAGE, MAIN_CONTRACT_ADDRESS };
