use crate::constants;
use keyring::Entry;
use reqwest::Client;
use serde::Deserialize;
use serde_json::{Value, json};

const ACCOUNT_NAME: &str = "auth_token";

#[derive(Deserialize)]
struct LoginResponse {
    token: String,
}

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
pub async fn check_session() -> Result<bool, String> {
    let entry = Entry::new(constants::SERVICE_NAME, ACCOUNT_NAME).map_err(|e| e.to_string())?;

    let token = match entry.get_password() {
        Ok(t) if !t.trim().is_empty() => t,
        _ => return Ok(false), // No saved token in Windows Credential Manager
    };

    let url = format!("{}/users/me", constants::API_ENDPOINT_URL);

    let response = Client::new()
        .get(url)
        .bearer_auth(&token)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if response.status().is_success() {
        Ok(true)
    } else if response.status().as_u16() == 401 || response.status().as_u16() == 404 {
        // Token expired or user no longer exists -> clear stale credential
        let _ = entry.delete_credential();
        Ok(false)
    } else {
        Err(format!("Server error: {}", response.status()))
    }
}

#[tauri::command]
pub fn logout() -> Result<(), String> {
    clear_key();
    Ok(())
}

#[tauri::command()]
pub async fn register(email: String, username: String, password: String) -> Result<u16, String> {
    let client = Client::new();

    let body: Value = json!({
        "displayName": username,
        "email": email,
        "password": password
    });

    let url = format!("{}/users", constants::API_ENDPOINT_URL);

    let response = client
        .post(url)
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = response.status().as_u16();

    if status == 200 || status == 201 {
        return login(email, password).await;
    }

    Ok(status)
}

#[tauri::command()]
pub async fn login(email: String, password: String) -> Result<u16, String> {
    let client = Client::new();

    let body: Value = json!({
        "email": email,
        "password": password,
    });

    let url = format!("{}/users/login", constants::API_ENDPOINT_URL);

    let response = client
        .post(url)
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = response.status().as_u16();

    if status == 200 || status == 201 {
        let data: LoginResponse = response.json().await.map_err(|e| e.to_string())?;
        save_key(&data.token)?;
    }

    Ok(status)
}
