use group_connection_io::{ConnectionHandleAction, ConnectionState, Message};
use gstd::{prelude::*, ActorId};
use gtest::Program;
use main_connector_io::ConnectorState;

pub fn send(group_connection_program: &Program, sender: u64, encrypted_content: String) {
    let state_before_send: ConnectionState = group_connection_program
        .read_state()
        .expect("Error in reading state");

    let run_res =
        group_connection_program.send(sender, ConnectionHandleAction::Send { encrypted_content });
    assert!(run_res.main_failed());

    let state_after_send: ConnectionState = group_connection_program
        .read_state()
        .expect("Error in reading state");

    assert_eq!(state_after_send, state_before_send);
}

pub fn add(
    group_connection_program: &Program,
    main_connector_program: &Program,
    adder: u64,
    user: u64,
) {
    let group_state_before_add: ConnectionState = group_connection_program
        .read_state()
        .expect("Error in reading state");
    let main_state_before_add: ConnectorState = main_connector_program
        .read_state()
        .expect("Error in reading state");

    let run_res =
        group_connection_program.send(adder, ConnectionHandleAction::Add { user: user.into() });
    if !run_res.main_failed() {
        assert!(run_res.others_failed());
    }

    let group_state_after_add: ConnectionState = group_connection_program
        .read_state()
        .expect("Error in reading state");
    let main_state_after_add: ConnectorState = main_connector_program
        .read_state()
        .expect("Error in reading state");

    assert_eq!(group_state_before_add, group_state_after_add);
    assert_eq!(main_state_before_add, main_state_after_add);
}
