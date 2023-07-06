#![no_std]

use gstd::{exec, msg, prelude::*, ActorId};

use parity_scale_codec::{Decode, Encode};
use scale_info::TypeInfo;

use pair_connection_io::{ConnectionHandleAction, ConnectionHandleEvent, ConnectionInit, Message};

#[derive(Default, Encode, Decode, TypeInfo)]
pub struct Connection {
    pub users: [ActorId; 2],
    pub messages: Vec<Message>,
}

impl Connection {
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
        users: [init_config.user1, init_config.user2],
        messages: Vec::new(),
    });
}

#[no_mangle]
unsafe extern "C" fn handle() {
    let action: ConnectionHandleAction =
        msg::load().expect("Unable to decode ConnectionHandleAction");
    let connection = CONNECTION.get_or_insert(Default::default());

    match action {
        ConnectionHandleAction::Send { encrypted_content } => connection.send(encrypted_content),
    };
}

#[no_mangle]
extern "C" fn state() {
    let connection: &Connection = unsafe { CONNECTION.get_or_insert(Default::default()) };
    msg::reply(&connection.messages, 0).expect("Failed to share state'");
}

#[no_mangle]
extern "C" fn metahash() {
    let metahash: [u8; 32] = include!("../.metahash");
    msg::reply(metahash, 0).expect("Failed to share metahash");
}
