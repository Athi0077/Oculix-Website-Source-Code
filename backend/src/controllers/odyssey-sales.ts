import {admin,db} from '@backend/services/platform';
import {paymentsReady,razorpay} from '@backend/services/odyssey/payment';
import {courseSales} from '@backend/services/odyssey/sales';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET(){if(!await admin())return json({error:'Administrator access required.'},403);
 try{if(!paymentsReady())return json({error:'Live payment configuration is not available.'},503);
 const records=await db().prepare("SELECT key,value FROM content WHERE key LIKE 'odyssey:order:%'").all<{key:string;value:string}>();
 const orders=new Map<string,{email:string}>();for(const r of records.results){const o=JSON.parse(r.value);if(typeof o.email==='string')orders.set(r.key.slice('odyssey:order:'.length),{email:o.email});}
 const payments:any[]=[];
 // A failed or truncated reconciliation never becomes a misleading zero total.
 if(orders.size){let complete=false;for(let page=0;page<100;page++){const batch=await razorpay('payments?count=100&skip='+page*100);if(!Array.isArray(batch.items))throw Error('Invalid payment response');payments.push(...batch.items);if(batch.items.length<100){complete=true;break;}}if(!complete)throw Error('Reconciliation limit reached');}
 return json({...courseSales(payments,orders),checkedAt:new Date().toISOString(),currency:'INR'});
 }catch{return json({error:'Sales totals could not be verified with Razorpay. Retry; no estimated totals are shown.'},503)}
}
