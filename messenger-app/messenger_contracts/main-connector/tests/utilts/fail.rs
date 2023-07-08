use group_connection_io::{ConnectionHandleAction, ConnectionState, Message};
use gstd::{prelude::*, ActorId};
use gtest::{Program, System};
use main_connector_io::{ConnectorHandleAction, ConnectorState};

pub fn create_group_connection(sys: &System, main_connector_program: &Program, creator: u64) {
    let main_state_before: ConnectorState = main_connector_program
        .read_state()
        .expect("Error in reading state");

    let run_res =
        main_connector_program.send(creator, ConnectorHandleAction::CreateGroupConnection);
    assert!(run_res.main_failed());

    let mut main_state_after: ConnectorState = main_connector_program
        .read_state()
        .expect("Error in reading state");

    assert_eq!(main_state_before, main_state_after);
}

pub fn add_user_to_group_connection(
    main_connector_program: &Program,
    group_connection_program: &Program,
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

pub fn add_user_to_group_connection_directly(
    main_connector_program: &Program,
    adder: u64,
    user: u64,
) {
    let main_state_before_add: ConnectorState = main_connector_program
        .read_state()
        .expect("Error in reading state");

    let run_res = main_connector_program.send(
        adder,
        ConnectorHandleAction::AddUserToGroupConnection { user: user.into() },
    );
    assert!(run_res.main_failed());

    let main_state_after_add: ConnectorState = main_connector_program
        .read_state()
        .expect("Error in reading state");

    assert_eq!(main_state_before_add, main_state_after_add);
}
