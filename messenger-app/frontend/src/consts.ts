import { HexString } from "@gear-js/api";

const ADDRESS = {
  NODE: process.env.REACT_APP_NODE_ADDRESS as string,
};

const LOCAL_STORAGE = {
  ACCOUNT: 'account',
  WALLET: 'wallet',
};

const MAIN_CONTRACT_ADDRESS: HexString = '0xaa912aad2336aef48203d820a808de6f9701d3bd251e99c62f33569277d618a4'

export { ADDRESS, LOCAL_STORAGE, MAIN_CONTRACT_ADDRESS };
