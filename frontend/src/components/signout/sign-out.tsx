'use client';
import {useEffect,useState} from 'react';
import {signOut} from 'firebase/auth';
import {googleAuth,safeReturn} from '@frontend/services/firebase-browser';
export default function SignOut(){const[error,setError]=useState(false);useEffect(()=>{(async()=>{await signOut(googleAuth());const r=await fetch('/api/google-session',{method:'DELETE'});if(!r.ok)throw Error();const path=safeReturn(new URLSearchParams(location.search).get('return_to')||'/');location.replace(path);})().catch(()=>setError(true));},[]);return <p>{error?'Could not sign out. Refresh to retry.':'Signing out…'}</p>}
