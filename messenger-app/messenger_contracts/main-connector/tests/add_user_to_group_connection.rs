use utilts::{check, fail, init_system, some_situation_for_testing, ACTOR};

pub mod utilts;

#[test]
fn add_user_to_group_connection_normal() {
    let system = init_system();
    let (main_connector_program, group_programs) = some_situation_for_testing(&system);

    check::add_user_to_group_connection(
        &main_connector_program,
        &group_programs[0],
        ACTOR[1],
        ACTOR[2],
        "1".to_string(),
    );
    check::add_user_to_group_connection(
        &main_connector_program,
        &group_programs[0],
        ACTOR[2],
        ACTOR[3],
        "2".to_string(),
    );
    check::add_user_to_group_connection(
        &main_connector_program,
        &group_programs[1],
        ACTOR[1],
        ACTOR[5],
        "3".to_string(),
    );
    check::add_user_to_group_connection(
        &main_connector_program,
        &group_programs[2],
        ACTOR[2],
        ACTOR[5],
        "4".to_string(),
    );
}

#[test]
fn add_user_to_group_connection_directly_but_not_from_contracts_created_by_main_connector() {
    let system = init_system();
    let (main_connector_program, group_programs) = some_situation_for_testing(&system);

    fail::add_user_to_group_connection_directly(&main_connector_program, ACTOR[0], ACTOR[1]);
    fail::add_user_to_group_connection_directly(&main_connector_program, ACTOR[2], ACTOR[1]);
    fail::add_user_to_group_connection_directly(&main_connector_program, ACTOR[3], ACTOR[1]);
}
