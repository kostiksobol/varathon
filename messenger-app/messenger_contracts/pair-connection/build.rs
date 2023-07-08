fn main() {
    gear_wasm_builder::build_with_metadata::<pair_connection_io::ProgramMetadata>();
    // gear_wasm_builder::WasmBuilder::with_meta(<pair_connection_io::ProgramMetadata as gmeta::Metadata>::repr())
    // .exclude_features(vec!["binary-vendor"])
    // .build();
}
