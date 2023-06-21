#![no_std]

use parity_scale_codec::{Decode, Encode};
use scale_info::TypeInfo;
use gstd::{msg, prelude::*, ActorId, exec, CodeId};
use main_connector_io::*;
use pair_connection_io::*;


#[derive(Default)]
pub struct Connector{
    pub connection_code_id: CodeId,
    pub users: HashMap<ActorId, Vec<ActorId>>,
    pub connections_users: HashMap<ActorId, (ActorId, ActorId)>,
}

impl Connector{
    fn connect(&mut self, side1: ActorId, side2: ActorId){
        let (_, address) = gstd::prog::ProgramGenerator::create_program(
            self.connection_code_id,
            ConnectionInit {
                side1,
                side2,
            }
            .encode(),
            0,
        )
        .expect("Error during Connection program initialization");
        if self.users.contains_key(&side1){
            self.users.get_mut(&side1).unwrap().push(address);
        }
        else{
            self.users.insert(side1, vec![address]);
        }
        if self.users.contains_key(&side2){
            self.users.get_mut(&side2).unwrap().push(address);
        }
        else{
            self.users.insert(side2, vec![address]);
        }
        self.connections_users.insert(address, (side1, side2));
        msg::send(side1, ConnectorHandleEvent::ConnectionCreated, 0).expect("Error");
        msg::send(side2, ConnectorHandleEvent::ConnectionCreated, 0).expect("Error");
    }
}

static mut CONNECTOR: Option<Connector> = None;

#[no_mangle]
unsafe extern "C" fn init() {
    let code_id: CodeId = msg::load().expect("Error in decoding ConnectionInit");
    CONNECTOR = Some(Connector{connection_code_id: code_id, ..Default::default()});
}

#[no_mangle]
unsafe extern "C" fn handle() {
    let action: ConnectorHandleAction = msg::load().expect("Unable to decode MessengerHandleAction");
    let connector = CONNECTOR.get_or_insert(Default::default());

    match action {
        ConnectorHandleAction::Connect { to } => connector.connect(msg::source(), to),
    };
}

#[no_mangle]
extern "C" fn state() {
    let connector: &Connector = unsafe { CONNECTOR.get_or_insert(Default::default()) };
    let connection_state = ConnectorState{
        users: connector.users.iter().map(|(key, value)| (*key, (*value).clone())).collect(),
        connections_users: connector.connections_users.iter().map(|(key, value)| (*key, *value)).collect()};
    msg::reply(&connection_state, 0).expect("Failed to share state");
}

#[no_mangle]
extern "C" fn metahash() {
    let metahash: [u8; 32] = include!("../.metahash");
    msg::reply(metahash, 0).expect("Failed to share metahash");
}