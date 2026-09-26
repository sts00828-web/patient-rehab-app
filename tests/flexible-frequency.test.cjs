const {test}=require('node:test'),assert=require('node:assert/strict');
const C=require('../core.js'),R=require('../clinical-rules.js');
function exercise(overrides={}){return {id:'fixture',name:'架空の運動',exerciseKey:'v02_K06',dows:[],scheduleMode:'flexible',clinicalV02:{...R.doseDraft('K06'),mode:'simple',categoryId:'G03',revision:'fixture',side:'bilateral',amountBasis:'total',patient:{patientId:'fixture_patient'}},...overrides};}
test('flexible frequency is available without choosing weekdays and retains prescribed weekly dose',()=>{
 const ex=C.menu([exercise()])[0];assert.deepEqual(R.issues(ex),[]);assert.equal(ex.clinicalV02.daysPerWeek,2);
 assert.match(ex.prescription.frequency,/週2日/);
 for(let day=0;day<7;day++)assert.equal(C.scheduled([ex],day).length,1);
 for(const invalid of [0,8,2.5]){const x=structuredClone(ex);x.clinicalV02.daysPerWeek=invalid;assert.ok(R.issues(x).length);}
});
test('flexible mode survives QR and backup without converting frequency or adding clinical approval',()=>{
 const raw={version:2,patientId:'fixture_patient',startDate:'2026-09-26',menu:[exercise()]};
 const decoded=C.decodeShare(JSON.parse(JSON.stringify(C.encodeShare(raw))));
 const saved=C.settings(decoded,'fallback','2026-09-26');const ex=saved.menu[0];
 assert.equal(ex.scheduleMode,'flexible');assert.deepEqual(ex.dows,[]);assert.equal(ex.clinicalV02.daysPerWeek,2);assert.equal(ex.clinicalV02.restSeconds,60);
 assert.equal(ex.clinicalV02.clinical.approved,false);assert.equal(ex.clinicalV02.patient.confirmed,false);
 assert.deepEqual(C.settings(JSON.parse(JSON.stringify(saved)),'fallback','2026-09-26'),saved);
});
test('legacy fixed weekdays and historical snapshots are not migrated on read',()=>{
 const legacy=exercise({scheduleMode:undefined,dows:[1,4],scheduleConfirmed:true});
 const s=C.settings({patientId:'fixture_patient',startDate:'2026-09-20',knownSince:'2026-09-20',menu:[legacy]},'fallback','2026-09-26');
 assert.equal(s.menu[0].scheduleMode,undefined);assert.deepEqual(s.menu[0].dows,[1,4]);assert.deepEqual(R.issues(s.menu[0]),[]);
 assert.equal(C.scheduled(s.menu,2).length,0);assert.equal(C.scheduled(s.menu,1).length,1);
 const history=C.logs({'2026-09-21':{menuSnapshot:s.menu,done:{fixture:true}}});
 const updated={...s,menu:C.menu([exercise()]),plans:[...s.plans,{from:'2026-09-26',menu:C.menu([exercise()])}]};
 assert.deepEqual(C.menuAt(updated,history,'2026-09-21',1)[0].dows,[1,4]);
 assert.equal(C.menuAt(updated,history,'2026-09-26',6)[0].scheduleMode,'flexible');
});
test('contradictory frequency mode data and unknown modes are rejected',()=>{
 assert.throws(()=>C.menu([exercise({dows:[1]})]),/固定曜日/);
 assert.throws(()=>C.menu([exercise({scheduleMode:'everyday'})]),/形式/);
 assert.ok(R.issues(exercise({dows:[1]})).some(s=>s.includes('固定曜日')));
 const x=exercise({scheduleMode:undefined,dows:[]});assert.ok(R.issues(x).some(s=>s.includes('実施曜日')));
});
test('free-text flexible prescriptions cannot silently lose weekly frequency',()=>{
 const ex={id:'legacy',name:'架空',exerciseKey:'custom',scheduleMode:'flexible',dows:[],prescription:Object.fromEntries(Object.keys(C.prescriptionLabels).map(k=>[k,'個別指示']))};
 ex.prescription.frequency='1日2回';assert.ok(C.prescriptionIssues(ex).some(s=>s.includes('週の実施日数')));
 for(const frequency of ['週2日・1日2回','週2〜3日・1日1回','毎日・1日1回','隔日']){ex.prescription.frequency=frequency;assert.deepEqual(C.prescriptionIssues(ex),[]);}
});
