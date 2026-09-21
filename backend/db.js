import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'tuition.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS admin (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  class TEXT,
  subjects TEXT,
  parent_name TEXT,
  parent_contact TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('present','absent')),
  UNIQUE(student_id, date),
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  profit REAL NOT NULL DEFAULT 0,
  payment_mode TEXT,
  paid_date TEXT,
  FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
);
`);

// Seed admin from .env if not present
const existing = db.prepare('SELECT * FROM admin WHERE email = ?').get(process.env.ADMIN_EMAIL);
if (!existing) {
  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'changeme123', 10);
  db.prepare('INSERT INTO admin (email, password_hash) VALUES (?, ?)').run(
    process.env.ADMIN_EMAIL || 'admin@tuition.com',
    hash
  );
  console.log('Seeded admin account:', process.env.ADMIN_EMAIL || 'admin@tuition.com');
}

export default db;
