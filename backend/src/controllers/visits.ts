import {cookies} from 'next/headers';
import {admin,db} from '@backend/services/platform';
const publicPath=(s:string)=>/^\/(?:$|360$|about$|contact$|education(?:\/[a-z0-9-]+)*$|media$|oits$|products(?:\/[a-z0-9-]+)*$|projects$|services(?:\/[a-z0-9-]+)*$)/.test(s);
const uuid=(s:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const day=(n=Date.now())=>new Date(n+19800000).toISOString().slice(0,10);
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return new Response(null,{status:403});
 if(/bot|crawl|spider|slurp|headless/i.test(req.headers.get('user-agent')||''))return new Response(null,{status:204});
 try{const b=await req.json() as any;const rawPath=typeof b.path==='string'?b.path.split('?')[0].replace(/\/+$/,'')||'/':'';if(typeof b.id!=='string'||!uuid(b.id)||!rawPath||!publicPath(rawPath))return Response.json({error:'Invalid visit.'},{status:400});
 const previous=(await cookies()).get('oculix_visit')?.value;const session=previous&&uuid(previous)?previous:crypto.randomUUID();
 await db().prepare('INSERT OR IGNORE INTO visits(id,session_id,path,day,created_at) VALUES(?,?,?,?,?)').bind(b.id,session,rawPath,day(),Date.now()).run();
 return new Response(null,{status:204,headers:{'Cache-Control':'no-store','Set-Cookie':`oculix_visit=${session}; Path=/; Max-Age=1800; HttpOnly; Secure; SameSite=Lax`}});
 }catch(err){console.error('[Visits Error]:',err);return Response.json({error:'Visit tracking is unavailable.'},{status:503})}
}
export async function GET(){
 if(!await admin())return Response.json({error:'Administrator access required.'},{status:403});
 try{const today=day();const dates=Array.from({length:7},(_,i)=>day(Date.now()-(6-i)*86400000));
 const results=await db().batch([
 db().prepare('SELECT COUNT(DISTINCT session_id) AS visits,COUNT(*) AS pageviews,MIN(day) AS started FROM visits'),
 db().prepare('SELECT COUNT(DISTINCT session_id) AS visits,COUNT(*) AS pageviews FROM visits WHERE day=?').bind(today),
 db().prepare('SELECT day,COUNT(DISTINCT session_id) AS visits,COUNT(*) AS pageviews FROM visits WHERE day>=? GROUP BY day ORDER BY day').bind(dates[0])]);
 return Response.json({total:results[0].results[0],today:results[1].results[0],daily:dates.map(date=>results[2].results.find((r:any)=>r.day===date)||{day:date,visits:0,pageviews:0}),timezone:'Asia/Kolkata'},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Visit counts could not be loaded.'},{status:503})}
}
