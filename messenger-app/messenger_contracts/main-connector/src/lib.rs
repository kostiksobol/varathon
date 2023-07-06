#![no_std]

use gstd::{exec, msg, prelude::*, ActorId, CodeId};
use main_connector_io::*;
use parity_scale_codec::{Decode, Encode};
use scale_info::TypeInfo;
#[derive(Default)]
pub struct Connector {
    pub pair_connection_code_id: CodeId,
    pub group_connection_code_id: CodeId,
    pub all_connections: BTreeSet<ActorId>,
    pub users_connections: BTreeMap<ActorId, Vec<ActorId>>,
}

impl Connector {
    fn create_pair_connection_with(&mut self, user: ActorId) {
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

        msg::send(user1, ConnectorHandleEvent::PairConnectionCreated, 0)
            .expect("Error in send PairConnectionCreated");
        msg::send(user2, ConnectorHandleEvent::PairConnectionCreated, 0)
            .expect("Error in send PairConnectionCreated");
    }
    fn create_group_connection(&mut self) {
        let msg_source = msg::source();

        let (_, address) = gstd::prog::ProgramGenerator::create_program(
            self.group_connection_code_id,
            group_connection_io::ConnectionInit { user: msg_source }.encode(),
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

        msg::send(msg_source, ConnectorHandleEvent::GroupConnectionCreated, 0)
            .expect("Error in send GroupConnectionCreated");
    }
    fn add_user_to_group_connection(&mut self, user: ActorId) {
        let msg_source = msg::source();

        assert!(
            self.all_connections.contains(&msg_source),
            "This connection was never created"
        );

        match self.users_connections.get_mut(&user) {
            Some(user_connections) => user_connections.push(msg_source),
            None => {
                self.users_connections.insert(user, vec![msg_source]);
            }
        }

        msg::reply(ConnectorHandleEvent::AddedUserToGroupConnection, 0)
            .expect("Error in reply AddedUserToGroupConnection");
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
        ConnectorHandleAction::CreatePairConnetionWith { user } => {
            connector.create_pair_connection_with(user)
        }
        ConnectorHandleAction::CreateGroupConnection => connector.create_group_connection(),
        ConnectorHandleAction::AddUserToGroupConnection { user } => {
            connector.add_user_to_group_connection(user)
        }
    };
}

#[no_mangle]
extern "C" fn state() {
    let connector: &Connector = unsafe { CONNECTOR.get_or_insert(Default::default()) };
    let connection_state = ConnectorState {
        users_connections: connector
            .users_connections
            .iter()
            .map(|(key, value)| (*key, value.clone()))
            .collect(),
    };
    msg::reply(&connection_state, 0).expect("Failed to share state");
}

#[no_mangle]
extern "C" fn metahash() {
    let metahash: [u8; 32] = include!("../.metahash");
    msg::reply(metahash, 0).expect("Failed to share metahash");
}
