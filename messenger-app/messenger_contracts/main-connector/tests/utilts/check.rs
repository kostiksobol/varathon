use group_connection_io::{ConnectionHandleAction, ConnectionState, Message};
use gstd::{prelude::*, ActorId};
use gtest::{Program, System};
use main_connector_io::{ConnectorHandleAction, ConnectorState};

pub fn create_group_connection<'a, 'b>(
    sys: &'a System,
    main_connector_program: &'b Program,
    creator: u64,
) -> Program<'a> {
    let main_state_before: ConnectorState = main_connector_program
        .read_state()
        .expect("Error in reading state");

    let run_res =
        main_connector_program.send(creator, ConnectorHandleAction::CreateGroupConnection);
    assert!(!run_res.main_failed());

    let mut main_state_after: ConnectorState = main_connector_program
        .read_state()
        .expect("Error in reading state");

    let pos = main_state_after
        .users_connections
        .iter()
        .position(|x| x.0 == creator.into())
        .unwrap();

    let last_connection_add_for_user_from_main_state: [u8; 32] = main_state_after.users_connections
        [pos]
        .1
        .pop()
        .unwrap()
        .into();

    if main_state_after.users_connections[pos].1.len() == 0 {
        main_state_after.users_connections.remove(pos);
    }

    assert_eq!(main_state_before, main_state_after);

    let group_connection_program = sys.get_program(last_connection_add_for_user_from_main_state);

    group_connection_program
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
    assert!(!run_res.main_failed());
    assert!(!run_res.others_failed());

    let mut group_state_after_add: ConnectionState = group_connection_program
        .read_state()
        .expect("Error in reading state");
    let mut main_state_after_add: ConnectorState = main_connector_program
        .read_state()
        .expect("Error in reading state");

    let last_add_from_group_state = group_state_after_add
        .users
        .pop()
        .expect("Eror during pop last add");
    let pos = main_state_after_add
        .users_connections
        .iter()
        .position(|x| x.0 == user.into())
        .unwrap();
    let last_connection_add_for_user_from_main_state =
        main_state_after_add.users_connections[pos].1.pop().unwrap();
    if main_state_after_add.users_connections[pos].1.len() == 0 {
        main_state_after_add.users_connections.remove(pos);
    }

    let a: [u8; 32] = last_connection_add_for_user_from_main_state.into();
    let b: [u8; 32] = group_connection_program.id().into();

    assert_eq!(a, b);
    assert_eq!(last_add_from_group_state, user.into());

    assert_eq!(group_state_before_add, group_state_after_add);
    assert_eq!(main_state_before_add, main_state_after_add);
}
