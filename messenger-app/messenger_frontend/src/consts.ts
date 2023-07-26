import { HexString } from "@polkadot/util/types";

const ADDRESS = {
  NODE: process.env.REACT_APP_NODE_ADDRESS as string,
};

const LOCAL_STORAGE = {
  ACCOUNT: 'account',
  WALLET: 'wallet',
};

const MAIN_CONTRACT_ADDRESS: HexString = '0x06e390ecec255231921c358394ec80251ff1c2afddfd7d3750e146b5e55fdd76'

export { ADDRESS, LOCAL_STORAGE, MAIN_CONTRACT_ADDRESS };
