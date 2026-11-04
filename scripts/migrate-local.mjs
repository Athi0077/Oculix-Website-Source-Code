import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const d1Dir = path.resolve(root, "frontend/.wrangler/state/v3/d1/miniflare-D1DatabaseObject");
const dbPath = path.resolve(d1Dir, "faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite");
const migrationsDir = path.resolve(root, "backend/src/models/migrations");

export function runMigrations() {
  if (!fs.existsSync(d1Dir)) {
    fs.mkdirSync(d1Dir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS d1_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  if (!fs.existsSync(migrationsDir)) {
    return;
  }

  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();

  for (const file of files) {
    const existing = db.prepare("SELECT name FROM d1_migrations WHERE name = ?").get(file);
    if (existing) continue;

    console.log(`[D1 Migration] Applying ${file}...`);
    const content = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const statements = content.split("--> statement-breakpoint");
    for (const stmt of statements) {
      const trimmed = stmt.trim();
      if (!trimmed) continue;
      db.exec(trimmed);
    }
    db.prepare("INSERT INTO d1_migrations (name) VALUES (?)").run(file);
    console.log(`[D1 Migration] Applied ${file}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations();
  console.log("Local D1 migrations are up to date.");
}
