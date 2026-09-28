const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const R=require('../clinical-rules.js');

const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');

test('patient session separates repetitions, sets, and duration',()=>{
  const ui=read('clinical-ui.js'),css=read('app-v2.css');
  assert.match(ui,/class="dose-at-a-glance"/);
  for(const label of ['1セットの回数','セット数','持続時間','1日に行う回数'])assert.match(ui,new RegExp(label));
  assert.match(css,/grid-template-columns:repeat\(3/);
});

test('simple prescription has no fixed weekday input and preserves weekly safety frequency',()=>{
  const ui=read('clinical-ui.js'),legacy=read('app-v2.js');
  assert.match(ui,/1週間に行う日数/);
  assert.match(legacy,/id="\$\{prefix\}-weekly-days"/);
  assert.doesNotMatch(legacy,/曜日指定なし/);
  assert.match(ui,/const el=\$\('cr-'\+key\);\s*if\(!el\)continue;/);
  const dose=R.prescription({...R.doseDraft('P20'),mode:'simple'});
  assert.equal(dose.frequency,'1日1回・週7日');
  assert.doesNotMatch(dose.frequency,/月曜|火曜|水曜|木曜|金曜|土曜|日曜/);
});
