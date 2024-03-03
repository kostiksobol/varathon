#![no_std]

use gstd::{exec, msg, prelude::*, ActorId};

use parity_scale_codec::{Decode, Encode};
use scale_info::TypeInfo;
use user_contract_io::{ContractHandleAction, ContractInit, Message, StateOutput, StatePayload};

#[derive(Default)]
pub struct Contract {
    pub owner: ActorId,
    pub main_connector_id: ActorId,
    pub messages: Vec<Message>,
}

impl Contract {
    fn add_message(&mut self, encrypted_content: String, tag: String) {
        let msg_source = msg::source();

        assert_eq!(msg_source, self.owner, "You are not allowed to do that");

        self.messages.push(Message{encrypted_content, tag, timestamp: exec::block_timestamp()});
    }
    fn add_invitation(&mut self, encrypted_content: String, tag: String, record: String){
        let msg_source = msg::source();

        assert_eq!(msg_source, self.owner, "You are not allowed to do that");

        self.messages.push(Message{encrypted_content, tag, timestamp: exec::block_timestamp() });

        let n = self.messages.len() - 1;

        msg::send_with_gas(
            self.main_connector_id,
             main_connector_io::ConnectorHandleAction::AddRecord { record, index:  n as u64},
            2_000_000_000,
            0,
        )
        .expect("Error in send AddUserToGroupConnection");
    }
}

static mut CONTRACT: Option<Contract> = None;

#[no_mangle]
unsafe extern "C" fn init() {
    let init_config: ContractInit = msg::load().expect("#Error in decoding ContractInit#");
    CONTRACT = Some(Contract {
        owner: init_config.user,
        main_connector_id: init_config.main_connector,
        ..Default::default()
    });
}

#[no_mangle]
unsafe extern "C" fn handle() {
    let action: ContractHandleAction =
        msg::load().expect("Unable to decode ContractHandleAction");
    let contract = CONTRACT.get_or_insert(Default::default());

    match action {
        ContractHandleAction::AddMessage { encrypted_content, tag } => contract.add_message(encrypted_content, tag),
        ContractHandleAction::AddInvitation { encrypted_content, tag, record } => contract.add_invitation(encrypted_content, tag, record),
    };
}

#[no_mangle]
extern "C" fn state() {
    let payload: StatePayload = msg::load().expect("Error in decoding payload in state function");
    let contract: &mut Contract = unsafe { CONTRACT.get_or_insert(Default::default()) };
    match payload {
        StatePayload::GetLastMessages { from } => {
            let res = contract.messages.get(from as usize ..).unwrap_or(Default::default()).to_vec();
            msg::reply(StateOutput::LastMessages { res }, 0).expect("Failed to share state");
        },
        StatePayload::GetMessage { index } => {
            let fuck = Default::default();
            let res = contract.messages.get(index as usize).unwrap_or(&fuck);
            msg::reply(StateOutput::Message { res: res.clone() }, 0).expect("Failed to share state");
        }
    }
}