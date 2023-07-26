#![no_std]
#![feature(map_try_insert)]

use gstd::{exec, msg, prelude::*, ActorId};

use parity_scale_codec::{Decode, Encode};
use scale_info::TypeInfo;

use group_connection_io::{
    ConnectionHandleAction, ConnectionHandleEvent, ConnectionInit, ConnectionState, Message,
};
#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Connection {
    pub main_connector_id: ActorId,
    pub users_encrypted_symkeys: BTreeMap<ActorId, String>,
    pub messages: Vec<Message>,
}

impl Connection {
    fn add(&mut self, user: ActorId, encrypted_symkey: String) {
        let msg_source = msg::source();

        assert!(self.users_encrypted_symkeys.contains_key(&msg_source), "You are not allowed to do that");

        self.users_encrypted_symkeys.try_insert(user, encrypted_symkey).expect("Such person is already in the chat");

        // msg::send_with_gas(
        //     self.main_connector_id,
        //     main_connector_io::ConnectorHandleAction::AddUserToGroupConnection { user },
        //     1_000_000_000,
        //     0,
        // )
        // .expect("Error in send AddUserToGroupConnection'");

        msg::send(
            self.main_connector_id,
            main_connector_io::ConnectorHandleAction::AddUserToGroupConnection { user },
            0,
        )
        .expect("Error in send AddUserToGroupConnection");
    }
    fn send(&mut self, encrypted_content: String) {
        let msg_source = msg::source();

        assert!(self.users_encrypted_symkeys.contains_key(&msg_source), "#You are not allowed to do that#");

        let message = Message {
            from: msg_source,
            encrypted_content,
            timestamp: exec::block_timestamp(),
        };

        self.messages.push(message.clone());
    }
}

static mut CONNECTION: Option<Connection> = None;

#[no_mangle]
unsafe extern "C" fn init() {
    let init_config: ConnectionInit = msg::load().expect("#Error in decoding ConnectionInit#");
    CONNECTION = Some(Connection {
        main_connector_id: msg::source(),
        users_encrypted_symkeys: BTreeMap::from([(init_config.user, init_config.encrypted_symkey)]),
        messages: Vec::new(),
    });
}

#[no_mangle]
unsafe extern "C" fn handle() {
    let action: ConnectionHandleAction =
        msg::load().expect("#Unable to decode ConnectionHandleAction#");
    let connection = CONNECTION.get_or_insert(Default::default());

    match action {
        ConnectionHandleAction::Add { user, encrypted_symkey } => connection.add(user, encrypted_symkey),
        ConnectionHandleAction::Send { encrypted_content } => connection.send(encrypted_content),
    };
}

#[no_mangle]
extern "C" fn state() {
    let connection: &Connection = unsafe { CONNECTION.get_or_insert(Default::default()) };
    let connection_state = ConnectionState {
        users_encrypted_symkeys: connection.users_encrypted_symkeys.iter().map(|(key, value)| (*key, value.clone())).collect(),
        messages: connection.messages.iter().cloned().collect(),
    };
    msg::reply(&connection_state, 0).expect("Failed to share state");
}
