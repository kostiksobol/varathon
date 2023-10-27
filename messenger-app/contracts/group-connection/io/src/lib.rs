#![no_std]

use gstd::collections::{BTreeMap, BTreeSet};
use gmeta::{InOut, Metadata};
use gstd::{prelude::*, ActorId};
use parity_scale_codec::{Decode, Encode};
use scale_info::TypeInfo;

pub struct ProgramMetadata;

impl Metadata for ProgramMetadata {
    type Init = InOut<ConnectionInit, ()>;
    type Handle = InOut<ConnectionHandleAction, ConnectionHandleEvent>;
    type Reply = InOut<(), ()>;
    type State = InOut<StatePayload, StateOutput>;
    type Signal = ();
    type Others = ();
}

#[derive(Encode, Decode, TypeInfo)]
pub struct ConnectionInit {
    pub name: String,
    pub user: ActorId,
    pub encrypted_symkey: String,
}

#[derive(Clone, Encode, Decode, TypeInfo)]
pub enum ConnectionHandleAction {
    Add {
        user: ActorId,
        encrypted_symkey: String,
    },
    Send {
        encrypted_content: String,
        files: Vec<IpfsFile>,
    },
}

#[derive(Encode, Decode, TypeInfo)]
pub enum ConnectionHandleEvent {
    Added { user: ActorId },
    Sended { message: Message },
}

#[derive(Default, Encode, Decode, TypeInfo, PartialEq, Eq, Debug)]
pub struct ConnectionState {
    pub users_encrypted_symkeys: Vec<(ActorId, String)>,
    pub messages: Vec<Message>,
}

#[derive(Debug, Encode, Decode, TypeInfo, Clone, PartialEq, Eq, Default)]
pub struct IpfsFile{
    pub name: String,
    pub tip: String,
    pub sizet: String,
    pub hashipfs: String,
}

#[derive(Debug, Encode, Decode, TypeInfo, Clone, PartialEq, Eq, Default)]
pub struct Message {
    pub from: ActorId,
    pub encrypted_content: String,
    pub files: Vec<IpfsFile>,
    pub timestamp: u64,
}

#[derive(Encode, Decode, TypeInfo)]
pub enum StatePayload{
    GetName,
    GetUsersStartFrom{from: u32},
    GetMessagesStartFrom{from: u32},
    GetUserEncryptedSymkey{user: ActorId},
}

#[derive(Encode, Decode, TypeInfo)]
pub enum StateOutput{
    Name{res: String},
    UsersStartFrom{res: Vec<ActorId>},
    MessagesStartFrom{res: Vec<Message>},
    UserEncryptedSymkey{res: String},
}