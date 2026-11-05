import {cookies} from 'next/headers';
import {admin,db} from '@backend/services/platform';

const publicPath=(s:string)=>/^\/(?:$|360$|about$|contact$|education(?:\/[a-z0-9-]+)*$|media$|oits$|products(?:\/[a-z0-9-]+)*$|projects$|services(?:\/[a-z0-9-]+)*$)/.test(s);
const uuid=(s:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const day=(n=Date.now())=>new Date(n+19800000).toISOString().slice(0,10);

async function ensureVisitsTable() {
  try {
    await db().prepare(`
      CREATE TABLE IF NOT EXISTS visits (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        path TEXT NOT NULL,
        day TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `).run();
  } catch (e) {
    console.warn('[Visits table init notice]:', e);
  }
}

export async function POST(req:Request){
  if(req.headers.get('origin')!==new URL(req.url).origin)return new Response(null,{status:403});
  if(/bot|crawl|spider|slurp|headless/i.test(req.headers.get('user-agent')||''))return new Response(null,{status:204});
  try{
    const b=await req.json() as any;
    const rawPath=typeof b.path==='string'?b.path.split('?')[0].replace(/\/+$/,'')||'/':'';
    if(typeof b.id!=='string'||!uuid(b.id)||!rawPath||!publicPath(rawPath))return Response.json({error:'Invalid visit.'},{status:400});
    await ensureVisitsTable();
    const previous=(await cookies()).get('oculix_visit')?.value;
    const session=previous&&uuid(previous)?previous:crypto.randomUUID();
    await db().prepare('INSERT OR IGNORE INTO visits(id,session_id,path,day,created_at) VALUES(?,?,?,?,?)').bind(b.id,session,rawPath,day(),Date.now()).run();
    return new Response(null,{status:204,headers:{'Cache-Control':'no-store','Set-Cookie':`oculix_visit=${session}; Path=/; Max-Age=1800; HttpOnly; Secure; SameSite=Lax`}});
  }catch(err){
    console.error('[Visits Error]:',err);
    return Response.json({error:'Visit tracking is unavailable.'},{status:503});
  }
}

export async function GET(){
  if(!await admin())return Response.json({error:'Administrator access required.'},{status:403});
  const today=day();
  const dates=Array.from({length:7},(_,i)=>day(Date.now()-(6-i)*86400000));
  const fallback={
    total:{visits:0,pageviews:0,started:null},
    today:{visits:0,pageviews:0},
    daily:dates.map(date=>({day:date,visits:0,pageviews:0})),
    timezone:'Asia/Kolkata'
  };

  try{
    await ensureVisitsTable();
    const results=await db().batch([
      db().prepare('SELECT COUNT(DISTINCT session_id) AS visits,COUNT(*) AS pageviews,MIN(day) AS started FROM visits'),
      db().prepare('SELECT COUNT(DISTINCT session_id) AS visits,COUNT(*) AS pageviews FROM visits WHERE day=?').bind(today),
      db().prepare('SELECT day,COUNT(DISTINCT session_id) AS visits,COUNT(*) AS pageviews FROM visits WHERE day>=? GROUP BY day ORDER BY day').bind(dates[0])
    ]);

    const getRows=(r:any):any[]=>{
      if(!r) return [];
      if(Array.isArray(r)) return r;
      if(Array.isArray(r.results)) return r.results;
      return [];
    };

    const r0=getRows(results?.[0]);
    const r1=getRows(results?.[1]);
    const r2=getRows(results?.[2]);

    const total = r0[0] || {visits:0,pageviews:0,started:null};
    const todayData = r1[0] || {visits:0,pageviews:0};
    const daily = dates.map(date=>{
      const found = r2.find((item:any)=>item&&item.day===date);
      return {
        day: date,
        visits: Number(found?.visits||0),
        pageviews: Number(found?.pageviews||0)
      };
    });

    return Response.json({
      total: {
        visits: Number(total.visits || 0),
        pageviews: Number(total.pageviews || 0),
        started: total.started || null
      },
      today: {
        visits: Number(todayData.visits || 0),
        pageviews: Number(todayData.pageviews || 0)
      },
      daily,
      timezone: 'Asia/Kolkata'
    },{headers:{'Cache-Control':'no-store'}});
  }catch(err){
    console.error('[Visits GET Error]:',err);
    return Response.json(fallback,{headers:{'Cache-Control':'no-store'}});
  }
}
