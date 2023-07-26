use gstd::CodeId;
use gtest::{Program, System};
use main_connector_io::ConnectorInit;

pub mod check;
pub mod fail;

pub const MAIN_CONNECTOR_PROGRAM_PATH: &str =
    "../target/wasm32-unknown-unknown/release/main_connector.opt.wasm";
pub const GROUP_CONNECTION_PROGRAM_PATH: &str =
    "../target/wasm32-unknown-unknown/release/group_connection.opt.wasm";
pub const MAIN_CONNECTOR_ID: u64 = 2;
pub const ACTOR: [u64; 7] = [3, 4, 5, 6, 7, 8, 9];
pub const FOREIGN_USER: u64 = 1337;

pub fn init_system() -> System {
    let system = System::new();
    system.init_logger();

    system
}

pub fn init_main_connector(sys: &System) -> Program {
    let main_connector_program =
        Program::from_file_with_id(sys, MAIN_CONNECTOR_ID, MAIN_CONNECTOR_PROGRAM_PATH);
    let group_connection_code_id: [u8; 32] = sys.submit_code(GROUP_CONNECTION_PROGRAM_PATH).into();

    let init_main_connector = main_connector_program.send(
        FOREIGN_USER,
        ConnectorInit {
            group_connection_code_id: gstd::CodeId::from(group_connection_code_id),
            pair_connection_code_id: CodeId::default(),
        },
    );

    assert!(!init_main_connector.main_failed());

    main_connector_program
}

pub fn some_situation_for_testing(system: &System) -> (Program, Program) {
    let main_connector_program = init_main_connector(&system);

    let group_connection_program = check::create_group_connection(
        &system,
        &main_connector_program,
        ACTOR[0],
        "-1".to_string(),
    );

    check::add(
        &group_connection_program,
        &main_connector_program,
        ACTOR[0],
        ACTOR[1],
        "-2".to_string(),
    );
    check::add(
        &group_connection_program,
        &main_connector_program,
        ACTOR[0],
        ACTOR[2],
        "-3".to_string(),
    );

    check::send(
        &group_connection_program,
        ACTOR[0],
        "some message from actor 0".to_string(),
    );
    check::send(
        &group_connection_program,
        ACTOR[1],
        "some message from actor 1".to_string(),
    );
    check::send(
        &group_connection_program,
        ACTOR[2],
        "some message from actor 2".to_string(),
    );

    (group_connection_program, main_connector_program)
}

#[test]
fn test_some_situation_for_testing() {
    let _ = some_situation_for_testing(&init_system());
}
