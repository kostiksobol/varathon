#![no_std]

use gstd::{exec, msg, prelude::*, ActorId};
use gstd::collections::{BTreeMap, BTreeSet};

use hashbrown::HashMap;
use parity_scale_codec::{Decode, Encode};
use scale_info::TypeInfo;

use group_connection_io::{
    ConnectionHandleAction, ConnectionHandleEvent, ConnectionInit, ConnectionState, Message, StatePayload, StateOutput, IpfsFile,
};
#[derive(Default)]
pub struct Connection {
    pub main_connector_id: ActorId,
    pub users_encrypted_symkeys: HashMap<ActorId, String>,
    pub users: Vec<ActorId>,
    pub messages: Vec<Message>,
}

impl Connection {
    fn add(&mut self, user: ActorId, encrypted_symkey: String) {
        let msg_source = msg::source();

        assert!(
            self.users.contains(&msg_source),
            "You are not allowed to do that"
        );

        self.users_encrypted_symkeys
            .try_insert(user, encrypted_symkey)
            .expect("Such person is already in the chat");

        self.users.push(user);

        msg::send_with_gas(
            self.main_connector_id,
            main_connector_io::ConnectorHandleAction::AddUserToGroupConnection { user },
            2_000_000_000,
            0,
        )
        .expect("Error in send AddUserToGroupConnection");
    }
    fn send(&mut self, encrypted_content: String, files: Vec<IpfsFile>) {
        let msg_source = msg::source();

        assert!(
            self.users.contains(&msg_source),
            "You are not allowed to do that"
        );

        let mut message = Message {
            from: msg_source,
            encrypted_content,
            files,
            timestamp: exec::block_timestamp(),
        };

        self.messages.push(gstd::mem::take(&mut message));
    }
}

static mut CONNECTION: Option<Connection> = None;

#[no_mangle]
unsafe extern "C" fn init() {
    let init_config: ConnectionInit = msg::load().expect("#Error in decoding ConnectionInit#");
    CONNECTION = Some(Connection {
        main_connector_id: msg::source(),
        users_encrypted_symkeys: HashMap::from([(init_config.user, init_config.encrypted_symkey)]),
        users: Vec::from([init_config.user]),
        ..Default::default()
    });
}

#[no_mangle]
unsafe extern "C" fn handle() {
    let action: ConnectionHandleAction =
        msg::load().expect("Unable to decode ConnectionHandleAction");
    let connection = CONNECTION.get_or_insert(Default::default());

    match action {
        ConnectionHandleAction::Add {
            user,
            encrypted_symkey,
        } => connection.add(user, encrypted_symkey),
        ConnectionHandleAction::Send { encrypted_content, files } => connection.send(encrypted_content, files),
    };
}

#[no_mangle]
extern "C" fn state() {
    let payload: StatePayload = msg::load().expect("Error in decoding payload in state function");
    let connection: &mut Connection = unsafe { CONNECTION.get_or_insert(Default::default()) };
    match payload {
        StatePayload::GetUsersStartFrom { from } => {
            let res = connection.users.get(from as usize ..).unwrap_or(Default::default()).to_vec();
            msg::reply(StateOutput::UsersStartFrom { res }, 0).expect("Failed to share state");
        }
        StatePayload::GetMessagesStartFrom { from } => {
            let res = connection.messages.get(from as usize ..).unwrap_or(Default::default()).to_vec();
            msg::reply(StateOutput::MessagesStartFrom { res }, 0).expect("Failed to share state");
        }
        StatePayload::GetUserEncryptedSymkey { user } => {
            let res = gstd::mem::take(connection.users_encrypted_symkeys.get_mut(&user).unwrap());
            msg::reply(StateOutput::UserEncryptedSymkey { res }, 0).expect("Failed to share state");
        }
    }
}
