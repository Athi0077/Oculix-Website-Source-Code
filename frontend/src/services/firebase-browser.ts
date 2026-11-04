'use client';
import {getApp,getApps,initializeApp} from 'firebase/app';
import {getAuth,GoogleAuthProvider} from 'firebase/auth';
import {firebaseConfig} from '@frontend/firebase';
export function googleAuth(){return getAuth(getApps().length?getApp():initializeApp(firebaseConfig));}
export function googleProvider(){const p=new GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});return p;}
export async function syncGoogleSession(token:string){const r=await fetch('/api/google-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});if(!r.ok){const b=await r.json() as {error?:string};throw Error(b.error||'Could not complete sign-in.');}}
export function safeReturn(value:string|null){if(!value||!value.startsWith('/')||value.startsWith('//')||value.includes('\\'))return '/portal';try{const u=new URL(value,'https://oculixofficial.com');if(u.origin!=='https://oculixofficial.com'||['/signin','/signout','/api/google-session'].includes(u.pathname))return '/portal';return u.pathname+u.search+u.hash;}catch{return '/portal'}}
