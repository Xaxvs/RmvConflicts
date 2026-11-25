use std::fmt::format;

use keyring::Entry;
use reqwest::Client;
use tauri::http::response;

use crate::constants;

const ACCOUNT_NAME: &str = "auth_token";

fn save_key(key: &str) -> Result<(), String> {
    let entry = Entry::new(constants::SERVICE_NAME, ACCOUNT_NAME).map_err(|e| e.to_string())?;
    entry.set_password(key).map_err(|e| e.to_string())
}

fn load_key() -> Option<String> {
    Entry::new(constants::SERVICE_NAME, ACCOUNT_NAME)
        .ok()
        .and_then(|entry| entry.get_password().ok())
}

fn clear_key() {
    if let Ok(entry) = Entry::new(constants::SERVICE_NAME, ACCOUNT_NAME) {
        let _ = entry.delete_credential();
    }
}

#[tauri::command()]
pub async fn login(email: String, password: String) -> Result<u16, String> {
    let client = Client::new();

    let url = format!("{}/users/login", constants::API_ENDPOINT_URL);

    let response = client.post(url).send().await.map_err(|e| e.to_string())?;

    let status = response.status().as_u16();

    if status == 200 {
    } else if status == 401 {
    }

    Ok(status)
}
