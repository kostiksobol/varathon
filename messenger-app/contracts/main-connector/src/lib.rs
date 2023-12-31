#![no_std]

use gstd::collections::{BTreeMap, BTreeSet};
use gstd::{exec, msg, prelude::*, ActorId, CodeId};
use hashbrown::{HashMap, HashSet};
use main_connector_io::*;
use parity_scale_codec::{Decode, Encode};
use scale_info::TypeInfo;

#[derive(Default)]
pub struct Connector {
    pub group_connection_code_id: CodeId,
    pub addresses_users: HashMap<ActorId, usize>,
    pub logins_users: HashMap<String, usize>,
    pub users: Vec<User>,
    pub all_connections: HashSet<ActorId>,
    pub users_connections: HashMap<ActorId, Vec<ActorId>>,
}

impl Connector {
    fn register_pub_key(&mut self, login: String, name: String, pubkey: String) {
        let msg_source = msg::source();
        let n = self.users.len();
        self.addresses_users
            .try_insert(msg_source, n)
            .expect("You have already been registered");
        self.logins_users.try_insert(login.clone(), n).expect("Such login is taken");
        self.users.push(User { address: msg_source, login, name, pubkey });
        self.users_connections.try_insert(msg_source, Default::default());
    }
    fn create_group_connection(&mut self, encrypted_name: String, encrypted_symkey: String) {
        let msg_source = msg::source();

        let (_, address) = gstd::prog::ProgramGenerator::create_program_with_gas(
            self.group_connection_code_id,
            group_connection_io::ConnectionInit {
                name: encrypted_name,
                user: msg_source,
                encrypted_symkey,
            },
            3_000_000_000,
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
        ConnectorHandleAction::Register { login, name, pubkey } => connector.register_pub_key(login, name, pubkey),
        ConnectorHandleAction::CreateGroupConnection { encrypted_name, encrypted_symkey } => {
            connector.create_group_connection(encrypted_name, encrypted_symkey)
        }
        ConnectorHandleAction::AddUserToGroupConnection { user } => {
            connector.add_user_to_group_connection(user)
        }
    };
}

#[no_mangle]
extern "C" fn state() {
    let payload: StatePayload = msg::load().expect("Error in decoding payload in state function");
    let connector: &mut Connector = unsafe { CONNECTOR.get_or_insert(Default::default()) };

    match payload {
        StatePayload::GetLastChatIdsFrom { from, for_whom } => {
            let res = connector.users_connections.get(&for_whom).unwrap().get(from as usize ..).unwrap_or(Default::default()).to_vec();
            msg::reply(StateOutput::LastChatIds { res }, 0).expect("Failed to share state");
        }
        StatePayload::GetUserByAddress { address } => {
            let res: User;
            match connector.addresses_users.get_mut(&address) {
                None => res = Default::default(),
                Some(n) => res = gstd::mem::take(&mut connector.users[*n]),  
            }
            msg::reply(StateOutput::User { res }, 0).expect("Failed to share state");
        }
        StatePayload::GetUserByLogin { login } => {
            let res: User;
            match connector.logins_users.get_mut(&login) {
                None => res = Default::default(),
                Some(n) => res = gstd::mem::take(&mut connector.users[*n]),  
            }
            msg::reply(StateOutput::User { res }, 0).expect("Failed to share state");
        }
    }
}
