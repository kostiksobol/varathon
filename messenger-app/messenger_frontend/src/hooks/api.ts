import { useAlert, useReadWasmState } from '@gear-js/react-hooks';
import { GearApi, getProgramMetadata, getStateMetadata, ProgramMetadata, StateMetadata } from '@gear-js/api';
import { HexString } from '@polkadot/util/types';
import { useContext, useEffect, useState } from 'react';
import { useWasmMetadata } from './useMetadata';
import { MAIN_CONTRACT_ADDRESS } from 'consts';

import stateMainConnectorMetaWasm from 'assets/wasm/main_connector_state.meta.wasm';
import stateGroupConnectionMetaWasm from 'assets/wasm/group_connection_state.meta.wasm';
import metaMainConnectorTxt from 'assets/meta/main_connector.meta.txt'
import metaGroupConnectionTxt from 'assets/meta/group_connection.meta.txt'
import { gearApiContext } from 'context';

function useProgramMetadata(source: string) {
  const alert = useAlert();

  const [metadata, setMetadata] = useState<ProgramMetadata>();

  useEffect(() => {
    fetch(source)
      .then((response) => response.text())
      .then((raw) => `0x${raw}` as HexString)
      .then((metaHex) => getProgramMetadata(metaHex))
      .then((result) => setMetadata(result))
      .catch(({ message }: Error) => alert.error(message));
  }, []);

  return metadata;
}

function useStateMetadata(source: string) {
  const alert = useAlert();

  const [stateMetadata, setStateMetadata] = useState<StateMetadata>();

  useEffect(() => {
    fetch(source)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => Buffer.from(arrayBuffer))
      .then((buffer) => getStateMetadata(buffer))
      .then((result) => setStateMetadata(result))
      .catch(({ message }: Error) => alert.error(message));
  }, []);

  return stateMetadata;
}

function useMainState<T>(functionName: string, payload?: any) {
  const programId = MAIN_CONTRACT_ADDRESS;
  const { buffer } = useWasmMetadata(stateMainConnectorMetaWasm);

  return useReadWasmState<T>(
    programId,
    buffer,
    functionName,
    payload,
  );
}

function useGroupState<T>(functionName: string, programId: HexString, payload?: any) {
  const { buffer } = useWasmMetadata(stateGroupConnectionMetaWasm);

  return useReadWasmState<T>(
    programId,
    buffer,
    functionName,
    payload,
  );
}

function useReadMainStateOnce<T>(api: GearApi | null, functionName: string, payload?: any) {
  const programId = MAIN_CONTRACT_ADDRESS;
  const { buffer } = useWasmMetadata(stateMainConnectorMetaWasm);
  const stateMetadata = useStateMetadata(stateMainConnectorMetaWasm);

  const [state, setState] = useState<T>();

  useEffect(() => {
    if(api && stateMetadata && buffer){
      api.programState.readUsingWasm({programId, wasm: buffer, fn_name: functionName, argument: payload}, stateMetadata)
      .then((codecState) => codecState.toHuman())
      .then((result) => {
        setState(result as unknown as T);
      })
      .catch((error) => {
        console.error('Error fetching states:', error);
        // Handle errors if necessary
      });
    }
  }, [functionName, payload, buffer, stateMetadata]);

  return state;
}

async function ReadMainState<T>(api: GearApi, functionName: string, payload?: any){
  const res = await fetch(stateMainConnectorMetaWasm);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = await Buffer.from(arrayBuffer);
  const metadata = await getStateMetadata(buffer);
  const state = await api.programState.readUsingWasm(
    {
      programId: MAIN_CONTRACT_ADDRESS,
      fn_name: functionName,
      wasm: buffer,
      argument: payload,
    },
    metadata,
  );
  return state.toHuman() as unknown as T;
}

function useReadGroupStateOnce<T>(api: GearApi | null, functionName: string, programId: HexString, payload?: any) {
  const { buffer } = useWasmMetadata(stateGroupConnectionMetaWasm);
  const stateMetadata = useStateMetadata(stateGroupConnectionMetaWasm);

  const [state, setState] = useState<T>();

  useEffect(() => {
    if(api && stateMetadata && buffer){
      api.programState.readUsingWasm({programId, fn_name: functionName, wasm: buffer, argument: payload}, stateMetadata)
      .then((codecState) => codecState.toHuman())
      .then((result) => {
        setState(result as unknown as T);
      })
      .catch((error) => {
        console.error('Error fetching states:', error);
        // Handle errors if necessary
      });
    }
  }, [functionName, payload, programId, buffer, stateMetadata]);

  return state;
}

function useReadGroupStatesOnce<T, K>(
  api: GearApi | null,
  functionName: string,
  programIds: HexString[] | undefined,
  function_which_will_be_applied_on_states: (param: T) => K,
  isCheck: boolean,
  payload?: any,
) {
  if(!isCheck){
    return undefined;
  }
  const { buffer } = useWasmMetadata(stateGroupConnectionMetaWasm);
  const stateMetadata = useStateMetadata(stateGroupConnectionMetaWasm);

  const [fetchedProgramIds, setFetchedProgramIds] = useState<Set<HexString>>(new Set());
  const [stateMap, setStateMap] = useState<Map<HexString, K>>();

  useEffect(() => {
    if (api && stateMetadata && buffer && programIds) {
      const newProgramIds = programIds.filter((programId) => !fetchedProgramIds.has(programId));

      if (newProgramIds.length === 0) {
        // All programIds are already fetched, no need to make additional requests
        return;
      }

      const fetchStatesSequentially = async () => {
        const newStateMap = new Map<HexString, K>(stateMap); // Clone the current stateMap
        for (const programId of newProgramIds) {
            api.programState.readUsingWasm({
              programId,
              fn_name: functionName,
              wasm: buffer,
              argument: payload,
            }, stateMetadata)
            .then((codecState) => codecState.toHuman())
            .then((result) => {
              const result1 = result as unknown as T;
              newStateMap.set(programId, function_which_will_be_applied_on_states(result1));
            })
            .catch((error) => {
              console.error('Error fetching states:', error);
              // Handle errors if necessary
            });
        }
        setStateMap(newStateMap);

        // Convert the Set to an array and merge with newProgramIds to update fetchedProgramIds
        setFetchedProgramIds(new Set([...Array.from(fetchedProgramIds), ...newProgramIds]));
      };

      fetchStatesSequentially();
    }
  }, [functionName, payload, programIds?.length, buffer, stateMetadata]);

  return stateMap;
}

export { useProgramMetadata, useStateMetadata, useGroupState, useMainState, useReadMainStateOnce, useReadGroupStateOnce, useReadGroupStatesOnce, ReadMainState };
