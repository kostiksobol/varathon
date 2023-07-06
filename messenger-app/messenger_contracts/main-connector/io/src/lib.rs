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
    CreatePairConnetionWith { user: ActorId },
    CreateGroupConnection,
    AddUserToGroupConnection { user: ActorId },
}

#[derive(Encode, Decode, TypeInfo)]
pub enum ConnectorHandleEvent {
    PairConnectionCreated,
    GroupConnectionCreated,
    AddedUserToGroupConnection,
}
#[derive(Default)]
pub struct Connector {
    pub pair_connection_code_id: CodeId,
    pub group_connection_code_id: CodeId,
    pub all_connections: BTreeSet<ActorId>,
    pub users_connections: BTreeMap<ActorId, Vec<ActorId>>,
}

#[derive(Default, Encode, Decode, TypeInfo)]
pub struct ConnectorState {
    pub users_connections: Vec<(ActorId, Vec<ActorId>)>,
}
