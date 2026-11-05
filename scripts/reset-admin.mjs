import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const possibleDbs = [
  path.resolve(root, "frontend/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite"),
  path.resolve(root, ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite"),
  path.resolve(root, ".sqlite/oculix.sqlite"),
];

async function passcodeHash(code, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 100000 }, key, 256);
  return Array.from(new Uint8Array(bits)).map(x => x.toString(16).padStart(2, "0")).join("");
}

async function main() {
  const newPasscode = process.argv[2];
  let touchedCount = 0;

  for (const dbPath of possibleDbs) {
    if (!fs.existsSync(dbPath)) continue;

    console.log(`Processing database: ${dbPath}`);
    const db = new DatabaseSync(dbPath);

    // Ensure tables exist before running queries
    db.exec(`
      CREATE TABLE IF NOT EXISTS admin_security (email TEXT PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS admin_sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS admin_attempts (user_id TEXT PRIMARY KEY, window_start INTEGER NOT NULL, attempts INTEGER NOT NULL);
    `);

    // Clear failed attempts and active sessions
    db.exec("DELETE FROM admin_attempts;");
    db.exec("DELETE FROM admin_sessions;");

    if (newPasscode) {
      if (newPasscode.length < 10 || newPasscode.length > 128) {
        console.error("Passcode must be between 10 and 128 characters.");
        process.exit(1);
      }
      const salt = crypto.randomUUID();
      const hash = await passcodeHash(newPasscode, salt);
      db.prepare(`
        INSERT INTO admin_security (email, salt, hash)
        VALUES ('oculixofficial@gmail.com', ?, ?)
        ON CONFLICT(email) DO UPDATE SET salt = excluded.salt, hash = excluded.hash
      `).run(salt, hash);
      console.log(`Successfully updated admin passcode for oculixofficial@gmail.com in ${dbPath}`);
    } else {
      db.exec("DELETE FROM admin_security;");
      console.log(`Cleared admin_security in ${dbPath}. Setup mode is now active (UI will ask to 'Create your admin passcode').`);
    }

    touchedCount++;
  }

  if (touchedCount === 0) {
    console.log("No existing local database found. Creating local database and running migrations first...");
    const { runMigrations } = await import("./migrate-local.mjs");
    runMigrations();
    await main();
    return;
  }

  console.log("\nDone! Admin security and attempt rate limits have been reset.");
}

main().catch(console.error);
