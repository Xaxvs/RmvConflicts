use keyring::Entry;

use crate::constants::API_ENDPOINT_URL;
use crate::constants::SERVICE_NAME;

const ACCOUNT_NAME: &str = "whitelist_key";

fn save_key(key: &str) -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, ACCOUNT_NAME).map_err(|e| e.to_string())?;
    entry.set_password(key).map_err(|e| e.to_string())
}

fn load_key() -> Option<String> {
    Entry::new(SERVICE_NAME, ACCOUNT_NAME)
        .ok()
        .and_then(|entry| entry.get_password().ok())
}

fn clear_key() {
    if let Ok(entry) = Entry::new(SERVICE_NAME, ACCOUNT_NAME) {
        let _ = entry.delete_credential();
    }
}

#[tauri::command]
pub async fn check_whitelisted(authenticate: Option<String>) -> Result<u16, String> {
    let client = reqwest::Client::new();

    let key = match authenticate {
        Some(k) if !k.trim().is_empty() => k.trim().to_string(),
        _ => match load_key() {
            Some(saved) => saved,
            None => return Ok(401),
        },
    };

    let url = format!("{}/auth", API_ENDPOINT_URL);

    let response = client
        .post(url)
        .bearer_auth(&key)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status = response.status().as_u16();

    if status == 200 {
        save_key(&key)?;
    } else if status == 401 {
        clear_key();
    }

    Ok(status)
}
