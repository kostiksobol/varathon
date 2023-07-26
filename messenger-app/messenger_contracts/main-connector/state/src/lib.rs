#![no_std]

use gmeta::String;
use gmeta::{metawasm, Metadata};
use gstd::ActorId;
use gstd::Vec;
use main_connector_io::ProgramMetadata;

#[metawasm]
pub mod metafns {

    pub type State = <ProgramMetadata as Metadata>::State;

    pub fn get_user_connections(state: State, user: ActorId) -> Vec<ActorId> {
        for user_connection in state.users_connections {
            if user_connection.0 == user {
                return user_connection.1;
            }
        }
        Default::default()
    }

    pub fn get_user_pubkey(state: State, user: ActorId) -> String {
        for user_pubkey in state.users_pubkeys {
            if user_pubkey.0 == user {
                return user_pubkey.1;
            }
        }
        Default::default()
    }
}
