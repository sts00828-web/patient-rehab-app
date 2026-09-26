/* Independent v0.3 acceptance checks. Baseline fingerprints were captured from
   the committed v0.2 catalog before selection; no local review files or git needed. */
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const catalog=require('../clinical-catalog.js'),R=require('../clinical-rules.js'),C=require('../core.js');
const selected=['S30','S37','N12','T25','T26','K26','K38','A11','A13','A15','P12','P13'];
const oldIds=Object.entries({S:26,T:23,N:10,K:24,E:10,A:10,P:10}).flatMap(([prefix,n])=>Array.from({length:n},(_,i)=>prefix+String(i+1).padStart(2,'0'))).sort();
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
test('selection preserves the v0.2 catalog apart from approved display-name updates and adds only 12 reviewed IDs',()=>{
 assert.equal(oldIds.length,113);
 assert.deepEqual(Object.keys(catalog.definitions).sort(),[...oldIds,...selected].sort());
 assert.equal(hash(oldIds.map(id=>[id,catalog.definitions[id]])),'acea444609e4e7ab61b66b3229bbee95e3e6eb5f5a2bb20ae98a50503714428d');
 assert.equal(Object.keys(catalog.categories).length,25);
 const oldLevels=Object.keys(catalog.categories).sort().map(id=>[id,Object.fromEntries(Object.entries(catalog.categories[id].levels).map(([level,ids])=>[level,ids.filter(eid=>!selected.includes(eid))]))]);
 assert.equal(hash(oldLevels),'f7d3581b76f06e1fef2e19f8f9905d0de0f348be5b91f141ea418c34e82163ac');
 assert.equal(oldLevels.flatMap(([,levels])=>Object.values(levels).flat()).length,437);
 const linked=new Set();
 for(const c of Object.values(catalog.categories))for(const ids of Object.values(c.levels)){
  assert.equal(new Set(ids).size,ids.length);
  for(const id of ids){assert.ok(catalog.definitions[id]);assert.ok(R.isSelectable(id));linked.add(id);}
 }
 for(const id of selected)assert.ok(linked.has(id),id+' must be selectable from a category');
 assert.ok(linked.has('A08'),'supported reach remains available');
});
test('all 12 additions have actual PNGs, matching hashes and pending clinical review',()=>{
 for(const id of selected){
  const d=catalog.definitions[id];assert.equal(d.key,'v02_'+id);assert.equal(d.addedIn,'0.3');
  assert.equal(d.clinicalStatus,'pending_review');assert.equal(d.image,'images/'+id+'.png');
  assert.ok(d.steps.length&&d.steps.every(s=>typeof s==='string'&&s.trim()));assert.ok(d.caution&&d.imageCaption);
  const bytes=fs.readFileSync(path.join(__dirname,'..',d.image));
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),d.sha256);
 }
});
const doses={S30:[8,1,2,null,60,'per_side'],S37:[5,1,2,null,60,'total'],N12:[5,1,5,5,10,'each_direction'],T25:[3,1,3,10,30,'total'],T26:[3,1,3,10,30,'total'],K26:[8,1,2,null,60,'per_side'],K38:[3,2,3,null,0,'total'],A11:[8,1,2,null,60,'per_side'],A13:[8,1,2,null,60,'per_side'],A15:[3,1,3,null,30,'each_direction'],P12:[6,2,2,null,60,'total'],P13:[3,2,2,2,60,'each_side']};
const sides={S30:'right',S37:'bilateral',N12:'none',T25:'none',T26:'none',K26:'right',K38:'none',A11:'right',A13:'right',A15:'right',P12:'bilateral',P13:'alternating'};
test('selected starting doses preserve weekly frequency, holding/rest and side exceptions through share',()=>{
 for(const id of selected){
  const dose=R.doseDraft(id),side=R.initialSide(id,'right');
  assert.deepEqual([dose.reps,dose.sets,dose.daysPerWeek,dose.holdSeconds??null,dose.restSeconds,dose.amountBasis],doses[id],id);
  assert.equal(side,sides[id]);assert.equal(dose.sessionsPerDay,1);
  const categoryId=Object.values(catalog.categories).find(c=>Object.values(c.levels).flat().includes(id)).id;
  const ex=C.menu([{id:'synthetic_'+id,name:catalog.definitions[id].name,exerciseKey:'v02_'+id,dows:[],scheduleMode:'flexible',clinicalV02:{...dose,mode:'simple',categoryId,revision:'synthetic',side,patient:{patientId:'synthetic'}}}])[0];
  assert.deepEqual(R.issues(ex),[],id);assert.equal(ex.clinicalV02.clinical.approved,false);assert.equal(ex.clinicalV02.patient.confirmed,false);
  assert.match(ex.prescription.frequency,new RegExp('週'+dose.daysPerWeek+'日'));
  const decoded=C.settings(C.decodeShare(JSON.parse(JSON.stringify(C.encodeShare({patientId:'synthetic',menu:[ex],startDate:'2026-09-26'})))),'synthetic','2026-09-26').menu[0];
  assert.equal(decoded.scheduleMode,'flexible');assert.deepEqual(decoded.dows,[]);assert.equal(decoded.clinicalV02.daysPerWeek,dose.daysPerWeek);assert.equal(decoded.clinicalV02.restSeconds,dose.restSeconds);
  assert.equal(decoded.clinicalV02.clinical.approved,false);assert.equal(decoded.clinicalV02.patient.confirmed,false);
 }
 assert.match(R.doseDraft('P12').doseDetail,/48時間/);assert.match(R.doseDraft('P13').doseDetail,/48時間/);
 assert.match(R.doseDraft('K38').doseDetail,/早歩き1分.*普通歩き2分/);
});
test('unilateral additions switch instructions without changing shared reference images',()=>{
 for(const id of ['S30','K26','A11','A13','A15']){
  const d=catalog.definitions[id];assert.equal(R.initialSide(id,'left'),'left');
  const ex={exerciseKey:d.key,clinicalV02:{side:'left',mode:'simple'}};
  const steps=R.patientSteps(ex,d).join(' ');
  assert.ok(steps.includes('左'),id+' left-side text');assert.equal(d.image,'images/'+id+'.png');
 }
});
test('patient copy does not expose internal exercise IDs or staff shorthand',()=>{
 const forbidden=/(?:[STNKEAP]\d{2}|\bPT\b|セラピストモード|要評価|未許可期不可|代替候補)/;
 for(const d of Object.values(catalog.definitions)){
  const ex={exerciseKey:d.key,clinicalV02:{side:'right',mode:'simple'}};
  assert.doesNotMatch(R.patientCaution(ex,d),forbidden,d.id+' caution');
  for(const step of R.patientSteps(ex,d))assert.doesNotMatch(step,forbidden,d.id+' step');
 }
 assert.match(R.patientCaution({exerciseKey:'v02_T11',clinicalV02:{mode:'simple'}}),/仰向けの足踏み/);
});
