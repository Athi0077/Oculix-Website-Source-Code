import {createRemoteJWKSet,jwtVerify,type JWTPayload} from 'jose';
const project='oculix-website';
const keys=createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
export function googleIdentity(p:JWTPayload){
 const firebase=p.firebase as {sign_in_provider?:string}|undefined;
 if(typeof p.sub!=='string'||!p.sub||p.sub.length>128||typeof p.email!=='string'||p.email.length>254||p.email_verified!==true||firebase?.sign_in_provider!=='google.com'||typeof p.auth_time!=='number'||p.auth_time>Date.now()/1000+30)throw Error('A verified Google account is required.');
 return {uid:p.sub,email:p.email.toLowerCase(),fullName:typeof p.name==='string'?p.name.slice(0,150):null,expires:p.exp!};
}
export async function verifyGoogleToken(token:string){
 if(!token||token.length>10000)throw Error('Invalid sign-in token');
 const {payload}=await jwtVerify(token,keys,{issuer:'https://securetoken.google.com/'+project,audience:project,algorithms:['RS256'],requiredClaims:['exp','iat','sub','auth_time'],clockTolerance:30});
 if(payload.iat!>Date.now()/1000+30)throw Error('Invalid issue time');
 return googleIdentity(payload);
}
