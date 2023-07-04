

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate systemstat;
use serde::{Serialize, Deserialize};
use serde_json::Error;
use systemstat::{System, Platform, saturating_sub_bytes, CPULoad, Duration, ByteSize};
use std::vec;


#[derive(Serialize, Deserialize)]
struct CPUMemInfo {
    free: String,
    usage: String,
    total: String
}

#[derive(Serialize, Deserialize)]
struct SystemInfo {
    cpu_load: Vec<f32>,
    cpu_load_avg: f32,
    mem: CPUMemInfo
}



// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}



#[tauri::command]
async fn calculate_mem()  -> String {
    let sys = System::new();

    let cpus_load_delayed = sys.cpu_load().expect("Faield to load cpus");
    let cpu_load_delayed = sys.cpu_load_aggregate().expect("failed to load cpu.");
    std::thread::sleep(Duration::from_secs(1));
    let cpus_load = cpus_load_delayed.done().expect("Failed to get cpus load");
    let cpu_load_avg = cpu_load_delayed.done().expect("Failed to get cpu avg load");

// Cpu lload starts her
    let mut system_info = SystemInfo{
        cpu_load: Vec::new(),
        cpu_load_avg: 0.0f32,
        mem: CPUMemInfo { free: String::new(), usage: String::new(), total: String::new() }
    };

    for cpu_load in cpus_load {
        system_info.cpu_load.push(cpu_load.user);
    }

    system_info.cpu_load_avg = cpu_load_avg.user;

// Memory loading info starts her
    let sys_mem = sys.memory().expect("failed to get system memory");
    let one_gig = ByteSize::gib(1).as_u64();
    let total_mem_size = ByteSize::b(sys_mem.total.as_u64() - one_gig);
    let free_mem_size = ByteSize::b(sys_mem.free.as_u64()  - one_gig);
   
    system_info.mem.free = free_mem_size.to_string_as(false);
    system_info.mem.total = (total_mem_size).to_string_as(false);
    system_info.mem.usage = saturating_sub_bytes(sys_mem.total, sys_mem.free).to_string_as(false);
    //system_info.mem.free = saturating_sub_bytes(, r);


//Network stuff here


    let sys_info = serde_json::to_string(&system_info).expect("failed to get string");

   
    sys_info
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, calculate_mem])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
