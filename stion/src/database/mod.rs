pub mod db_core;
pub mod file_existing;
pub mod file_write;
pub mod db_crypto;


pub fn run() {
    file_existing::file_check("robore.sdb".to_string());
        
}