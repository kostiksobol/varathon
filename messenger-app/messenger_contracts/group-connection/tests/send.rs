use gtest::Program;
use utilts::{check, fail, init_main_connector, init_system, some_situation_for_testing, ACTOR};

pub mod utilts;

#[test]
fn send_normal() {
    let system = init_system();
    let (group_connection_program, main_connector_program) = some_situation_for_testing(&system);

    check::send(&group_connection_program, ACTOR[0], "sdserfhrg".to_string());
    check::send(
        &group_connection_program,
        ACTOR[1],
        "jytyunhfjkm".to_string(),
    );
    check::send(
        &group_connection_program,
        ACTOR[2],
        "sdshoik.l,ierfhrg".to_string(),
    );
}

#[test]
fn send_from_not_belonging_to_group() {
    let system = init_system();
    let (group_connection_program, main_connector_program) = some_situation_for_testing(&system);

    fail::send(
        &group_connection_program,
        ACTOR[4],
        "some message".to_string(),
    );
}
