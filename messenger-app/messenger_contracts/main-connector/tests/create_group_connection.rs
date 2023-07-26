use utilts::{check, init_system, some_situation_for_testing, ACTOR};

pub mod utilts;

#[test]
fn create_group_connection_normal() {
    let system = init_system();
    let (main_connector_program, group_programs) = some_situation_for_testing(&system);

    check::create_group_connection(&system, &main_connector_program, ACTOR[1], "1".to_string());
}
