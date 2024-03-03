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
    type State = InOut<StatePayload, StateOutput>;
    type Signal = ();
    type Others = ();
}

#[derive(Encode, Decode, TypeInfo)]
pub struct ConnectorInit {
    pub user_contract_code_id: CodeId,
}

#[derive(Clone, Encode, Decode, TypeInfo, Eq, PartialEq)]
pub enum ConnectorHandleAction {
    Register { login: String, name: String, pubkey: String },
    AddRecord { record: String, index: u64 },
}

#[derive(Encode, Decode, TypeInfo)]
pub enum ConnectorHandleEvent {
    Registered,
    AddedRecord,
}

#[derive(Encode, Decode, TypeInfo, Default, Clone)]
pub struct Record{
    pub record: String,
    pub index: u64,
}

#[derive(Encode, Decode, TypeInfo, Default)]
pub struct User{
    pub address: ActorId,
    pub login: String,
    pub name: String,
    pub pubkey: String,
    pub contract: ActorId,
}

#[derive(Encode, Decode, TypeInfo)]
pub enum StatePayload{
    GetLastRecords { from: u32 },
    GetUserByAddress {address: ActorId},
    GetUserByLogin {login: String},
}

#[derive(Encode, Decode, TypeInfo)]
pub enum StateOutput{
    LastRecords { res: Vec<Record> },
    User {res: User},
}