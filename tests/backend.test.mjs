import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../frontend/',import.meta.url));
for(const file of ['lab-payment-check.mjs','lab-session-check.mjs']){
 test(file,()=>{const r=spawnSync(process.execPath,['../backend/checks/'+file],{cwd,encoding:'utf8'});assert.equal(r.status,0,r.stdout+'\n'+r.stderr);});
}

for(const file of ['../backend/tests/google-auth.cjs','../backend/tests/office.cjs','../backend/tests/payment.cjs','../backend/tests/sales.cjs','../backend/tests/tour.cjs','../backend/checks/lab-exam-check.cjs']){
 test(file,()=>{const r=spawnSync(process.execPath,[file],{cwd,encoding:'utf8'});assert.equal(r.status,0,r.stdout+'\n'+r.stderr);});
}
