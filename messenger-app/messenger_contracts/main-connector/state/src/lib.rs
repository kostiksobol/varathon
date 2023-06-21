#![no_std]

use gmeta::{metawasm, Metadata};
use gstd::Vec;
use main_connector_io::ProgramMetadata;
use gstd::{ActorId};

#[metawasm]
pub mod metafns{
    pub type State = <ProgramMetadata as Metadata>::State;

    pub fn get_connections(state: State, actor_id: ActorId) -> Vec<ActorId>{
        let mut res = Vec::new();
        for connection in state.connections_users{
            if connection.1.0 == actor_id || connection.1.1 == actor_id{
                res.push(connection.0);
            }
        }
        res
    }
}