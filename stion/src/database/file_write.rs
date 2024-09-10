use std::fs::File;

use dioxus_logger::tracing::info;



pub fn writes(){
    let open = File::open("robore.sdb").unwrap();
    info!("{:?}", open);
}