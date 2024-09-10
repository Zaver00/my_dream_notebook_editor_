use std::{fs::File, io::{Read, Write}, path::Path};



fn main() {
    file_check("test.sdb".to_string());

    let mut open = File::open("test.sdb".to_string()).unwrap();
    let mut bufs = Vec::new();
    let _ = open.read_to_end(&mut bufs);
    println!("{:?}", bufs);
}   

pub fn file_check(filepath: String) {
    if Path::new(&filepath).exists() {
        println!("exists");
    } else {
        file_create(filepath)
    };
}

fn file_create(filepath: String){
    let stat_new_db = [0x00, 0x2, 0x00, 0x00];
    let mut create = File::create(filepath).unwrap();
    create.write(&stat_new_db).unwrap();
}