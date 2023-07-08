fn main() {
    gear_wasm_builder::build_with_metadata::<main_connector_io::ProgramMetadata>();
    //     gear_wasm_builder::WasmBuilder::with_meta(<main_connector_io::ProgramMetadata as gmeta::Metadata>::repr())
    //     .exclude_features(vec!["binary-vendor"])
    //     .build();
}
