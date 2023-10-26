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
    RegisterPubKey { pubkey: String },
    CreateGroupConnection { encrypted_symkey: String },
    AddUserToGroupConnection { user: ActorId },
}

#[derive(Encode, Decode, TypeInfo)]
pub enum ConnectorHandleEvent {
    RegisteredPubKey,
    GroupConnectionCreated,
    AddedUserToGroupConnection,
}
#[derive(Default)]
pub struct Connector {
    pub group_connection_code_id: CodeId,
    pub users_pubkeys: BTreeMap<ActorId, String>,
    pub all_connections: BTreeSet<ActorId>,
    pub users_connections: BTreeMap<ActorId, Vec<ActorId>>,
}

#[derive(Encode, Decode, TypeInfo)]
pub enum StatePayload{
    GetLastChatIdsFrom { from: u32, for_whom: ActorId },
    GetUserPubKey {user: ActorId},
}

#[derive(Encode, Decode, TypeInfo)]
pub enum StateOutput{
    LastChatIds { res: Vec<ActorId> },
    UserPubKey {res: String},
}