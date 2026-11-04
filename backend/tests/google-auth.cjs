const assert=require('node:assert/strict'),ts=require('typescript'),fs=require('node:fs');
(async()=>{const jose=await import('jose');const {privateKey,publicKey}=await jose.generateKeyPair('RS256');
 const source=ts.transpileModule(fs.readFileSync('../backend/src/config/firebase-token.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const m={exports:{}};new Function('require','module','exports',source)(()=>({...jose,createRemoteJWKSet:()=>async()=>publicKey}),m,m.exports);
 const now=Math.floor(Date.now()/1000);const base={email:'Buyer@gmail.com',email_verified:true,auth_time:now,firebase:{sign_in_provider:'google.com'}};
 async function sign(changes={},issuer='https://securetoken.google.com/oculix-website',aud='oculix-website',exp=now+3600){return new jose.SignJWT({...base,...changes}).setProtectedHeader({alg:'RS256',kid:'test'}).setSubject('google-buyer').setIssuer(issuer).setAudience(aud).setIssuedAt(now).setExpirationTime(exp).sign(privateKey)}
 const valid=await sign();assert.equal((await m.exports.verifyGoogleToken(valid)).email,'buyer@gmail.com');
 for(const token of [await sign({email_verified:false}),await sign({firebase:{sign_in_provider:'password'}}),await sign({},'https://evil.test'),await sign({},undefined,'other-project'),await sign({},undefined,undefined,now-60),valid.slice(0,-5)+'abcde'])await assert.rejects(()=>m.exports.verifyGoogleToken(token));
 console.log('Google auth checks passed: RS256 signatures, project/issuer isolation, expiry, verified email, Google provider and tampering.');
})();
