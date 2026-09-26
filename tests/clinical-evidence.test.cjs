const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function setup(){
  const c=vm.createContext({URL,requireStaff:()=>false,modal:()=>{throw Error('Locked viewer opened');}});
  for(const f of ['exercises.js','disease-library.js','clinical-catalog.js','clinical-evidence.js','exercise-evidence.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);
  vm.runInContext('globalThis.refs=ClinicalEvidence;globalThis.catalog=ClinicalCatalog;globalThis.viewer=ExerciseEvidence;',c);
  return c;
}
test('all 121 selectable definitions have explicitly classified references and render without mutation',()=>{
  const c=setup(),defs=Object.values(c.catalog.definitions).filter(d=>d.status!=='retired');
  assert.equal(defs.length,121);
  for(const d of defs){
    const ex={exerciseKey:d.key,prescription:{repetitions:'個別指示'}},before=JSON.stringify(ex),result=c.refs.lookup(ex);
    assert.ok(result.entry&&result.source,d.id);
    assert.ok(['method','background'].includes(result.entry.kind),d.id);
    const html=c.viewer.html(ex,'knee');
    assert.ok(html.includes(d.name)&&html.includes(result.source.title),d.id);
    assert.ok(html.includes(result.source.url.replaceAll('&','&amp;')),d.id);
    assert.ok(!html.includes('この独自種目')&&!html.includes('undefined'),d.id);
    assert.equal(html.includes('直接裏付ける文献は未確認'),result.entry.kind==='background',d.id);
    assert.equal(JSON.stringify(ex),before);
  }
  for(const id of Object.keys(c.refs.entries))assert.ok(c.catalog.definitions[id],id);
});
test('saved category wins over stale global template; mismatches never inherit guidelines',()=>{
  const c=setup();
  const html=(key,categoryId,template='knee')=>c.viewer.html({exerciseKey:key,clinicalV02:{categoryId}},template);
  assert.ok(html('v02_K04','G03','shoulder').includes('NG226'));
  assert.ok(!html('v02_K04','G14').includes('NG226'));
  assert.ok(!html('v02_S01','G07','shoulder').includes('Adhesive Capsulitis'));
  assert.ok(!html('v02_S01','G03').includes('NG226'));
  assert.ok(!html('v02_S01','unknown','shoulder').includes('Adhesive Capsulitis'));
  assert.ok(html('v02_S01','G01').includes('Adhesive Capsulitis'));
});
test('every category assignment resolves without old-key inference',()=>{
  const c=setup();
  for(const category of Object.values(c.catalog.categories))for(const ids of Object.values(category.levels))for(const id of ids){
    const ex={exerciseKey:c.catalog.definitions[id].key,clinicalV02:{categoryId:category.id}};
    assert.equal(c.refs.category(ex)?.id,category.id);
    assert.ok(c.viewer.html(ex,'unrelated').includes(category.name));
  }
  assert.equal(c.refs.lookup({exerciseKey:'S01'}),null);
  assert.equal(c.refs.lookup({exerciseKey:'v02_unknown'}),null);
  assert.match(c.viewer.html({exerciseKey:'v02_unknown'}),/読み込めません/);
});
test('new sources are escaped, HTTPS-only, and all entry points remain staff gated',()=>{
  const c=setup();
  c.showClinicalEvidence('S01','G01');c.showExerciseEvidence({exerciseKey:'v02_S01'},'G01');
  for(const s of Object.values(c.refs.sources))assert.equal(new URL(s.url).protocol,'https:');
  c.refs.sources.shoulder.url='javascript:alert(1)';c.refs.sources.shoulder.title='<script>alert(1)</script>';
  const html=c.viewer.html({exerciseKey:'v02_S01'});
  assert.ok(!html.includes('javascript:')&&!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});
test('new reference index loads before viewer and is available offline',()=>{
  const page=fs.readFileSync(path.join(root,'index.html'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  assert.ok(page.indexOf('src="clinical-evidence.js"')<page.indexOf('src="exercise-evidence.js"'));
  assert.ok(sw.includes("'./clinical-evidence.js'"));
});
