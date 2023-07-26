#![no_std]

use gmeta::String;
use gmeta::{metawasm, Metadata};
use group_connection_io::Message;
use group_connection_io::ProgramMetadata;
use gstd::ActorId;
use gstd::Vec;

#[metawasm]
pub mod metafns {
    pub type State = <ProgramMetadata as Metadata>::State;

    pub fn get_all_users(state: State) -> Vec<ActorId> {
        state
            .users_encrypted_symkeys
            .iter()
            .map(|(key, value)| *key)
            .collect()
    }

    pub fn get_all_messages(state: State) -> Vec<Message> {
        state.messages
    }

    pub fn get_user_encrypted_symkey(state: State, user: ActorId) -> String {
        for user_encrypted_symkey in state.users_encrypted_symkeys {
            if user_encrypted_symkey.0 == user {
                return user_encrypted_symkey.1;
            }
        }
        Default::default()
    }
}
