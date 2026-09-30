const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const catalog=require('../clinical-catalog.js'),rules=require('../clinical-rules.js');
const ids=Array.from({length:17},(_,i)=>'P'+(i+14));

test('athlete mobility and taping additions have matching reviewed assets',()=>{
 assert.equal(catalog.version,'0.4-athlete-mobility');
 for(const id of ids){
  const d=catalog.definitions[id];assert.ok(d,id);assert.equal(d.addedIn,'0.4');assert.equal(d.clinicalStatus,'pending_review');
  assert.equal(d.image,'images/'+id+'.webp');assert.match(d.sha256,/^[0-9a-f]{64}$/);
  const bytes=fs.readFileSync(path.join(__dirname,'..',d.image));
  assert.equal(bytes.subarray(0,4).toString('ascii'),'RIFF');assert.equal(bytes.subarray(8,12).toString('ascii'),'WEBP');
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),d.sha256,id);
  assert.ok(rules.doseDraft(id),id+' dose');
 }
});

test('four non-disease athlete menus expose unique valid choices',()=>{
 const expected={A12:6,A13:6,A14:6,A15:4};
 for(const [categoryId,count] of Object.entries(expected)){
  const c=catalog.categories[categoryId];assert.ok(c);assert.match(c.name,/^競技：/);
  const listed=Object.values(c.levels).flat();assert.equal(listed.length,count,categoryId);
  assert.equal(new Set(listed).size,count,categoryId+' duplicates');
  for(const id of listed){assert.ok(catalog.definitions[id],categoryId+' '+id);assert.ok(rules.isSelectable(id),id);}
 }
 assert.ok(catalog.categories.A12.levels.intermediate.includes('P15'));
 assert.ok(catalog.categories.A13.levels.beginner.includes('T04'));
 assert.ok(catalog.categories.A13.levels.advanced.includes('P23'));
});

test('stretching and taping copy keeps evidence limits and safety stops explicit',()=>{
 assert.match(catalog.categories.A12.notes,/可動域づくり/);
 assert.match(catalog.categories.A13.notes,/保証しない/);
 assert.match(catalog.categories.A15.notes,/短期補助/);
 for(const id of ['P27','P28','P29','P30']){
  const d=catalog.definitions[id];assert.match(d.caution,/直ちに外/);assert.match(d.steps[0],/担当者/);
  assert.equal(rules.dosePresetById[id],'T');
 }
 assert.match(catalog.definitions.P23.caution,/上級/);
 assert.match(catalog.definitions.P23.steps.join(''),/右膝を約90度.*右股関節を軽く伸ば.*右踵を身体の左側/);
 assert.match(catalog.definitions.P23.assetNotes,/2姿勢.*患者左脚.*右股関節.*右踵.*患者左側/);
 assert.match(catalog.definitions.P30.caution,/筋力増強/);
});

test('new bilateral and directional doses remain explicit',()=>{
 assert.equal(rules.initialSide('P15','right'),'none');
 assert.equal(rules.doseDraft('P15').amountBasis,'each_direction');
 assert.equal(rules.doseDraft('P15').doseDirections,'左・右');
 assert.equal(rules.initialSide('P25','left'),'bilateral');
 assert.equal(rules.doseDraft('P25').amountBasis,'each_direction');
 for(const id of ['P16','P17','P18','P19','P20','P21','P23','P24','P26']){
  assert.equal(rules.initialSide(id,'right'),'bilateral',id);
  assert.equal(rules.doseDraft(id).amountBasis,'each_side',id);
 }
});
