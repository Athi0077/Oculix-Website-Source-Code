'use client';
import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
export default function VisitTracker(){const path=usePathname();const last=useRef<{path:string,id:string}|null>(null);useEffect(()=>{if(!path||/^\/(admin|portal|api|sign)/.test(path))return;if(last.current?.path!==path)last.current={path,id:crypto.randomUUID()};fetch('/api/visits',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(last.current),keepalive:true}).catch(()=>{});},[path]);return null;}
