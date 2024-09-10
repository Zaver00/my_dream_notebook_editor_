use std::{fs::{self, File}, io::Write, path::Path};
use crate::database::file_write;

pub fn file_check(filepath: String) {
    if Path::new(&filepath).exists() {
        file_write::writes()
    } else {
        file_create(filepath)
    };
}

fn file_create(filepath: String){
    let stat_new_db = [0x00, 0x00, 0x12, 0x12];
    let mut create = File::create(filepath).unwrap();
    create.write(&stat_new_db).unwrap();
}