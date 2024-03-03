#![no_std]

use gmeta::{InOut, Metadata};
use gstd::{prelude::*, ActorId};
use parity_scale_codec::{Decode, Encode};
use scale_info::TypeInfo;

pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
    type Init = InOut<ContractInit, ()>;
    type Handle = InOut<ContractHandleAction, ContractHandleEvent>;
    type Reply = InOut<(), ()>;
    type State = InOut<StatePayload, StateOutput>;
    type Signal = ();
    type Others = ();
}

#[derive(Encode, Decode, TypeInfo)]
pub struct ContractInit {
    pub user: ActorId,
    pub main_connector: ActorId,
}

#[derive(Clone, Encode, Decode, TypeInfo)]
pub enum ContractHandleAction {
    AddMessage {
        encrypted_content: String,
        tag: String,
    },
    AddInvitation {
        encrypted_content: String,
        tag: String,
        record: String,
    },
}

#[derive(Encode, Decode, TypeInfo)]
pub enum ContractHandleEvent {
    AddedMessage,
    AddedInvitation,
}

#[derive(Debug, Encode, Decode, TypeInfo, Clone, PartialEq, Eq, Default)]
pub struct Message {
    pub encrypted_content: String,
    pub tag: String,
    pub timestamp: u64,
}

#[derive(Encode, Decode, TypeInfo)]
pub enum StatePayload{
    GetLastMessages{from: u32},
    GetMessage{index: u32},
}

#[derive(Encode, Decode, TypeInfo)]
pub enum StateOutput{
    LastMessages{res: Vec<Message>},
    Message{res: Message},
}