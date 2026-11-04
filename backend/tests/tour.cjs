const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const roomsPath=fs.existsSync('src/components/360/rooms.ts')?'src/components/360/rooms.ts':'app/360/rooms.ts';
const rzpPath=fs.existsSync('src/components/razorpay-payment.tsx')?'src/components/razorpay-payment.tsx':'app/razorpay-payment.tsx';
const code=ts.transpileModule(fs.readFileSync(roomsPath,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const m={exports:{}};new Function('module','exports',code)(m,m.exports);const {rooms}=m.exports;
assert.equal(rooms.length,23);assert.equal(new Set(rooms.map(r=>r.id)).size,rooms.length);
for(const r of rooms){assert.ok(r.path.startsWith('/')&&!r.path.startsWith('//'));assert.ok(fs.existsSync('public/tour/'+r.photo+'.jpg'));assert.ok(Number.isFinite(r.yaw));const direct='app'+(r.path==='/'?'':r.path)+'/page.tsx';const dynamic=r.path.startsWith('/products/')?'app/products/[slug]/page.tsx':r.path.startsWith('/services/')?'app/services/[slug]/page.tsx':'';assert.ok(fs.existsSync(direct)||(dynamic&&fs.existsSync(dynamic)),r.path)}
for(const path of ['/contact','/education/ai-odyssey','/education/ai-odyssey/learn','/portal','/admin','/admin/courses'])assert.ok(rooms.some(r=>r.path===path));
assert.ok(fs.readFileSync(rzpPath,'utf8').includes('pl_Tpc7nxuw1j57CZ'));assert.ok(fs.readFileSync('../backend/src/services/odyssey/payment.ts','utf8').includes('rzp_live_'));assert.ok(!fs.readFileSync('app/education/ai-odyssey/page.tsx','utf8').includes('Further reading'));
console.log('360 tour checks passed: all 23 room routes, panorama files, existing payment integration and course page content.');
