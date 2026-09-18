const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'exercises.js'),'utf8')+';globalThis.library=EXERCISE_LIBRARY;globalThis.groups=EXERCISE_GROUPS;globalThis.diseases=DISEASE_LIBRARY;',ctx);
vm.runInContext(fs.readFileSync(path.join(root,'disease-library.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'exercise-selection.js'),'utf8')+';globalThis.selection=ExerciseSelection;',ctx);
const entries=Object.entries(ctx.library);
test('published diseases have valid nonduplicated choices and every exercise has an illustration',()=>{
  for(const key of Object.keys(ctx.diseases)){
    const keys=ctx.getDiseaseExerciseKeys(key);assert.ok(keys.length>0&&keys.length<=60);
    assert.equal(new Set(keys).size,keys.length);assert.ok(keys.every(id=>ctx.library[id]));
    for(const item of ctx.getDiseaseExerciseMenu(key))assert.ok(item.note.length<=500);
  }
  for(const [id,e] of entries){assert.match(id,/^[a-z-]+$/);assert.ok(fs.statSync(path.join(root,'assets/exercises',e.image)).size>1000);}
});
test('clinician guidance detects related choices without treating all knee exercises as duplicates',()=>{
  const selected=['short-arc-quad','seated-knee-extension','quad-setting','sit-to-stand','mini-squat','step-up','heel-raise'];
  const before=JSON.stringify(selected),groups=ctx.selection.overlaps(selected);
  assert.equal(groups.length,2);
  assert.equal(groups.find(g=>g.id==='knee-quadriceps').exercises.length,3);
  assert.equal(groups.find(g=>g.id==='knee-supported-function').exercises.length,2);
  assert.equal(JSON.stringify(selected),before,'guidance does not remove prescriptions');
  assert.equal(ctx.selection.warnings(['step-up','heel-raise','unknown']), '');
  assert.equal(ctx.selection.overlaps(['quad-setting','quad-setting']).length,0);
  assert.match(ctx.selection.warnings(selected),/併用を禁止するものではありません/);
});
test('alternative positions and loading modes remain distinct choices with safe display text',()=>{
  assert.equal(ctx.selection.overlaps(['supine-flexion','table-slide','wall-slide'])[0].exercises.length,3);
  assert.equal(ctx.selection.overlaps(['wrist-active-extension','wrist-isometric-extension','wrist-eccentric-extension','wrist-resisted-extension'])[0].exercises.length,4);
  assert.equal(ctx.selection.overlaps(['forearm-turn','resisted-forearm-turn'])[0].exercises.length,2);
  assert.equal(ctx.selection.warnings(['wrist-extensor-stretch','wrist-flexor-stretch']), '');
  for(const [,e] of entries)assert.ok(e.clinicalRole);
  const text=ctx.selection.summary({...ctx.library['quad-setting'],choiceVariant:'<img src=x onerror=alert(1)>'});
  assert.ok(!text.includes('<img'));assert.ok(text.includes('&lt;img'));
  assert.match(ctx.library['wrist-eccentric-extension'].steps[0],/端から出/);
  assert.match(ctx.library['wrist-resisted-extension'].steps[0],/端から出/);
});
test('every exercise has selection context and individually assigned dosage',()=>{
  for(const [id,e] of entries){
    for(const key of ['purpose','equipment','selectionNote','caution','params'])assert.ok(e[key],id+' '+key);
    assert.ok(ctx.groups[e.category]);assert.ok(['基本','標準','発展'].includes(e.difficulty));
    assert.equal(e.steps.length,3);assert.ok(e.steps.every(s=>typeof s==='string'&&s.length));
    assert.match(e.params,/PT/);assert.match(e.source,/^https:\/\//);
  }
});
test('offline asset list includes the complete illustration set',()=>{
  const listeners={},scope='https://example.test/rehab/';
  const sw=vm.createContext({URL,self:{registration:{scope},addEventListener:(n,f)=>listeners[n]=f}});
  sw.importScripts=()=>vm.runInContext(fs.readFileSync(path.join(root,'exercises.js'),'utf8'),sw);
  vm.runInContext(fs.readFileSync(path.join(root,'sw.js'),'utf8')+';globalThis.files=FILES;',sw);
  for(const [,e] of entries)assert.ok(sw.files.includes('./assets/exercises/'+e.image));
  assert.deepEqual(new Set(sw.files.filter(f=>f.startsWith('./assets/exercises/'))),new Set(entries.map(([,e])=>'./assets/exercises/'+e.image)));
});
