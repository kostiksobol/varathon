#![no_std]

use parity_scale_codec::{Decode, Encode};
use gmeta::{InOut, Metadata};
use gstd::{prelude::*, ActorId, MessageId, CodeId};
use scale_info::TypeInfo;

pub struct ProgramMetadata;

impl Metadata for ProgramMetadata{
    type Init = InOut<CodeId, ()>;
    type Handle = InOut<ConnectorHandleAction, ConnectorHandleEvent>;
    type Reply = InOut<(), ()>;
    type State = ConnectorState;
    type Signal = ();
    type Others = ();
}


#[derive(Clone, Encode, Decode, TypeInfo, Eq, PartialEq)]
pub enum ConnectorHandleAction{
    Connect{
        to: ActorId,
    },
}

#[derive(Encode, Decode, TypeInfo)]
pub enum ConnectorHandleEvent{
    ConnectionCreated,
}

#[derive(Default)]
pub struct Connector{
    pub connection_code_id: CodeId,
    pub users: HashMap<ActorId, Vec<ActorId>>,
    pub connections_users: HashMap<ActorId, (ActorId, ActorId)>,
}

#[derive(Default, Encode, Decode, TypeInfo)]
pub struct ConnectorState{
    pub users: Vec<(ActorId, Vec<ActorId>)>,
    pub connections_users: Vec<(ActorId, (ActorId, ActorId))>,
}