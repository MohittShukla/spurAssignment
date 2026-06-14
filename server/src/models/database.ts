import Database from "better-sqlite3";
import path from "path";
import { config } from "../config";

const DB_PATH = path.resolve(__dirname, "../../", config.database.path);

let dbInstance: Database.Database | null = null;

/** Singleton accessor — creates the DB and tables on first call */
export function getDatabase(): Database.Database {
  if (dbInstance) return dbInstance;

  dbInstance = new Database(DB_PATH);

  // WAL mode gives better concurrent-read performance
  dbInstance.pragma("journal_mode = WAL");
  dbInstance.pragma("foreign_keys = ON");

  initialiseSchema(dbInstance);

  return dbInstance;
}

/** Creates tables if they don't already exist */
function initialiseSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id         TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id              TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender          TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
      text            TEXT NOT NULL,
      timestamp       TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );

    CREATE INDEX IF NOT EXISTS idx_messages_conversation
      ON messages(conversation_id, timestamp);
  `);
}

/** Graceful shutdown helper */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
