import {digest} from '@backend/utils/crypto';
export {digest,passcodeHash} from '@backend/utils/crypto';
import {cookies} from 'next/headers';
import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@backend/middleware/auth';
export const ADMIN_EMAIL='oculixofficial@gmail.com';
export function db(){if(!env.DB)throw new Error('Storage unavailable');return env.DB;}
export async function adminIdentity(){const u=await getChatGPTUser();return !!u&&u.email.toLowerCase()===ADMIN_EMAIL;}
export async function admin(){if(!await adminIdentity())return false;const u=await getChatGPTUser();const token=(await cookies()).get('oculix_admin')?.value;if(!token)return false;const row=await db().prepare('SELECT token_hash FROM admin_sessions WHERE token_hash=? AND user_id=? AND expires_at>?').bind(await digest(token),u!.userId,Date.now()).first();return !!row;}
export async function getContent(key:string,fallback:string){try{const r=await db().prepare('SELECT value FROM content WHERE key=?').bind(key).first<{value:string}>();return r?.value||fallback}catch{return fallback}}
