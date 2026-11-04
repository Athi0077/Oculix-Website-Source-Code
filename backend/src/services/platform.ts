import {digest} from '@backend/utils/crypto';
export {digest,passcodeHash} from '@backend/utils/crypto';
import {cookies} from 'next/headers';
import {getChatGPTUser} from '@backend/middleware/auth';
import fs from 'node:fs';
import path from 'node:path';

export const ADMIN_EMAIL='oculixofficial@gmail.com';

export interface D1ShimStatement {
  bind(...args: any[]): D1ShimStatement;
  first<T = Record<string, any>>(colName?: string): Promise<T | null>;
  all<T = Record<string, any>>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes: number } }>;
}

export interface D1ShimDb {
  prepare(query: string): D1ShimStatement;
  batch(stmts: D1ShimStatement[]): Promise<any[]>;
}

let cachedDb: D1ShimDb | null = null;

function initLocalDatabase(): D1ShimDb {
  if (cachedDb) return cachedDb;

  try {
    const { DatabaseSync } = require('node:sqlite');

    let dbPath = '';
    const wranglerDb = path.resolve(process.cwd(), 'frontend/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite');
    const rootWranglerDb = path.resolve(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/faaf2b0445ab934c3aac48ddf0cdfade8f9bac050be98993748742cdd2cb05fb.sqlite');

    if (process.env.VERCEL) {
      dbPath = '/tmp/oculix.sqlite';
    } else if (fs.existsSync(wranglerDb)) {
      dbPath = wranglerDb;
    } else if (fs.existsSync(rootWranglerDb)) {
      dbPath = rootWranglerDb;
    } else {
      const fallbackDir = path.resolve(process.cwd(), '.sqlite');
      if (!fs.existsSync(fallbackDir)) {
        try { fs.mkdirSync(fallbackDir, { recursive: true }); } catch {}
      }
      dbPath = path.join(fallbackDir, 'oculix.sqlite');
    }

    const sqlite = new DatabaseSync(dbPath);

    // Ensure all tables exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, email TEXT NOT NULL, name TEXT NOT NULL, organisation TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', kind TEXT NOT NULL, product TEXT NOT NULL, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'New', reply TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, customer_email TEXT NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL, detail TEXT NOT NULL, status TEXT NOT NULL, date TEXT NOT NULL DEFAULT '', amount TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS content (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS admin_security (email TEXT PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS admin_sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS admin_attempts (user_id TEXT PRIMARY KEY, window_start INTEGER NOT NULL, attempts INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS visits (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, path TEXT NOT NULL, day TEXT NOT NULL, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS odyssey_enrolments (email TEXT PRIMARY KEY, status TEXT NOT NULL, granted_by TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS odyssey_progress (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, lesson_id TEXT NOT NULL, best_score INTEGER NOT NULL, attempts INTEGER NOT NULL, updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS odyssey_exams (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, question_ids TEXT NOT NULL, expires_at INTEGER NOT NULL, submitted_at INTEGER, score INTEGER);
      CREATE TABLE IF NOT EXISTS odyssey_certificates (id TEXT PRIMARY KEY, user_id TEXT NOT NULL UNIQUE, name TEXT NOT NULL, issued_at TEXT NOT NULL, score INTEGER NOT NULL, version TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS lab_exam_attempts (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, attempt INTEGER NOT NULL, version TEXT NOT NULL, started_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, submitted_at INTEGER, answers TEXT NOT NULL, mcq_score INTEGER, practical_score INTEGER, criteria TEXT, feedback TEXT NOT NULL DEFAULT '', reviewed_by TEXT, reviewed_at INTEGER);
    `);

    const shim: D1ShimDb = {
      prepare(query: string) {
        const stmtObj: D1ShimStatement = {
          bind(...args: any[]) {
            this._args = args.map(arg => typeof arg === 'boolean' ? (arg ? 1 : 0) : arg);
            return this;
          },
          _args: [] as any[],
          async first<T = Record<string, any>>(colName?: string): Promise<T | null> {
            try {
              const stmt = sqlite.prepare(query);
              const row = stmt.get(...this._args) as any;
              if (!row) return null;
              if (colName && typeof row === 'object') return row[colName] ?? null;
              return row as T;
            } catch (e) {
              console.error('[DB first Error]:', e, 'Query:', query);
              return null;
            }
          },
          async all<T = Record<string, any>>(): Promise<{ results: T[] }> {
            try {
              const stmt = sqlite.prepare(query);
              const rows = stmt.all(...this._args) as T[];
              return { results: rows || [] };
            } catch (e) {
              console.error('[DB all Error]:', e, 'Query:', query);
              return { results: [] };
            }
          },
          async run(): Promise<{ meta: { changes: number } }> {
            try {
              const stmt = sqlite.prepare(query);
              const res = stmt.run(...this._args);
              return { meta: { changes: Number(res.changes || 0) } };
            } catch (e) {
              console.error('[DB run Error]:', e, 'Query:', query);
              return { meta: { changes: 0 } };
            }
          }
        } as unknown as D1ShimStatement;
        return stmtObj;
      },
      async batch(stmts: D1ShimStatement[]): Promise<any[]> {
        const results = [];
        for (const s of stmts) {
          results.push(await s.all());
        }
        return results;
      }
    };

    cachedDb = shim;
    return cachedDb;
  } catch (err) {
    console.warn('[DB Init Warning]:', err);
    return {
      prepare: () => ({
        bind: () => ({
          first: async () => null,
          all: async () => ({ results: [] }),
          run: async () => ({ meta: { changes: 0 } })
        } as unknown as D1ShimStatement),
        first: async () => null,
        all: async () => ({ results: [] }),
        run: async () => ({ meta: { changes: 0 } })
      } as unknown as D1ShimStatement),
      batch: async () => []
    };
  }
}

export function db(): D1ShimDb {
  if (typeof (globalThis as any).DB !== 'undefined') return (globalThis as any).DB;
  return initLocalDatabase();
}

export async function adminIdentity(){const u=await getChatGPTUser();return !!u&&u.email.toLowerCase()===ADMIN_EMAIL;}
export async function admin(){if(!await adminIdentity())return false;const u=await getChatGPTUser();const token=(await cookies()).get('oculix_admin')?.value;if(!token)return false;const row=await db().prepare('SELECT token_hash FROM admin_sessions WHERE token_hash=? AND user_id=? AND expires_at>?').bind(await digest(token),u!.userId,Date.now()).first();return !!row;}
export async function getContent(key:string,fallback:string){try{const r=await db().prepare('SELECT value FROM content WHERE key=?').bind(key).first<{value:string}>();return r?.value||fallback}catch{return fallback}}
