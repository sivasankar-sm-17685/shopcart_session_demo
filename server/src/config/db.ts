import Database from 'better-sqlite3';
import path from 'node:path';

const DB_PATH = path.join(process.cwd(), 'data', 'app.db');
const db = new Database(DB_PATH);

db.exec(
  'CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,password_salt TEXT NOT NULL)'
);

db.exec(
  'CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id INTEGER NOT NULL,expires_at INTEGER NOT NULL,FOREIGN KEY (user_id) REFERENCES users(id))'
);

export { db };
