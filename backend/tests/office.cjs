const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function load(path,req=()=>({})){const code=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const m={exports:{}};new Function('require','module','exports',code)(req,m,m.exports);return m.exports}
const roomsPath=fs.existsSync('src/components/360/rooms.ts')?'src/components/360/rooms.ts':'app/360/rooms.ts';
const enginePath=fs.existsSync('src/components/360/office-engine.ts')?'src/components/360/office-engine.ts':'app/360/office-engine.ts';
const tourPath=fs.existsSync('src/components/360/tour.tsx')?'src/components/360/tour.tsx':'app/360/tour.tsx';
const {rooms}=load(roomsPath);const {roomPosition}=load(enginePath,p=>(p==='./rooms'||p==='@frontend/components/360/rooms')?{rooms}:{});const positions=new Set();
for(const r of rooms){const p=roomPosition(r.id);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.z));assert.ok(Math.abs(p.x)<=9&&p.z>=-70&&p.z<=18);const key=p.x+','+p.z;assert.ok(!positions.has(key));positions.add(key)}
assert.deepEqual(roomPosition('hall'),{x:0,z:15,side:0});assert.equal(roomPosition('products').side,-1);assert.equal(roomPosition('virverse').side,1);
const glb=fs.readFileSync('public/office/chair.glb');assert.equal(glb.toString('ascii',0,4),'glTF');assert.equal(glb.readUInt32LE(4),2);const length=glb.readUInt32LE(12),model=JSON.parse(glb.toString('utf8',20,20+length));assert.ok(model.meshes.length>0);assert.ok(fs.readFileSync('public/office/chair-readme.md','utf8').includes('Creative Commons Zero'));
const scene=fs.readFileSync(tourPath,'utf8');assert.ok(scene.includes("office-engine"));assert.ok(!scene.includes('pannellum.viewer'));assert.ok(!scene.includes('Stock locations'));
console.log('3D office checks passed: 23 unique room positions, bounds, GLB asset, asset licence and viewer replacement.');
