#![no_std]

use gmeta::{InOut, Metadata};
use gstd::{prelude::*, ActorId};
use parity_scale_codec::{Decode, Encode};
use scale_info::TypeInfo;

pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
    type Init = InOut<ConnectionInit, ()>;
    type Handle = InOut<ConnectionHandleAction, ConnectionHandleEvent>;
    type Reply = InOut<(), ()>;
    type State = ConnectionState;
    type Signal = ();
    type Others = ();
}

#[derive(Encode, Decode, TypeInfo)]
pub struct ConnectionInit {
    pub user: ActorId,
}

#[derive(Clone, Encode, Decode, TypeInfo)]
pub enum ConnectionHandleAction {
    Add { user: ActorId },
    Send { encrypted_content: String },
}

#[derive(Encode, Decode, TypeInfo)]
pub enum ConnectionHandleEvent {
    Added { user: ActorId },
    Sended { message: Message },
}

#[derive(Default, Encode, Decode, TypeInfo)]
pub struct ConnectionState{
    pub users: Vec<ActorId>,
    pub messages: Vec<Message>,
}

#[derive(Debug, Encode, Decode, TypeInfo, Clone)]
pub struct Message {
    pub from: ActorId,
    pub encrypted_content: String,
    pub timestamp: u64,
}
