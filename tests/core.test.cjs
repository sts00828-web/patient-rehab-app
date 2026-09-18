const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../core.js');
const day='2026-09-18',next='2026-09-19';
const item=(id='one')=>({id,name:'exercise',params:'PT dose',note:'',dows:[]});
const state=()=>C.settings({patientId:'patient_a',startDate:day,knownSince:day,menu:[item()]},'fallback',day);
test('apply three to seven today retains recorded work, pain, notes and old days',()=>{
  const original=C.menu([item('one'),item('two'),item('three')]);
  const s=C.settings({menu:original,startDate:'2026-09-17',knownSince:'2026-09-17'},'p',day);
  const l={[day]:{menuSnapshot:C.clone(original),done:{one:true},status:{one:'done',two:'partial'},vas:0,note:'keep'}};
  C.changeMenu(s,l,[...original,...[4,5,6,7].map(i=>item('extra'+i))],day,next);
  assert.equal(C.menuAt(s,l,day,5).length,3);
  C.applyMenuToday(s,l,day,5);
  assert.equal(C.menuAt(s,l,day,5).length,7);assert.equal(C.completion(s,l,day,5).done,1);
  assert.equal(l[day].status.two,'partial');assert.equal(l[day].vas,0);assert.equal(l[day].note,'keep');
  assert.equal(C.menuAt(s,l,'2026-09-17',4).length,3);assert.equal(C.menuAt(s,l,next,6).length,7);
  assert.equal(s.plans.some(p=>p.from>day),false);
  const loaded=C.logs(JSON.parse(JSON.stringify(l)));assert.equal(loaded[day].menuRevisions[0].menuSnapshot.length,3);assert.equal(loaded[day].menuRevisions[0].done.one,true);
});
test('changed dosage is unrecorded while matching rebuilt ids retain status',()=>{
  const old=C.menu([{...item('one'),exerciseKey:'bridge'},{...item('two'),exerciseKey:'pendulum'}]);
  const s=state(),l={[day]:{menuSnapshot:old,done:{one:true,two:true},status:{one:'done',two:'done'}}};
  s.menu=C.menu([{...old[0],id:'rebuilt'},{...old[1],params:'changed dose'}]);
  C.applyMenuToday(s,l,day,5);
  assert.equal(l[day].status.rebuilt,'done');assert.equal(l[day].status.two,undefined);assert.equal(l[day].menuRevisions[0].status.two,'done');
});
test('immediate update respects weekdays and start date',()=>{
  const s=state();s.menu=C.menu([item(),{...item('rest'),dows:[1]}]);C.applyMenuToday(s,{},day,5);
  assert.equal(C.menuAt(s,{},day,5).length,1);assert.throws(()=>C.applyMenuToday(s,{},'2026-09-17',4));
});
test('historical snapshot survives template replacement',()=>{
  const s=state(),logs={[day]:{menuSnapshot:[item()],done:{one:true}}};
  C.changeMenu(s,logs,[item('two')],day,next);
  assert.equal(C.completion(s,logs,day,5).pct,100);
  assert.equal(C.menuAt(s,logs,next,6)[0].id,'two');
});
test('unsaved historical prescription survives later edits',()=>{
  const s=state();C.changeMenu(s,{},[item('two')],next,'2026-09-20');
  assert.equal(C.menuAt(s,{},day,5)[0].id,'one');
});
test('days before start and rest days have no denominator',()=>{
  const s=state();assert.equal(C.completion(s,{},'2026-09-17',4).total,0);
  s.plans[0].menu[0].dows=[1];assert.equal(C.completion(s,{},day,5).total,0);
});
test('legacy history is preserved without guessing old prescriptions',()=>{
  const r=C.migrate({startDate:'2026-09-01',menu:[item('new')]},{'2026-09-17':{done:{old:true},vas:3,note:'keep'}},'legacy_id',day);
  assert.equal(r.logs['2026-09-17'].done.old,true);assert.equal(r.logs['2026-09-17'].vas,3);
  assert.equal(C.completion(r.settings,r.logs,'2026-09-17',4).unknown,true);
  assert.equal(C.completion(r.settings,r.logs,'2026-09-17',4).total,0);
});
test('zero pain is distinct from missing pain',()=>{
  const x=C.logs({[day]:{vas:0},[next]:{}});assert.equal(x[day].vas,0);assert.equal(x[next].vas,null);
});
test('malformed import, duplicate ids and bad dates are rejected',()=>{
  assert.throws(()=>C.menu([item(),item()]));assert.throws(()=>C.menu([{...item(),dows:[9]}]));
  assert.throws(()=>C.logs({'2026-02-31':{}}));assert.equal(C.videoUrl('javascript:alert(1)'),'');
  assert.equal(C.menu([{...item(),id:"x');alert(1)//"}])[0].id,'import_0');
});
test('partial and pain-related rest are not counted as complete',()=>{
  const s=state(),logs={[day]:{status:{one:'pain'},done:{one:true}}};assert.equal(C.completion(s,logs,day,5).done,0);
});
test('settings validation strips passcode and ignores invalid id',()=>{
  const s=C.settings({...state(),passcode:'1234',patientId:'<img>'},'new_id',day);assert.equal(s.patientId,'new_id');assert.equal('passcode' in s,false);
});
