// SQLite database (Node's built-in node:sqlite — no extra package) for enquiries and visit stats.
// Lives at data/site.db next to the admin's saved content, so it needs a persistent disk.
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "fs";
import path from "path";
import { DATA_DIR } from "./data-dir";

const FILE = path.join(DATA_DIR, "site.db");

let db: DatabaseSync | undefined;

export function getDb() {
  if (db) return db;
  mkdirSync(path.dirname(FILE), { recursive: true });
  db = new DatabaseSync(FILE);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS enquiries (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      ref         TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      name        TEXT NOT NULL,
      phone       TEXT NOT NULL,
      pickup      TEXT, destination TEXT, travel_date TEXT, car TEXT, message TEXT,
      status      TEXT NOT NULL DEFAULT 'new'  -- new | contacted | done
    );
    -- one row per page view or button click; visitor = daily-rotating hash, never an IP
    CREATE TABLE IF NOT EXISTS visits (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      ts       TEXT NOT NULL DEFAULT (datetime('now')),
      day      TEXT NOT NULL DEFAULT (date('now', '+5 hours', '+30 minutes')),
      event    TEXT NOT NULL,              -- pageview | whatsapp | call
      path     TEXT NOT NULL,
      source   TEXT,                       -- only on a visit's first page: Google, WhatsApp, Direct…
      device   TEXT, browser TEXT,
      visitor  TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS visits_day ON visits(day);
  `);
  return db;
}

export type Enquiry = {
  id: number; ref: string; created_at: string; name: string; phone: string;
  pickup: string; destination: string; travel_date: string; car: string; message: string;
  status: "new" | "contacted" | "done";
};
