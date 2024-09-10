use std::{fs::{File, OpenOptions}, io::{Read, Write}, path::Path};
use serde::{Serialize, Deserialize}; 
use serde_json::{Value, json};
use std::collections::HashMap;


#[derive(Serialize, Deserialize, Debug)]
struct BaseFiles {
    path: String,
    tags: String,
}

fn main() {
    file_check("test.sdb".to_string());
    let mut json_data = String::new();
    let mut open = OpenOptions::new().read(true).open("test.sdb").unwrap();
    open.read_to_string(&mut json_data).unwrap();
    let files:  HashMap<String, BaseFiles> = serde_json::from_str(&json_data).unwrap();
    let new_file = BaseFiles {
        path: String::from("/opt"),
        tags: String::from("test"),
    };
    let mut files_mut = files;
    files_mut.insert(String::from("file2"), new_file);

    let updated_json = serde_json::to_string_pretty(&files_mut).unwrap();
    open = OpenOptions::new()
        .write(true)
        .truncate(true)
        .open("test.sdb").unwrap();
    let _ = open.write(updated_json.as_bytes()).unwrap();
    println!("Updated JSON: {}", updated_json);
    println!("{}", files_mut.get("file1").unwrap().path);
}  



pub fn file_check(filepath: String) {
    if Path::new(&filepath).exists() {
        println!("exists");
    } else {
        file_create()
    };
}

fn file_create(){
    let json_data = r#"
        {
            "Hello world": {
                "path": "./",
                "tags": "hello"
            }
        }
    "#;
    let deserialized: HashMap<String, BaseFiles> = serde_json::from_str(json_data).unwrap();
    let serialized = serde_json::to_string_pretty(&deserialized).unwrap();
    let mut file = File::create("test.sdb").unwrap();
    file.write_all(serialized.as_bytes()).unwrap();
}
