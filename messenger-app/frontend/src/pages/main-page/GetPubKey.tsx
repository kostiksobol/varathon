import React, { useContext, useEffect, useMemo } from 'react'
import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt'
import { gearApiContext } from 'context'
import { useAccount } from '@gear-js/react-hooks';
import { useContractState, useContractStateOnce } from 'hooks/hooks';
import { MAIN_CONTRACT_ADDRESS } from 'consts';
import { useNavigate } from 'react-router-dom';
import { HexString } from '@gear-js/api';

export default function GetPubKey({address}: {address: string}) {
    const navigate = useNavigate();
    const api = useContext(gearApiContext);
    const { account } = useAccount();
    const payload = useMemo(() => ({GetUserByAddress: {address}}), []);
    const user = useContractStateOnce<{User: {res: {address: HexString, login: string, name: string, pubkey: string}}}>(api, MAIN_CONTRACT_ADDRESS, metaMainConnectorTxt, payload);
    useEffect(() => {
        if(user){
            if(user.User.res.pubkey.length > 0){
                navigate(`/${account?.meta.name}/login`, {replace: true});
            }
            else{
                navigate(`/${account?.meta.name}/register`, {replace: true});
            }
        }
    }, [user]);
    return null;
}
