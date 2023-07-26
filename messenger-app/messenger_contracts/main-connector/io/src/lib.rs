#![no_std]

use gmeta::{InOut, Metadata};
use gstd::{prelude::*, ActorId, CodeId};
use parity_scale_codec::{Decode, Encode};
use scale_info::TypeInfo;

pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
    type Init = InOut<ConnectorInit, ()>;
    type Handle = InOut<ConnectorHandleAction, ConnectorHandleEvent>;
    type Reply = InOut<(), ()>;
    type State = ConnectorState;
    type Signal = ();
    type Others = ();
}

#[derive(Encode, Decode, TypeInfo)]
pub struct ConnectorInit {
    pub group_connection_code_id: CodeId,
    pub pair_connection_code_id: CodeId,
}

#[derive(Clone, Encode, Decode, TypeInfo, Eq, PartialEq)]
pub enum ConnectorHandleAction {
    RegisterPubKey { pubkey: String },
    CreatePairConnetionWith { user: ActorId },
    CreateGroupConnection { encrypted_symkey: String },
    AddUserToGroupConnection { user: ActorId },
}

#[derive(Encode, Decode, TypeInfo)]
pub enum ConnectorHandleEvent {
    RegisteredPubKey,
    PairConnectionCreated,
    GroupConnectionCreated,
    AddedUserToGroupConnection,
}
#[derive(Default)]
pub struct Connector {
    pub pair_connection_code_id: CodeId,
    pub group_connection_code_id: CodeId,
    pub users_pubkeys: BTreeMap<ActorId, String>,
    pub all_connections: BTreeSet<ActorId>,
    pub users_connections: BTreeMap<ActorId, Vec<ActorId>>,
}

#[derive(Default, Encode, Decode, TypeInfo, PartialEq, Eq, Debug)]
pub struct ConnectorState {
    pub users_pubkeys: Vec<(ActorId, String)>,
    pub all_connections: Vec<ActorId>,
    pub users_connections: Vec<(ActorId, Vec<ActorId>)>,
}
