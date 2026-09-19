const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function setup(){
  const ctx=vm.createContext({URL,requireStaff:()=>false,modal:()=>{throw Error('Locked viewer opened');}});
  for(const file of ['exercises.js','disease-library.js','exercise-evidence.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
  vm.runInContext('globalThis.evidence=ExerciseEvidence;globalThis.library=EXERCISE_LIBRARY;',ctx);
  return ctx;
}
test('every built-in exercise exposes its registered source without modifying the prescription',()=>{
  const c=setup();assert.equal(Object.keys(c.library).length,46);
  for(const [exerciseKey,e] of Object.entries(c.library)){
    const ex={exerciseKey,prescription:{repetitions:'patient-specific'}};
    const before=JSON.stringify(ex),html=c.evidence.html(ex,'knee');
    assert.ok(html.includes(e.source.replace(/&/g,'&amp;')));
    assert.ok(html.includes('入力補助用の初期値'));
    assert.equal(JSON.stringify(ex),before);
  }
});
test('unregistered custom exercises and diagnoses do not inherit unrelated guideline evidence',()=>{
  const c=setup();
  assert.ok(c.evidence.html({exerciseKey:'custom'},'knee').includes('参考資料が登録されていません'));
  assert.ok(!c.evidence.html({exerciseKey:'custom'},'knee').includes('NG226'));
  assert.ok(!c.evidence.html({exerciseKey:'pendulum'},'knee').includes('NG226'));
  assert.ok(c.evidence.html({exerciseKey:'pendulum'},'slapLesion').includes('ガイドラインは未登録'));
  for(const g of Object.values(c.evidence.guidelines))assert.equal(new URL(g.url).protocol,'https:');
});
test('evidence is staff gated and rejects unsafe source URLs',()=>{
  const c=setup();c.showExerciseEvidence({exerciseKey:'pendulum'},'shoulder');c.showTemplateEvidence(0);
  c.library.pendulum.source='javascript:alert(1)';c.library.pendulum.name='<script>alert(1)</script>';
  const html=c.evidence.html({exerciseKey:'pendulum'},'shoulder');
  assert.ok(!html.includes('javascript:'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));
});
