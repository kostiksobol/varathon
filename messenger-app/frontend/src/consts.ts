import { HexString } from "@gear-js/api";

const ADDRESS = {
  NODE: process.env.REACT_APP_NODE_ADDRESS as string,
};

const LOCAL_STORAGE = {
  ACCOUNT: 'account',
  WALLET: 'wallet',
};

const MAIN_CONTRACT_ADDRESS: HexString = '0xb55f1c92cb1578d3f5057f8829272cec57ca7fcfee863d5de019182fe5ff86ca'

export { ADDRESS, LOCAL_STORAGE, MAIN_CONTRACT_ADDRESS };
