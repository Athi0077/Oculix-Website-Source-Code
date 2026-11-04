'use client';
import {useEffect,useRef,useState} from 'react';
export default function RazorpayPayment(){
 const form=useRef<HTMLFormElement>(null);
 const[status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
 const[attempt,setAttempt]=useState(0);
 useEffect(()=>{
  const node=form.current;if(!node)return;
  node.replaceChildren();setStatus('loading');let active=true;
  const script=document.createElement('script');
  script.src='https://checkout.razorpay.com/v1/payment-button.js';
  script.dataset.payment_button_id='pl_Tpc7nxuw1j57CZ';script.async=true;
  const timer=setTimeout(()=>{if(active)setStatus('error')},20000);
  script.onload=()=>{clearTimeout(timer);if(active)setStatus('ready')};
  script.onerror=()=>{clearTimeout(timer);if(active)setStatus('error')};
  node.appendChild(script);
  return()=>{active=false;clearTimeout(timer);node.replaceChildren()};
 },[attempt]);
 return <div><p>Complete your agreed Oculix payment using Razorpay. Check the payment description and amount in checkout before paying, and keep your payment receipt.</p>{status==='loading'&&<p role="status">Loading payment button…</p>}<form ref={form} aria-label="Oculix Razorpay payment" onSubmit={e=>e.preventDefault()}/>{status==='error'&&<div role="alert"><p>The payment button could not load. Please check your connection or contact Oculix for assistance.</p><button type="button" className="button outline small" onClick={()=>setAttempt(n=>n+1)}>Retry payment button</button></div>}<noscript>Please enable JavaScript to use the Razorpay payment button.</noscript></div>;
}
