import {getChatGPTUser} from '@backend/middleware/auth';
import {adminIdentity,db,digest,passcodeHash,ADMIN_EMAIL} from '@backend/services/platform';
export async function POST(req:Request){
 if(!await adminIdentity())return Response.json({error:'Sign in using oculixofficial@gmail.com.'},{status:403});
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid origin.'},{status:403});
 const u=(await getChatGPTUser())!;const now=Date.now();
 try{
 const b=await req.json() as {passcode:string,confirm?:string};
 if(typeof b.passcode!=='string'||b.passcode.length<10||b.passcode.length>128)return Response.json({error:'Use a passcode of 10 to 128 characters.'},{status:400});
 const rate=await db().prepare('INSERT INTO admin_attempts(user_id,window_start,attempts) VALUES(?,?,1) ON CONFLICT(user_id) DO UPDATE SET window_start=CASE WHEN window_start<? THEN excluded.window_start ELSE window_start END,attempts=CASE WHEN window_start<? THEN 1 ELSE attempts+1 END RETURNING attempts').bind(u.userId,now,now-900000,now-900000).first<{attempts:number}>();
 if(!rate||rate.attempts>5)return Response.json({error:'Too many attempts. Try again in 15 minutes.'},{status:429});
 let row=await db().prepare('SELECT salt,hash FROM admin_security WHERE email=?').bind(ADMIN_EMAIL).first<{salt:string,hash:string}>();
 if(!row){
 if(b.confirm!==b.passcode)return Response.json({error:'Passcodes do not match.'},{status:400});
 const salt=crypto.randomUUID();const hash=await passcodeHash(b.passcode,salt);
 await db().prepare('INSERT OR IGNORE INTO admin_security(email,salt,hash) VALUES(?,?,?)').bind(ADMIN_EMAIL,salt,hash).run();
 row=await db().prepare('SELECT salt,hash FROM admin_security WHERE email=?').bind(ADMIN_EMAIL).first<{salt:string,hash:string}>();
 }
 const supplied=await passcodeHash(b.passcode,row!.salt);let diff=0;for(let i=0;i<supplied.length;i++)diff|=supplied.charCodeAt(i)^row!.hash.charCodeAt(i);
 if(diff)return Response.json({error:'Incorrect passcode.'},{status:401});
 const token=crypto.randomUUID()+crypto.randomUUID();
 await db().batch([db().prepare('INSERT INTO admin_sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').bind(await digest(token),u.userId,now+3600000),db().prepare('DELETE FROM admin_attempts WHERE user_id=?').bind(u.userId),db().prepare('DELETE FROM admin_sessions WHERE expires_at<?').bind(now)]);
 return Response.json({ok:true},{headers:{'Set-Cookie':`oculix_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`,'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Admin access is temporarily unavailable.'},{status:503})}
}
