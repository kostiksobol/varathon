import { HexString } from "@gear-js/api";

const ADDRESS = {
  NODE: process.env.REACT_APP_NODE_ADDRESS as string,
};

const LOCAL_STORAGE = {
  ACCOUNT: 'account',
  WALLET: 'wallet',
};

const MAIN_CONTRACT_ADDRESS: HexString = '0xf53a20ca711cfe18b5db8305a8451cde123dcefb1816d505fd98390eca817b15'

export { ADDRESS, LOCAL_STORAGE, MAIN_CONTRACT_ADDRESS };
