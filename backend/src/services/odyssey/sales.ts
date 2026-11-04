export type Sale={id:string;orderId:string;email:string;amount:number;refund:number;createdAt:number;status:string};
// Only payments tied to orders created by this site's signed-in checkout count.
export function courseSales(payments:any[],orders:Map<string,{email:string}>){
 const seen=new Set<string>();const sales:Sale[]=[];
 for(const p of payments){const order=orders.get(p.order_id);if(!order||!/^pay_[a-zA-Z0-9]+$/.test(p.id)||seen.has(p.id)||p.currency!=='INR'||p.amount!==19900||!['captured','refunded'].includes(p.status))continue;
 const refund=Number(p.amount_refunded||0);if(!Number.isSafeInteger(refund)||refund<0||refund>p.amount)throw Error('Invalid refund amount');seen.add(p.id);sales.push({id:p.id,orderId:p.order_id,email:order.email,amount:p.amount,refund,createdAt:p.created_at*1000,status:refund===p.amount?'Refunded':refund?'Partially refunded':'Paid'});}
 sales.sort((a,b)=>b.createdAt-a.createdAt);
 const gross=sales.reduce((s,p)=>s+p.amount,0),refunds=sales.reduce((s,p)=>s+p.refund,0);
 return {sales,purchases:sales.filter(p=>p.refund<p.amount).length,totalSales:sales.length,buyers:new Set(sales.filter(p=>p.refund<p.amount).map(p=>p.email.toLowerCase())).size,gross,refunds,collected:gross-refunds};
}
