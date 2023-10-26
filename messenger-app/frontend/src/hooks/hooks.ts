import { GearApi, HexString, MessagesDispatched, ProgramMetadata } from "@gear-js/api";
import { AnyJson } from "@polkadot/types/types";
import { useProgramMetadata } from "./api";
import { useContext, useEffect, useRef, useState } from "react";
import { gearApiContext } from "context";

function useReadFullState<T = AnyJson>(
  programId: HexString | undefined,
  meta: ProgramMetadata | undefined,
  payload: AnyJson,
  isReadOnError?: boolean,
) {
  const api = useContext(gearApiContext); 

  const [state, setState] = useState<T>();
  const [isStateRead, setIsStateRead] = useState(true);
  const [error, setError] = useState('');

  const isPayload = payload !== undefined;

  // Use a ref to keep track of the current payload.
  const payloadRef = useRef<AnyJson>(payload);
  useEffect(() => {
    payloadRef.current = payload;
  }, [payload]);

  const readFullState = (isInitLoad?: boolean) => {
    if (!api || !programId || !meta || !isPayload) return;

    if (isInitLoad) setIsStateRead(false);

    api.programState
      .read({ programId, payload: payloadRef.current }, meta) // Use the ref's current value here
      .then((codecState) => codecState.toHuman())
      .then((result) => {
        setState(result as unknown as T);
        if (!isReadOnError) setIsStateRead(true);
      })
      .catch(({ message }: Error) => setError(message))
      .finally(() => {
        if (isReadOnError) setIsStateRead(true);
      });
  };

  const handleStateChange = (data: MessagesDispatched) => {
    const changedIDs = data.data.stateChanges.toHuman() as HexString[];
    const isAnyChange = changedIDs.some((id) => id === programId);

    if (isAnyChange) readFullState();
  };

  useEffect(() => {
    if (!api || !programId || !meta || !isPayload) return;

    const unsub = api.gearEvents.subscribeToGearEvent('MessagesDispatched', handleStateChange);

    return () => {
      unsub.then((unsubCallback) => unsubCallback());
    };
    // Note: We've removed the dependency on payload here to avoid re-subscribing.
  }, [api, programId, meta]);

  useEffect(() => {
    readFullState(true);
    setError('');
  }, [api, programId, meta, isPayload]);

  useEffect(() => {
    if (error) console.log("ERROR");
  }, [error]);

  return { state, isStateRead, error };
}

export function useContractState<T>(programId: HexString, metastr: string, payload?: AnyJson){
    const meta = useProgramMetadata(metastr);

    return useReadFullState<T>(programId, meta, payload);
}

export function useContractStateOnce<T>(api: GearApi | null, programId: HexString, metastr: string, payload: AnyJson){
    const meta = useProgramMetadata(metastr);

    const [state, setState] = useState<T>();

    useEffect(() => {
        if(api && meta){
          api.programState.read({programId, payload}, meta)
          .then((codecState) => codecState.toHuman())
          .then((result) => {
            setState(result as unknown as T);
          })
          .catch((error) => {
            console.error('Error fetching states:', error);
            // Handle errors if necessary
          });
        }
    }, [api, payload, meta]);

      return state;
}

export async function readContractState<T>(api: GearApi, programId: HexString, metastr: string, payload: AnyJson){
  const state = fetch(metastr)
  .then((response) => response.text())
  .then((raw) => `0x${raw}` as HexString)
  .then((metaHex) => ProgramMetadata.from(metaHex))
  .then((meta) => api.programState.read({programId, payload}, meta))
  .then((codecState) => codecState.toHuman() as unknown as T)

  return state;
}