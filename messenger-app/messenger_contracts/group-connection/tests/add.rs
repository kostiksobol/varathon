use gtest::Program;
use utilts::{check, fail, init_main_connector, init_system, some_situation_for_testing, ACTOR};
pub mod utilts;

#[test]
fn add_normal() {
    let system = init_system();
    let (group_connection_program, main_connector_program) = some_situation_for_testing(&system);

    check::add(
        &group_connection_program,
        &main_connector_program,
        ACTOR[0],
        ACTOR[4],
    );
    check::add(
        &group_connection_program,
        &main_connector_program,
        ACTOR[1],
        ACTOR[5],
    );
    check::add(
        &group_connection_program,
        &main_connector_program,
        ACTOR[2],
        ACTOR[6],
    );
}

#[test]
fn add_from_not_belonging_to_group() {
    let system = init_system();
    let (group_connection_program, main_connector_program) = some_situation_for_testing(&system);

    fail::add(
        &group_connection_program,
        &main_connector_program,
        ACTOR[4],
        ACTOR[4],
    );
    fail::add(
        &group_connection_program,
        &main_connector_program,
        ACTOR[4],
        ACTOR[5],
    );
    fail::add(
        &group_connection_program,
        &main_connector_program,
        ACTOR[5],
        ACTOR[4],
    );
}

#[test]
fn add_already_added_user() {
    let system = init_system();
    let (group_connection_program, main_connector_program) = some_situation_for_testing(&system);

    fail::add(
        &group_connection_program,
        &main_connector_program,
        ACTOR[0],
        ACTOR[1],
    );

    check::add(
        &group_connection_program,
        &main_connector_program,
        ACTOR[0],
        ACTOR[4],
    );

    fail::add(
        &group_connection_program,
        &main_connector_program,
        ACTOR[2],
        ACTOR[4],
    );
    fail::add(
        &group_connection_program,
        &main_connector_program,
        ACTOR[1],
        ACTOR[1],
    );
}