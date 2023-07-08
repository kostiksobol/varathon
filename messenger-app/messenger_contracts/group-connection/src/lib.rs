#![no_std]

use gstd::{exec, msg, prelude::*, ActorId};

use parity_scale_codec::{Decode, Encode};
use scale_info::TypeInfo;

use group_connection_io::{
    ConnectionHandleAction, ConnectionHandleEvent, ConnectionInit, ConnectionState, Message,
};
#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Connection {
    pub main_connector_id: ActorId,
    pub users: BTreeSet<ActorId>,
    pub messages: Vec<Message>,
}

impl Connection {
    fn add(&mut self, user: ActorId) {
        let msg_source = msg::source();

        assert!(self.users.contains(&msg_source), "You are not allowed");

        assert!(
            self.users.insert(user),
            "Such person already is in the chat"
        );

        msg::send(
            self.main_connector_id,
            main_connector_io::ConnectorHandleAction::AddUserToGroupConnection { user },
            0,
        )
        .expect("Error in send AddUserToGroupConnection'");

        for user in self.users.iter() {
            msg::send(*user, ConnectionHandleEvent::Added { user: *user }, 0)
                .expect("Error in send Added");
        }
    }
    fn send(&mut self, encrypted_content: String) {
        let msg_source = msg::source();

        assert!(self.users.contains(&msg_source), "You are not allowed"); // // Actually, here all the gas will be taken defending from such ddos attack

        let message = Message {
            from: msg_source,
            encrypted_content,
            timestamp: exec::block_timestamp(),
        };

        self.messages.push(message.clone());

        for user in self.users.iter() {
            msg::send(
                *user,
                ConnectionHandleEvent::Sended {
                    message: message.clone(),
                },
                0,
            )
            .expect("Error in send Sended");
        }
    }
}

static mut CONNECTION: Option<Connection> = None;

#[no_mangle]
unsafe extern "C" fn init() {
    let init_config: ConnectionInit = msg::load().expect("Error in decoding ConnectionInit");
    CONNECTION = Some(Connection {
        main_connector_id: msg::source(),
        users: BTreeSet::from([init_config.user]),
        messages: Vec::new(),
    });
}

#[no_mangle]
unsafe extern "C" fn handle() {
    let action: ConnectionHandleAction =
        msg::load().expect("Unable to decode ConnectionHandleAction");
    let connection = CONNECTION.get_or_insert(Default::default());

    match action {
        ConnectionHandleAction::Add { user } => connection.add(user),
        ConnectionHandleAction::Send { encrypted_content } => connection.send(encrypted_content),
    };
}

#[no_mangle]
extern "C" fn state() {
    let connection: &Connection = unsafe { CONNECTION.get_or_insert(Default::default()) };
    let connection_state = ConnectionState {
        users: connection.users.iter().copied().collect(),
        messages: connection.messages.iter().cloned().collect(),
    };
    msg::reply(&connection_state, 0).expect("Failed to share state");
}

#[no_mangle]
extern "C" fn metahash() {
    let metahash: [u8; 32] = include!("../.metahash");
    msg::reply(metahash, 0).expect("Failed to share metahash");
}
