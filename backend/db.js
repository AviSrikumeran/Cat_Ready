const Database = require("better-sqlite3");
const path = require("path");

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "..", "db.sqlite3");
const db = new Database(dbPath);

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS inspections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id TEXT NOT NULL DEFAULT '',
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS inspection_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inspection_id INTEGER NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
      step_index INTEGER NOT NULL,
      step_name TEXT NOT NULL DEFAULT '',
      audio_path TEXT,
      transcript TEXT DEFAULT '',
      result TEXT DEFAULT '',
      result_reason TEXT DEFAULT '',
      log TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(inspection_id, step_index)
    );

    CREATE TABLE IF NOT EXISTS step_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      step_id INTEGER NOT NULL REFERENCES inspection_steps(id) ON DELETE CASCADE,
      image_path TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_steps_inspection ON inspection_steps(inspection_id);
    CREATE INDEX IF NOT EXISTS idx_images_step ON step_images(step_id);
  `);
}

module.exports = { db, initDb };
