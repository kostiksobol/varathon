import { HexString } from "@polkadot/util/types";

const ADDRESS = {
  NODE: process.env.REACT_APP_NODE_ADDRESS as string,
};

const LOCAL_STORAGE = {
  ACCOUNT: 'account',
};

const MAIN_CONTRACT_ADDRESS: HexString = '0xc76f82e256045ce6e138356f84126549d0e4ee04179fd25d48019c65d88a881d'

export { ADDRESS, LOCAL_STORAGE, MAIN_CONTRACT_ADDRESS };
