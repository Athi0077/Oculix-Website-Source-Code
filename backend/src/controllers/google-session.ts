import {cookies,headers} from 'next/headers';
import {db} from '@backend/services/platform';
import {verifyGoogleToken} from '@backend/config/firebase-token';
export const dynamic='force-dynamic';
const cookie='__Host-oculix_google';
const options={httpOnly:true,secure:true,sameSite:'lax' as const,path:'/'};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
export async function POST(req:Request){if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Invalid origin.'},403);
 try{if(Number(req.headers.get('content-length')||0)>12000)return json({error:'Request too large.'},413);const raw=await req.text();if(raw.length>12000)return json({error:'Request too large.'},413);const b=JSON.parse(raw);if(typeof b.token!=='string')return json({error:'Invalid sign-in.'},400);
 const identity=await verifyGoogleToken(b.token);const key='identity:firebase:'+identity.uid;
 const h=await headers();const oldEmail=h.get('oai-authenticated-user-email'),oldId=h.get('oai-authenticated-user-id');
 let canonical=oldEmail?.toLowerCase()===identity.email&&oldId?oldId:'firebase:'+identity.uid;
 // Preserve progress for earlier purchases when the verified email matches.
 if(canonical.startsWith('firebase:')){const oldOrder=await db().prepare("SELECT value FROM content WHERE key LIKE 'odyssey:order:%' AND json_extract(value,'$.email')=? ORDER BY key LIMIT 1").bind(identity.email).first<{value:string}>();if(oldOrder){const o=JSON.parse(oldOrder.value);if(typeof o.userId==='string')canonical=o.userId;}}
 await db().prepare('INSERT OR IGNORE INTO content (key,value) VALUES (?,?)').bind(key,JSON.stringify({userId:canonical,email:identity.email})).run();
 (await cookies()).set(cookie,b.token,{...options,maxAge:Math.max(0,Math.min(3600,Math.floor(identity.expires-Date.now()/1000)))});
 return json({ok:true});
 }catch(err){console.error('[Google Session Error]:',err);return json({error:'Google sign-in could not be verified. Please sign in again.'},401)}
}
export async function DELETE(req:Request){if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Invalid origin.'},403);const c=await cookies();c.set(cookie,'',{...options,maxAge:0});c.set('oculix_admin','',{...options,maxAge:0});return json({ok:true});}
