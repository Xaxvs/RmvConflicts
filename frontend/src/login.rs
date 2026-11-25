use keyring::Entry;

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
