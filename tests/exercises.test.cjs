const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'exercises.js'),'utf8')+';globalThis.library=EXERCISE_LIBRARY;globalThis.groups=EXERCISE_GROUPS;',ctx);
const entries=Object.entries(ctx.library);
test('each clinical library has ten unique illustrated exercises',()=>{
  assert.equal(entries.length,40);
  for(const region of ['shoulder','lowback','knee','tennisElbow'])assert.equal(entries.filter(([,e])=>e.region===region).length,10);
  assert.equal(new Set(entries.map(([,e])=>e.image)).size,40);
  for(const [id,e] of entries){assert.match(id,/^[a-z-]+$/);assert.ok(fs.statSync(path.join(root,'assets/exercises',e.image)).size>1000);}
});
test('every exercise has selection context and individually assigned dosage',()=>{
  for(const [id,e] of entries){
    for(const key of ['purpose','equipment','selectionNote','caution','params'])assert.ok(e[key],id+' '+key);
    assert.ok(ctx.groups[e.category]);assert.ok(['基本','標準','発展'].includes(e.difficulty));
    assert.equal(e.steps.length,3);assert.ok(e.steps.every(s=>typeof s==='string'&&s.length));
    assert.match(e.params,/PT/);assert.match(e.source,/^https:\/\//);
  }
});
test('offline asset list includes all forty illustration files',()=>{
  const listeners={},scope='https://example.test/rehab/';
  const sw=vm.createContext({URL,self:{registration:{scope},addEventListener:(n,f)=>listeners[n]=f}});
  sw.importScripts=()=>vm.runInContext(fs.readFileSync(path.join(root,'exercises.js'),'utf8'),sw);
  vm.runInContext(fs.readFileSync(path.join(root,'sw.js'),'utf8')+';globalThis.files=FILES;',sw);
  for(const [,e] of entries)assert.ok(sw.files.includes('./assets/exercises/'+e.image));
  assert.equal(sw.files.filter(f=>f.startsWith('./assets/exercises/')).length,40);
});
