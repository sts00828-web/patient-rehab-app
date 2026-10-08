/* Synthetic canonical pre-fix fixture; never read patient storage or normalize the expected value. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{test}=require('node:test');
const root=process.env.PATIENT_REHAB_TEST_ROOT||path.resolve(__dirname,'..');
const C=require(path.join(root,'core.js')),R=require(path.join(root,'clinical-rules.js'));
const fixture=require('./fixtures/synthetic-pre-authoring-history.json');
const clone=x=>JSON.parse(JSON.stringify(x));
function savedState(id,basis,side){
 const state=clone(fixture),labels={each_side:'左右各',per_side:'指定側につき',total:'合計',each_direction:'左・右の各方向'};
 const walk=value=>{if(!value||typeof value!=='object')return;if(value.clinicalV02){
  value.exerciseKey='v02_'+id;value.clinicalV02.side=side;value.clinicalV02.amountBasis=basis;
  value.clinicalV02.doseDirections=basis==='each_direction'?'左・右':'';
  value.prescription.side=side==='left'?'左':'右';value.prescription.repetitions='2回（'+labels[basis]+'）';
 }for(const v of Object.values(value))walk(v);};walk(state);return state;
}
for(const id of ['P16','K01','P31'])for(const basis of ['each_side','per_side','total','each_direction'])test('canonical history survives load and share unchanged: '+id+' '+basis,()=>{
 for(const side of ['left','right']){
  const state=savedState(id,basis,side),original=JSON.stringify(state),label=id+' '+side+' '+basis;
  assert.equal(R.normalize(state.settings.menu[0].clinicalV02).amountBasis,basis,label+' pure normalization');
  assert.deepEqual(C.settings(state.settings,'synthetic_history_audit','2026-10-08'),state.settings,label+' current menu and dated plans');
  assert.deepEqual(C.logs(state.logs),state.logs,label+' snapshot, revisions, legacyOriginal and completion');
  const roundtrip=C.decodeShare(JSON.parse(JSON.stringify(C.encodeShare(state.settings))));
  assert.deepEqual(roundtrip.menu,state.settings.menu,label+' QR semantics');
  assert.equal(JSON.stringify(state),original,label+' source was not mutated');
 }
});
test('loadState and routine pain save never persist a rewritten historical dose',()=>{
 const stored=JSON.stringify({version:2,...clone(fixture)}),storage=new Map([['rehab_v2',stored]]),nodes=new Map();
 const ctx=vm.createContext({RehabCore:C,ClinicalRules:R,console,URL,Date,crypto:require('node:crypto').webcrypto,
  setInterval(){},setTimeout(){},clearTimeout(){},MutationObserver:class{observe(){}},alert(){},confirm(){return true},prompt(){return 'synthetic'},
  navigator:{},location:{pathname:'/',hash:'',search:'',origin:'https://synthetic.test'},addEventListener(){},
  document:{querySelector(){return null},addEventListener(){},getElementById(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',classList:{add(){},remove(){},contains(){return false}}});return nodes.get(id)}},
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});ctx.window=ctx;
 for(const file of ['ui.js','exercises.js','disease-library.js','app-v2.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
 vm.runInContext('loadState()',ctx);
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(L)',ctx)),fixture.logs,'memory must preserve all old logs');
 assert.equal(storage.get('rehab_v2'),stored,'load itself must not rewrite storage');
 vm.runInContext('saveVas(0)',ctx);
 const after=JSON.parse(storage.get('rehab_v2'));
 assert.deepEqual(after.logs['2026-10-01'],fixture.logs['2026-10-01'],'today save must preserve prior dose and record');
 assert.deepEqual(after.settings,fixture.settings,'unrelated save must preserve current prescription and plans');
});
