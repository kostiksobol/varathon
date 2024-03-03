#![no_std]

use gstd::{exec, msg, prelude::*, ActorId, CodeId};
use hashbrown::{HashMap, HashSet};
use main_connector_io::*;
use parity_scale_codec::{Decode, Encode};
use scale_info::TypeInfo;

#[derive(Default)]
pub struct Connector {
    pub user_contract_code_id: CodeId,
    pub addresses_users: HashMap<ActorId, usize>,
    pub logins_users: HashMap<String, usize>,
    pub users: Vec<User>,
    pub records: Vec<Record>,
}

impl Connector {
    fn register(&mut self, login: String, name: String, pubkey: String) {
        let msg_source = msg::source();

        let (_, address) = gstd::prog::ProgramGenerator::create_program_with_gas(
            self.user_contract_code_id,
            user_contract_io::ContractInit {
                user: msg_source,
                main_connector: exec::program_id(),
            },
            3_000_000_000,
            0,
        )
        .expect("Error during UserContract program initialization");

        let n = self.users.len();
        self.addresses_users
            .try_insert(msg_source, n)
            .expect("You have already been registered");
        self.logins_users.try_insert(login.clone(), n).expect("Such login is taken");
        self.users.push(User { address: msg_source, login, name, pubkey, contract: address });
    }

    fn add_record(&mut self, record: String, index: u64) {
        self.records.push(Record{record, index});
    }
}

static mut CONNECTOR: Option<Connector> = None;

#[no_mangle]
unsafe extern "C" fn init() {
    let init_config: ConnectorInit = msg::load().expect("Error in decoding ConnectionInit");
    CONNECTOR = Some(Connector {
        user_contract_code_id: init_config.user_contract_code_id,
        ..Default::default()
    });
}

#[no_mangle]
unsafe extern "C" fn handle() {
    let action: ConnectorHandleAction =
        msg::load().expect("Unable to decode MessengerHandleAction");
    let connector = CONNECTOR.get_or_insert(Default::default());

    match action {
        ConnectorHandleAction::Register { login, name, pubkey } => connector.register(login, name, pubkey),
        ConnectorHandleAction::AddRecord { record, index } => {
            connector.add_record(record, index);
        }
    };
}

#[no_mangle]
extern "C" fn state() {
    let payload: StatePayload = msg::load().expect("Error in decoding payload in state function");
    let connector: &mut Connector = unsafe { CONNECTOR.get_or_insert(Default::default()) };

    match payload {
        StatePayload::GetLastRecords { from } => {
            let res = connector.records.get(from as usize ..).unwrap_or(Default::default()).to_vec();
            msg::reply(StateOutput::LastRecords { res }, 0).expect("Failed to share state");
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