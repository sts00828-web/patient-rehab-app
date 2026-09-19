const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const C=require('../core.js'),root=path.resolve(__dirname,'..');
function library(){const ctx=vm.createContext({});for(const f of ['exercises.js','prescription-defaults.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);return vm.runInContext('({exercises:EXERCISE_LIBRARY,defaults:PRESCRIPTION_DEFAULTS})',ctx);}
test('all exercise drafts have bounded dose fields and primary source links',()=>{
  const {exercises,defaults}=library();assert.deepEqual(Object.keys(defaults).sort(),Object.keys(exercises).sort());
  for(const [key,draft] of Object.entries(defaults)){
    assert.deepEqual(Object.keys(draft.prescription).sort(),Object.keys(C.prescriptionLabels).sort(),key);
    for(const value of Object.values(draft.prescription))assert.ok(typeof value==='string'&&value.length<=120,key);
    assert.ok(draft.note.length>0,key);assert.ok(draft.source.startsWith('https://'),key);
    assert.ok(Array.isArray(draft.dows)&&draft.dows.every(d=>Number.isInteger(d)&&d>=0&&d<=6),key);
    assert.ok(C.prescriptionIssues({...draft,scheduleConfirmed:false}).length>0,key);
  }
});
test('unilateral loading and resistance are not invented for patients',()=>{
  const {defaults}=library();for(const p of Object.values(defaults))assert.equal(p.prescription.side,'');
  for(const key of ['wrist-eccentric-extension','wrist-resisted-extension','resisted-forearm-turn','band-row','shoulder-band-external'])assert.equal(defaults[key].prescription.load,'',key);
});
test('default library is loaded and available in the offline application',()=>{
  for(const f of ['index.html','sw.js'])assert.ok(fs.readFileSync(path.join(root,f),'utf8').includes('prescription-defaults.js'));
});
