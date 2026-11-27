use std::fs;

use tauri_plugin_sql::{Migration, MigrationKind};

#[derive(Clone)]
struct DbConfig {
    url: String,
}

#[tauri::command]
fn db_url(config: tauri::State<'_, DbConfig>) -> String {
    config.url.clone()
}

fn prepare_database(identifier: &str) -> String {
    let dir = dirs::data_local_dir()
        .expect("No local data directory found")
        .join(identifier);

    fs::create_dir_all(&dir).expect("Couldn't create local app data dir");

    format!("sqlite:{}", dir.join("workbench.db").display())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let context = tauri::generate_context!();
    let identifier = context.config().identifier.clone();
    let database_url = prepare_database(&identifier);

    let migrations = vec![
        Migration {
            version: 1,
            description: "create_todos_table",
            sql: "CREATE TABLE IF NOT EXISTS todos (
                    id TEXT PRIMARY KEY NOT NULL,
                    title TEXT NOT NULL,
                    done INTEGER NOT NULL DEFAULT 0,
                    priority TEXT NOT NULL DEFAULT 'normal',
                    due TEXT,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL,
                    completed_at INTEGER,
                    sort_order INTEGER NOT NULL DEFAULT 0
                  )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_notes_table",
            sql: "CREATE TABLE IF NOT EXISTS notes (
                    id TEXT PRIMARY KEY NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL DEFAULT '',
                    color TEXT NOT NULL DEFAULT 'violet',
                    pinned INTEGER NOT NULL DEFAULT 0,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL
                  )",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .manage(DbConfig {
            url: database_url.clone(),
        })
        .invoke_handler(tauri::generate_handler![db_url])
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(&database_url, migrations)
                .build(),
        )
        .run(context)
        .expect("error while running tauri application");
}
