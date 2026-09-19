/* Real app functions in isolated contexts; shared storage models independent tabs. */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict'),{test}=require('node:test');
const root=path.resolve(__dirname,'..'),C=require('../core.js');
function tab(storage=new Map()) {
  const nodes=new Map(),listeners={};
  const ctx=vm.createContext({RehabCore:C,console,URL,Date,crypto:require('crypto').webcrypto,
    setInterval(){},setTimeout(){},clearTimeout(){},MutationObserver:class {observe(){}},alert(){},confirm(){return true},prompt(){return '架空患者'},
    navigator:{},location:{pathname:'/',hash:'',search:'',origin:'https://example.test'},
    addEventListener(name,fn){listeners[name]=fn},
    document:{addEventListener(){},getElementById(id){if(id==='paste-url'||id==='update-url')return null;if(!nodes.has(id))nodes.set(id,{innerHTML:'',classList:{add(){},remove(){},contains(){return false}}});return nodes.get(id)}},
    localStorage:{getItem(k){return storage.get(k)||null},setItem(k,v){storage.set(k,v)}}});
  ctx.window=ctx;
  for(const file of ['ui.js','exercises.js','disease-library.js','app-v2.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
  vm.runInContext('modal=()=>{}',ctx);
  return {ctx,nodes,listeners,run:code=>vm.runInContext(code,ctx),storage};
}
const setup=`S=C.settings({patientId:'fake_patient',menu:[{id:'one',name:'架空運動',params:'5回',note:'',dows:[]}],startDate:todayKey(),knownSince:todayKey()},'fake',todayKey());L={};`;
test('optional chart number survives local backup and archives but never enters share payload',()=>{
  const a=tab();a.run(setup+`S.chartId='000123';S.patientName='架空患者';persist();loadState();archiveCurrent();persist();loadState();`);
  assert.equal(a.run('S.chartId'),'000123');
  assert.equal(a.run('archives[0].settings.chartId'),'000123');
  assert.equal(a.run('S.patientId'),'fake_patient');
  assert.equal(a.run("'chartId' in buildSharePayload()"),false);
  assert.equal(a.run("'patientName' in buildSharePayload()"),false);
  a.run("S=C.settings({menu:[]},'new_prescription',todayKey())");
  assert.equal(a.run('S.chartId'),'');assert.equal(a.run('S.patientName'),'');
});
test('deleting last future exercise retains today snapshot and pain controls',()=>{
  const a=tab();a.run(setup+`writableLog().status.one='done';C.changeMenu(S,L,[],todayKey(),dk(addDays(new Date(),1)));renderToday();`);
  assert.equal(a.run('todayExercises(new Date().getDay()).length'),1);
  assert.ok(a.nodes.get('today-content').innerHTML.includes('exercise-card'));
  assert.ok(a.nodes.get('today-content').innerHTML.includes('note-ta'));
  a.run('C.applyMenuToday(S,L,todayKey(),new Date().getDay());renderToday()');
  assert.ok(a.nodes.get('today-content').innerHTML.includes('今日は休養日'));
  assert.ok(a.nodes.get('today-content').innerHTML.includes('note-ta'));
});
test('stale tab cannot overwrite newer menu even before storage event delivery',()=>{
  const shared=new Map(),left=tab(shared);left.run(setup+'persist()');const right=tab(shared);right.run('loadState()');
  left.run("S.menu.push({...S.menu[0],id:'two'});persist()");
  assert.throws(()=>right.run("saveNote('架空メモ')"),/別の画面/);
  assert.equal(JSON.parse(shared.get('rehab_v2')).settings.menu.length,2);
  assert.equal(right.run('Object.keys(L).length'),0);
  assert.equal(right.run('storageBlocked'),true);
});
test('storage notification locks stale patient without merging patient records',()=>{
  const shared=new Map(),a=tab(shared);a.run(setup+'persist()');const b=tab(shared);b.run('loadState()');
  a.run("S.patientId='another_fake_patient';L={};persist()");
  b.listeners.storage({key:'rehab_v2',storageArea:b.ctx.localStorage});
  assert.equal(b.run('storageConflict'),true);
  assert.throws(()=>b.run("S.patientName='stale';persist()"),/保存できない/);
  assert.equal(JSON.parse(shared.get('rehab_v2')).settings.patientId,'another_fake_patient');
  assert.equal(b.run('S.patientName'),'');
});
test('storage read/write errors restore committed state without altering stored data',()=>{
  for(const operation of ['getItem','setItem']){
    const a=tab();a.run(setup+'persist()');const before=a.storage.get('rehab_v2');
    a.ctx.localStorage[operation]=()=>{throw Error('simulated denied storage')};
    assert.throws(()=>a.run("S.patientName='not saved';persist()"),/denied/);
    assert.equal(a.run('S.patientName'),'');assert.equal(a.storage.get('rehab_v2'),before);
  }
});
test('blank pasted URL gives feedback without throwing',()=>{
  const a=tab();a.run("manualImport('')");assert.equal(a.nodes.get('toast').textContent,'URLを入力してください');
});
test('legacy original survives save reload and strips nested original copies',()=>{
  const a=tab();a.run(setup+`L=C.migrate(S,{[todayKey()]:{done:{one:true},note:'旧記録',vas:4}},'fake',todayKey()).logs;writableLog().note='変更後';persist();loadState();`);
  assert.equal(a.run('L[todayKey()].legacyOriginal.note'),'旧記録');
  assert.equal(a.run('L[todayKey()].legacyOriginal.menuSnapshot'),undefined);
  assert.equal(a.run('L[todayKey()].legacyOriginal.done.one'),true);
  a.run('L[todayKey()].legacyOriginal.legacyOriginal={note:"nested"};L=C.logs(L)');
  assert.equal(a.run('L[todayKey()].legacyOriginal.legacyOriginal'),undefined);
});
test('explicit no illustration survives settings backup and share validation',()=>{
  const a=tab();a.run(setup+`S.menu=C.menu([{...S.menu[0],name:Object.values(EXERCISE_LIBRARY)[0].name,exerciseKey:'',mediaDisabled:true}]);persist();loadState();`);
  assert.equal(a.run('mediaFor(S.menu[0])'),null);
  assert.equal(a.run('C.settings(buildSharePayload(),"fake",todayKey()).menu[0].mediaDisabled'),true);
  assert.equal(a.run('!!mediaFor({...S.menu[0],mediaDisabled:false})'),true,'legacy name fallback stays compatible');
});
test('individual prescription and safety contacts survive backup, custom template and QR payload',()=>{
  const a=tab();a.run(setup+`S.menu[0].prescription=C.prescription({side:'右',repetitions:'5回',sets:'1セット',hold:'該当なし',frequency:'1日1回',load:'重りなし',support:'椅子で支える'});S.menu[0].scheduleConfirmed=true;S.painContext='運動前';S.consultContact='担当窓口';S.restartInstructions='担当者と相談';T={custom_test:{name:'個別設定',icon:'',desc:'',menu:C.clone(S.menu)}};persist();loadState();`);
  assert.equal(a.run('S.menu[0].prescription.side'),'右');
  assert.equal(a.run('T.custom_test.menu[0].prescription.support'),'椅子で支える');
  assert.equal(a.run('T.custom_test.menu[0].scheduleConfirmed'),true);
  a.run(`var received=C.settings(JSON.parse(JSON.stringify(buildSharePayload())),'fake',todayKey());`);
  for(const key of ['painContext','consultContact','restartInstructions'])assert.equal(a.run(`received.${key}`),a.run(`S.${key}`));
  assert.equal(a.run('received.menu[0].prescription.frequency'),'1日1回');
  assert.equal(a.run('received.menu[0].scheduleConfirmed'),true);
});
