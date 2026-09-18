const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const C=require('../core.js'),LZ=require('../vendor/lz-string.min.js'),root=path.resolve(__dirname,'..');
function library(){const ctx=vm.createContext({});for(const f of ['exercises.js','disease-library.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);vm.runInContext('globalThis.ex=EXERCISE_LIBRARY;globalThis.ds=DISEASE_LIBRARY',ctx);return ctx;}
const original={
  shoulder:['pendulum','supine-flexion','crossover','table-slide','wall-slide','stick-external-rotation','scapular-setting','shoulder-isometric-external','shoulder-isometric-internal','band-row'],
  lowback:['abdominal-brace','bridge','knee-to-chest','pelvic-tilt','knee-rolls','cat-camel','prone-on-elbows','bird-dog','kneeling-plank','walking'],
  knee:['heel-slide','short-arc-quad','sit-to-stand','quad-setting','straight-leg-raise','seated-knee-extension','heel-raise','mini-squat','step-up','side-lying-hip-abduction'],
  tennisElbow:['elbow-bend-straighten','forearm-turn','wrist-active-extension','wrist-extensor-stretch','wrist-flexor-stretch','wrist-isometric-extension','wrist-eccentric-extension','wrist-resisted-extension','gentle-ball-grip','resisted-forearm-turn']
};
test('original forty IDs, order, prescription notes and template shape stay compatible',()=>{
  const ctx=library();for(const [disease,ids]of Object.entries(original)){
    assert.deepEqual(Array.from(ctx.getDiseaseExerciseKeys(disease)),ids);
    const expected=ids.map(exerciseKey=>{const e=ctx.ex[exerciseKey];return{name:e.name,params:e.params,note:e.caution,exerciseKey,dows:[]}});
    assert.deepEqual(JSON.parse(JSON.stringify(ctx.getDiseaseExerciseMenu(disease))),expected);
  }
});
test('explicit membership can share other regions while preserving order and original definitions',()=>{
  const ctx=library(),before=JSON.stringify(ctx.ex);ctx.ds.fixture={exerciseKeys:['heel-raise','pendulum'],prescriptionNote:'確認された範囲で行います。'};
  const keys=ctx.getDiseaseExerciseKeys('fixture');assert.deepEqual(Array.from(keys),['heel-raise','pendulum']);keys.reverse();
  assert.deepEqual(Array.from(ctx.getDiseaseExerciseKeys('fixture')),['heel-raise','pendulum']);
  assert.equal(ctx.getDiseaseExerciseMenu('fixture')[0].note,ctx.ex['heel-raise'].caution+'\n確認された範囲で行います。');
  assert.equal(JSON.stringify(ctx.ex),before);
});
test('unknown, duplicate, empty or malformed memberships are rejected',()=>{
  const ctx=library();for(const exerciseKeys of [[],['unknown'],['pendulum','pendulum'],'pendulum',Array(61).fill('pendulum')]){
    ctx.ds.fixture={exerciseKeys};assert.throws(()=>ctx.getDiseaseExerciseKeys('fixture'));
  }
  assert.throws(()=>ctx.getDiseaseExerciseKeys('unknownDisease'));
});
test('disease restrictions survive compressed QR payload and patient state without rewriting old snapshots',()=>{
  const ctx=library(),day='2026-09-18',tomorrow='2026-09-19';ctx.ds.fixture={exerciseKeys:['heel-raise','pendulum'],prescriptionNote:'許可された負荷だけで行います。'};
  const old=C.menu([{id:'old',name:'旧処方',params:'5回',note:'旧注意',dows:[]}]);
  const state=C.settings({patientId:'fake',startDate:day,menu:old},'fake',day),logs={[day]:{menuSnapshot:C.clone(old),done:{old:true},status:{old:'done'}}};
  const selected=ctx.getDiseaseExerciseMenu('fixture').map((m,i)=>({...m,id:'new_'+i,params:'PT指定5回'}));
  const payload={version:2,patientId:'fake',startDate:day,menu:C.menu(selected)};
  const decoded=JSON.parse(LZ.decompressFromEncodedURIComponent(LZ.compressToEncodedURIComponent(JSON.stringify(payload))));
  const received=C.settings(decoded,'fake',day);C.changeMenu(state,logs,received.menu,day,tomorrow);
  assert.deepEqual(logs[day].menuSnapshot,old);assert.equal(logs[day].done.old,true);
  assert.equal(received.menu[0].exerciseKey,'heel-raise');assert.match(received.menu[0].note,/許可された負荷だけ/);
  assert.equal(ctx.ex[received.menu[0].exerciseKey].image,ctx.ex['heel-raise'].image);
});
test('overlong restrictions fail before core could silently truncate them',()=>{
  const ctx=library();ctx.ds.fixture={exerciseKeys:['pendulum'],prescriptionNote:'注'.repeat(501)};
  assert.throws(()=>ctx.getDiseaseExerciseMenu('fixture'),/500/);
});
