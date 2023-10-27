#![no_std]

use gstd::collections::{BTreeMap, BTreeSet};
use gmeta::{InOut, Metadata};
use gstd::{prelude::*, ActorId, CodeId};
use parity_scale_codec::{Decode, Encode};
use scale_info::TypeInfo;

pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
    type Init = InOut<ConnectorInit, ()>;
    type Handle = InOut<ConnectorHandleAction, ConnectorHandleEvent>;
    type Reply = InOut<(), ()>;
    type State = InOut<StatePayload, StateOutput>;
    type Signal = ();
    type Others = ();
}

#[derive(Encode, Decode, TypeInfo)]
pub struct ConnectorInit {
    pub group_connection_code_id: CodeId,
}

#[derive(Clone, Encode, Decode, TypeInfo, Eq, PartialEq)]
pub enum ConnectorHandleAction {
    Register { login: String, name: String, pubkey: String },
    CreateGroupConnection { encrypted_name: String, encrypted_symkey: String },
    AddUserToGroupConnection { user: ActorId },
}

#[derive(Encode, Decode, TypeInfo)]
pub enum ConnectorHandleEvent {
    Registered,
    GroupConnectionCreated,
    AddedUserToGroupConnection,
}

#[derive(Encode, Decode, TypeInfo, Default)]
pub struct User{
    pub address: ActorId,
    pub login: String,
    pub name: String,
    pub pubkey: String,
}

#[derive(Encode, Decode, TypeInfo)]
pub enum StatePayload{
    GetLastChatIdsFrom { from: u32, for_whom: ActorId },
    GetUserByAddress {address: ActorId},
    GetUserByLogin {login: String},
}

#[derive(Encode, Decode, TypeInfo)]
pub enum StateOutput{
    LastChatIds { res: Vec<ActorId> },
    User {res: User},
}