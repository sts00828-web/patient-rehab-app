const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../core.js');
const day='2026-09-19',next='2026-09-20';
const prescription={side:'右',repetitions:'5回',sets:'2セット',hold:'該当なし',frequency:'1日1回',load:'重りなし',support:'椅子の背を持つ'};
const exercise=()=>({id:'one',name:'架空の運動',params:'旧形式の説明を保持',dows:[],prescription:{...prescription},scheduleConfirmed:true});
test('individual prescription survives settings, plans, logs and revision roundtrip',()=>{
  const menu=[exercise()];
  const raw={patientId:'fake',startDate:day,knownSince:day,menu,painContext:'運動前',consultContact:'院内で指定した相談先',restartInstructions:'再開前に担当者と確認',plans:[{from:day,menu}]};
  const settings=C.settings(JSON.parse(JSON.stringify(raw)),'fake',day);
  assert.deepEqual(settings.menu[0].prescription,prescription);
  assert.deepEqual(settings.plans[0].menu[0].prescription,prescription);
  assert.equal(settings.menu[0].scheduleConfirmed,true);
  for(const key of ['painContext','consultContact','restartInstructions'])assert.equal(settings[key],raw[key]);
  const logs=C.logs(JSON.parse(JSON.stringify({[day]:{menuSnapshot:menu,status:{one:'partial'},menuRevisions:[{menuSnapshot:menu,status:{one:'done'}}]}})));
  assert.deepEqual(logs[day].menuSnapshot[0].prescription,prescription);
  assert.deepEqual(logs[day].menuRevisions[0].menuSnapshot[0].prescription,prescription);
  assert.equal(logs[day].status.one,'partial');
});
test('legacy dosage remains intact and missing fields are not inferred from text',()=>{
  const old=C.menu([{id:'old',name:'運動',params:'左右各5回・毎日',dows:[]}])[0];
  assert.equal(old.params,'左右各5回・毎日');
  assert.ok(Object.values(old.prescription).every(v=>v===''));
  assert.equal(old.scheduleConfirmed,false);
  assert.equal(C.prescriptionIssues(old).length,8);
  assert.deepEqual(C.prescriptionIssues(exercise()),[]);
});
test('explicit not-applicable differs from unspecified and malformed metadata is normalized',()=>{
  assert.equal(C.prescription({hold:'該当なし'}).hold,'該当なし');
  assert.equal(C.prescription({hold:null}).hold,'');
  assert.equal(C.prescription({sets:3}).sets,'');
  assert.equal(C.prescription({side:'  右  '}).side,'右');
  assert.equal(C.prescription({side:'x'.repeat(121)}).side.length,120);
});
test('changing side or support clears completion for the new prescription but preserves old evidence',()=>{
  for(const [key,value] of [['side','左'],['support','手すりを持つ']]){
    const s=C.settings({patientId:'fake',startDate:day,knownSince:day,menu:[exercise()]},'fake',day);
    const logs={[day]:{menuSnapshot:C.clone(s.menu),done:{one:true},status:{one:'done'},vas:3,note:'保持する記録'}};
    const changed=C.clone(s.menu);changed[0].prescription[key]=value;
    C.changeMenu(s,logs,changed,day,next);
    assert.equal(C.menuAt(s,logs,day,6)[0].prescription[key],prescription[key]);
    C.applyMenuToday(s,logs,day,6);
    assert.equal(logs[day].status.one,undefined);
    assert.equal(logs[day].menuRevisions[0].status.one,'done');
    assert.equal(logs[day].menuRevisions[0].menuSnapshot[0].prescription[key],prescription[key]);
    assert.equal(logs[day].menuSnapshot[0].prescription[key],value);
    assert.equal(logs[day].vas,3);assert.equal(logs[day].note,'保持する記録');
  }
});
