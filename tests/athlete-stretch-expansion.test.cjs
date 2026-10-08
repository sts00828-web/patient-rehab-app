const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const catalog=require('../clinical-catalog.js'),R=require('../clinical-rules.js'),C=require('../core.js');
const selection=require('./fixtures/athlete-stretch-expansion-v05.json');
test('ten additions are usable WebPs with matching content hashes and review status',()=>{
 for(const expected of selection.definitions){
  const d=catalog.definitions[expected.id];assert.equal(d.key,expected.key);assert.equal(d.clinicalStatus,'pending_review');
  const bytes=fs.readFileSync(path.join(__dirname,'..',d.image));
  assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),d.sha256,d.id);
  assert.ok(bytes.length<100000,d.id+' image budget');
  for(const field of ['target','feltArea','avoid','pose','equipment','imageCaption'])assert.ok(d[field],d.id+' '+field);
 }
 assert.equal(catalog.definitions.P40.image,'assets/exercises/wrist-flexor-stretch-v3.webp');
 assert.ok(!fs.existsSync(path.join(__dirname,'../images/P40.png'))&&!fs.existsSync(path.join(__dirname,'../images/P40.webp')));
});
test('athlete stretch shelves include 28 unique items: 17 static and 11 dynamic',()=>{
 const ids=[...new Set(['A12','A13','A14','A16'].flatMap(id=>Object.values(catalog.categories[id].levels).flat()))];
 assert.equal(ids.length,28);assert.equal(ids.filter(id=>catalog.definitions[id].movementType==='static').length,17);
 assert.equal(ids.filter(id=>catalog.definitions[id].movementType==='dynamic').length,11);
 for(const d of selection.definitions)assert.ok(ids.includes(d.id),d.id);
 for(const category of Object.values(catalog.categories))for(const ids of Object.values(category.levels))assert.equal(new Set(ids).size,ids.length);
 assert.equal(catalog.definitions.S16.key,'v02_S16');
});
test('static holds, dynamic repetitions and chosen sides survive synthetic share round trips',()=>{
 for(const d of selection.definitions){
  const dose=R.doseDraft(d.id),category=Object.values(catalog.categories).find(c=>Object.values(c.levels).flat().includes(d.id));
  if(d.movementType==='static'){assert.equal(dose.holdSeconds,15);assert.equal(dose.reps,2);}
  else{assert.ok(!dose.holdSeconds);assert.equal(dose.reps,5);}
  for(const side of ['left','right','bilateral']){
   // Model an explicitly authored prescription. Reading existing data must not repair its dose basis.
   const amountBasis=d.id==='P38'?'total':side==='bilateral'?'each_side':'per_side';
   const ex=C.menu([{id:'synthetic_'+d.id,name:d.name,exerciseKey:d.key,dows:[],scheduleMode:'flexible',clinicalV02:{...dose,amountBasis,mode:'simple',categoryId:category.id,revision:'synthetic',side,patient:{patientId:'synthetic'}}}])[0];
   assert.deepEqual(R.issues(ex),[],d.id);
   const saved=C.settings(C.decodeShare(JSON.parse(JSON.stringify(C.encodeShare({patientId:'synthetic',menu:[ex],startDate:'2026-10-08'})))),'synthetic','2026-10-08');
   assert.equal(saved.menu.length,1,'catalog additions must not auto-populate patient menu');
   assert.equal(saved.menu[0].exerciseKey,d.key);assert.equal(saved.menu[0].clinicalV02.side,side);
   assert.equal(saved.menu[0].clinicalV02.holdSeconds,ex.clinicalV02.holdSeconds);
   if(side!=='bilateral'){
    assert.doesNotMatch(R.patientSteps(ex,d).join(''),/反対側も/);
    assert.doesNotMatch(ex.prescription.repetitions,/左右各/);
    assert.doesNotMatch(saved.menu[0].prescription.repetitions,/左右各/);
    if(d.id!=='P38')assert.equal(R.initialSide(d.id,side),side);
   }
  }
 }
});
