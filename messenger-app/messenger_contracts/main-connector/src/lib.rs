#![no_std]
#![feature(map_try_insert)]

use gstd::{exec, msg, prelude::*, ActorId, CodeId};
use main_connector_io::*;
use parity_scale_codec::{Decode, Encode};
use scale_info::TypeInfo;
#[derive(Default)]
pub struct Connector {
    pub pair_connection_code_id: CodeId,
    pub group_connection_code_id: CodeId,
    pub users_pubkeys: BTreeMap<ActorId, String>,
    pub all_connections: BTreeSet<ActorId>,
    pub users_connections: BTreeMap<ActorId, Vec<ActorId>>,
}

impl Connector {
    fn register_pub_key(&mut self, pubkey: String) {
        self.users_pubkeys
            .try_insert(msg::source(), pubkey)
            .expect("You have already been registered");
    }
    fn create_pair_connection_with(&mut self, user: ActorId) {
        panic!("not implemented");
        let user1 = msg::source();
        let user2 = user;

        let (_, address) = gstd::prog::ProgramGenerator::create_program(
            self.pair_connection_code_id,
            pair_connection_io::ConnectionInit { user1, user2 }.encode(),
            0,
        )
        .expect("Error during PairConnection program initialization'");

        self.all_connections.insert(address);

        match self.users_connections.get_mut(&user1) {
            Some(user_connections) => user_connections.push(address),
            None => {
                self.users_connections.insert(user1, vec![address]);
            }
        }
        match self.users_connections.get_mut(&user2) {
            Some(user_connections) => user_connections.push(address),
            None => {
                self.users_connections.insert(user2, vec![address]);
            }
        }
    }
    fn create_group_connection(&mut self, encrypted_symkey: String) {
        let msg_source = msg::source();

        let (_, address) = gstd::prog::ProgramGenerator::create_program(
            self.group_connection_code_id,
            group_connection_io::ConnectionInit {
                user: msg_source,
                encrypted_symkey,
            }
            .encode(),
            0,
        )
        .expect("Error during GroupConnection program initialization");

        self.all_connections.insert(address);

        match self.users_connections.get_mut(&msg_source) {
            Some(user_connections) => user_connections.push(address),
            None => {
                self.users_connections.insert(msg_source, vec![address]);
            }
        }
    }
    fn add_user_to_group_connection(&mut self, user: ActorId) {
        let msg_source = msg::source();

        assert!(
            self.all_connections.contains(&msg_source),
            "This connection was never created by Me"
        );

        match self.users_connections.get_mut(&user) {
            Some(user_connections) => user_connections.push(msg_source),
            None => {
                self.users_connections.insert(user, vec![msg_source]);
            }
        }
    }
}

static mut CONNECTOR: Option<Connector> = None;

#[no_mangle]
unsafe extern "C" fn init() {
    let init_config: ConnectorInit = msg::load().expect("Error in decoding ConnectionInit");
    CONNECTOR = Some(Connector {
        pair_connection_code_id: init_config.pair_connection_code_id,
        group_connection_code_id: init_config.group_connection_code_id,
        ..Default::default()
    });
}

#[no_mangle]
unsafe extern "C" fn handle() {
    let action: ConnectorHandleAction =
        msg::load().expect("Unable to decode MessengerHandleAction");
    let connector = CONNECTOR.get_or_insert(Default::default());

    match action {
        ConnectorHandleAction::RegisterPubKey { pubkey } => connector.register_pub_key(pubkey),
        ConnectorHandleAction::CreatePairConnetionWith { user } => {
            connector.create_pair_connection_with(user)
        }

        ConnectorHandleAction::CreateGroupConnection { encrypted_symkey } => {
            connector.create_group_connection(encrypted_symkey)
        }
        ConnectorHandleAction::AddUserToGroupConnection { user } => {
            connector.add_user_to_group_connection(user)
        }
    };
}

#[no_mangle]
extern "C" fn state() {
    let connector: &mut Connector = unsafe { CONNECTOR.get_or_insert(Default::default()) };
    let connection_state = ConnectorState {
        users_pubkeys: connector
            .users_pubkeys
            .iter_mut()
            .map(|(key, value)| (*key, gstd::mem::take(value)))
            .collect(),
        all_connections: connector
            .all_connections
            .iter()
            .map(|value| *value)
            .collect(),
        users_connections: connector
            .users_connections
            .iter_mut()
            .map(|(key, value)| (*key, gstd::mem::take(value)))
            .collect(),
    };
    msg::reply(&connection_state, 0).expect("Failed to share state");
}
