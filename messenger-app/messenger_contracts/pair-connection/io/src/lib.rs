#![no_std]

use parity_scale_codec::{Decode, Encode};
use gmeta::{InOut, Metadata};
use gstd::{prelude::*, ActorId};
use scale_info::TypeInfo;

pub struct ProgramMetadata;

impl Metadata for ProgramMetadata{
    type Init = InOut<ConnectionInit, ()>;
    type Handle = InOut<ConnectionHandleAction, ConnectionHandleEvent>;
    type Reply = InOut<(), ()>;
    type State = Vec<Message>;
    type Signal = ();
    type Others = ();
}


#[derive(Encode, Decode, TypeInfo)]
pub struct ConnectionInit{
    pub side1: ActorId,
    pub side2: ActorId,
}

#[derive(Clone, Encode, Decode, TypeInfo)]
pub enum ConnectionHandleAction{
    Send{
        encrypted_content: String,
    }
}

#[derive(Encode, Decode, TypeInfo)]
pub enum ConnectionHandleEvent{
    Sended{
        message: Message,
    }
}

#[derive(Debug, Encode, Decode, TypeInfo, Clone)]
pub struct Message{
    pub from: ActorId,
    pub encrypted_content: String,
    pub timestamp: u64,
}