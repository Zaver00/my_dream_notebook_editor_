use std::fs::{self, DirEntry, File, OpenOptions};
use std::path::PathBuf;
use tauri::command;
use serde::{Deserialize, Serialize};
use std::io::{self, Read};

#[command]
pub fn list_files_in_directory(directory: String) -> Result<Vec<PathBuf>, String> {
    let mut entries = Vec::new();
    let dir_path = PathBuf::from(directory);

    if dir_path.is_dir() {
        for entry in fs::read_dir(dir_path).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            entries.push(entry.path());
        }
        Ok(entries)
    } else {
        Err("Not a directory".into())
    }
}

#[command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[command]
pub fn save_file(path: String, content: String) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

#[command]
pub fn save_metadata(path: String, tags: Vec<String>) -> Result<(), String> {
    let metadata = serde_json::to_string(&tags).map_err(|e| e.to_string())?;
    let meta_path = format!("{}.json", path); // сохраняем метаданные в файл с расширением .json
    fs::write(meta_path, metadata).map_err(|e| e.to_string())
}

#[derive(Serialize, Deserialize)]
struct FileJsonOpen{
    open_folder: String

}
#[command]
pub fn json_file() -> String {
    // let mut open = OpenOptions::new().read(true).open(r"D:\Project\my_dream_notebook_editor_\test.sdb").unwrap();
    // let mut contents = String::new();
    // open.read_to_string(&mut contents).unwrap();
    // let file: FileJsonOpen = serde_json::from_str(&contents).unwrap();
    // file.open_folder.to_string()
    r"C:\Users\Jormungand\Documents\vault-cornectone.back".to_string()
}