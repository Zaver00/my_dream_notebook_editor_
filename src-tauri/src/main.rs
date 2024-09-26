#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod file_system;


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            file_system::read_file,
            file_system::save_file,
            file_system::list_files_in_directory,
            file_system::save_metadata,
            file_system::json_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

