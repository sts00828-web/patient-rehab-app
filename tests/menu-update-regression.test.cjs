const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),{test}=require('node:test');
const root=path.resolve(__dirname,'..');

function app({storage=new Map(),standalone=false,hash='',confirmResult=true}={}){
  const nodes=new Map();
  const ctx=vm.createContext({console,URL,Date,crypto:require('node:crypto').webcrypto,
    setInterval(){},setTimeout(){},clearTimeout(){},MutationObserver:class{observe(){}},
    alert(message){ctx.lastAlert=message},confirm(){return ctx.confirmResult},prompt(){return '架空患者'},confirmResult,
    navigator:{standalone},location:{origin:'https://patient-rehab-app.vercel.app',pathname:'/',hash,search:''},addEventListener(){},
    document:{addEventListener(){},querySelector(){return null},createElement(){return {innerHTML:'',firstChild:{},setAttribute(){},querySelector(){return null}}},body:{appendChild(){}},getElementById(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',hidden:false,remove(){nodes.delete(id)},classList:{add(){},remove(){},contains(){return false}}});return nodes.get(id)}},
    localStorage:{getItem(k){return storage.get(k)||null},setItem(k,v){storage.set(k,v)}}});
  ctx.window=ctx;
  ctx.history={replaceState(a,b,url){const next=new URL(url,ctx.location.origin);ctx.location.pathname=next.pathname;ctx.location.search=next.search;ctx.location.hash=next.hash;}};
  for(const file of ['clinical-catalog.js','clinical-rules.js','core.js','vendor/lz-string.min.js','vendor/qrcode.min.js','ui.js','exercises.js','disease-library.js','exercise-selection.js','app-v2.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
  const run=code=>vm.runInContext(code,ctx);
  return {ctx,run,storage,nodes};
}

const initial=`S=C.settings({patientId:'local_patient',startDate:todayKey(),knownSince:todayKey(),menu:[{id:'old',name:'架空運動A',exerciseKey:'',params:'5回',note:'',dows:[]}]},'fallback',todayKey());L={};persist();writableLog().status.old='done';persist();`;

function shareHash(a,patientId,menu){
  a.ctx.incoming={version:2,patientId,startDate:a.run('todayKey()'),menu};
  a.run(`location.hash='#d='+encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify(incoming)))`);
  return a.ctx.location.hash;
}

test('adding locally applies today and keeps completed records through reload',()=>{
  const a=app();a.run(initial+`renderTherapist=()=>{};var next=[...C.clone(S.menu),{id:'new',name:'架空運動B',exerciseKey:'',params:'3回',note:'',dows:[]}];commitMenu(next);`);
  assert.equal(a.run('S.menu.length'),2);
  assert.equal(a.run('L[todayKey()].menuSnapshot.length'),2);
  assert.equal(a.run("L[todayKey()].status.old"),'done');
  a.run('loadState()');
  assert.equal(a.run('S.menu.length'),2);
  assert.equal(a.run("L[todayKey()].status.old"),'done');
});

test('removing an unrecorded just-added exercise restores today without losing records',()=>{
  const a=app();a.run(initial+`renderTherapist=()=>{};var original=C.clone(S.menu);commitMenu([...original,{id:'temporary',name:'取消する架空運動',exerciseKey:'',params:'3回',note:'',dows:[]}]);commitMenu(original);`);
  assert.equal(a.run('S.menu.length'),1);assert.equal(a.run('L[todayKey()].menuSnapshot.length'),1);assert.equal(a.run("L[todayKey()].status.old"),'done');
});

test('same-patient QR addition is immediate, idempotent and retains history',()=>{
  const a=app();a.run(initial);const menu=a.run(`[...C.clone(S.menu),{id:'new',name:'架空運動B',exerciseKey:'',params:'3回',note:'',dows:[]}]`);
  const hash=shareHash(a,'local_patient',menu);
  assert.equal(a.run('handleImportFromHash()'),true);
  assert.equal(a.run('S.menu.length'),2);assert.equal(a.run('L[todayKey()].menuSnapshot.length'),2);assert.equal(a.run("L[todayKey()].status.old"),'done');
  a.ctx.location.hash=hash;
  assert.equal(a.run('handleImportFromHash()'),true);
  assert.equal(a.run('S.menu.length'),2);assert.equal(a.run("L[todayKey()].status.old"),'done');
});

test('unknown QR identity is rejected without touching local patient records',()=>{
  const a=app();a.run(initial);const before=a.run('JSON.stringify(L)');
  const menu=a.run(`[{...C.clone(S.menu[0]),id:'remote_old'},{id:'remote_new',name:'架空運動B',exerciseKey:'',params:'3回',note:'',dows:[]}]`);
  shareHash(a,'regenerated_remote_patient',menu);
  assert.equal(a.run('handleImportFromHash()'),false);
  assert.equal(a.run('S.patientId'),'local_patient');
  assert.equal(a.run('S.menu.length'),1);
  assert.equal(a.run("L[todayKey()].status.old"),'done');
  assert.equal(a.run('JSON.stringify(L)'),before);
  assert.match(a.ctx.lastAlert,/患者識別とQRが一致しない/);
});

test('cancelled QR import changes neither menu nor records',()=>{
  const a=app({confirmResult:false});a.run(initial);const before=a.storage.get('rehab_v2');
  const menu=a.run(`[{id:'replacement',name:'別の架空運動',exerciseKey:'',params:'1回',note:'',dows:[]}]`);
  shareHash(a,'other_patient',menu);
  assert.equal(a.run('handleImportFromHash()'),false);
  assert.equal(a.storage.get('rehab_v2'),before);
  assert.equal(a.ctx.location.hash,'');
});

test('Safari share URL survives installation and imports into isolated standalone storage',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  assert.equal('start_url' in manifest,false);assert.equal(manifest.id,'./');assert.equal(manifest.scope,'./');
  const safari=app();
  const menu=[{id:'installed',name:'架空運動',exerciseKey:'',params:'5回',note:'',dows:[]}];
  const hash=shareHash(safari,'install_patient',menu);
  assert.equal(safari.run('handleImportFromHash()'),true);
  assert.equal(safari.ctx.location.hash,hash,'browser URL must retain the payload until Add to Home Screen');
  const installed=app({standalone:true,hash,storage:new Map()});
  assert.equal(installed.run('handleImportFromHash()'),true);
  assert.equal(installed.run('S.menu.length'),1);
  assert.equal(installed.ctx.location.hash,'','standalone clears the payload after durable storage');
  installed.run('loadState()');assert.equal(installed.run('S.menu[0].name'),'架空運動');
});

test('opening an old QR URL never rolls back a later addition or writes saved records',()=>{
  const a=app();a.run(initial);const oldMenu=a.run('C.clone(S.menu)');
  a.run(`renderTherapist=()=>{};commitMenu([...C.clone(S.menu),{id:'later',name:'追加した架空運動',params:'3回',dows:[]}]);`);
  const before=a.storage.get('rehab_v2');shareHash(a,'local_patient',oldMenu);
  assert.equal(a.run('handleImportFromHash(true)'),false,'different URL must wait for explicit import');
  assert.equal(a.storage.get('rehab_v2'),before,'initial navigation must not persist anything');
  assert.equal(a.run('S.menu.length'),2);assert.equal(a.run("L[todayKey()].status.old"),'done');
  assert.match(a.nodes.get('update-url').value,/#d=/);
  a.run('keepSavedMenu()');
  assert.equal(a.ctx.location.hash,'');assert.equal(a.storage.get('rehab_v2'),before);
  a.run('loadState()');assert.equal(a.run('S.menu.length'),2);
});

test('automatic same-menu URL reload is a no-op for plans, revisions and storage',()=>{
  const a=app();a.run(initial);const before=a.storage.get('rehab_v2');
  shareHash(a,'local_patient',a.run('C.clone(S.menu)'));
  assert.equal(a.run('handleImportFromHash(true)'),true);
  assert.equal(a.storage.get('rehab_v2'),before);
});

test('an updated URL can be explicitly accepted after safe initial navigation',()=>{
  const a=app();a.run(initial);const before=a.storage.get('rehab_v2');
  shareHash(a,'local_patient',a.run(`[...C.clone(S.menu),{id:'new_url',name:'更新QRの架空運動',params:'2回',dows:[]}]`));
  assert.equal(a.run('handleImportFromHash(true)'),false);
  assert.equal(a.storage.get('rehab_v2'),before);
  assert.equal(a.run('handleImportFromHash()'),true);
  assert.equal(a.run('S.menu.length'),2);assert.equal(a.run('L[todayKey()].menuSnapshot.length'),2);
  assert.equal(a.run("L[todayKey()].status.old"),'done');
});

test('failed explicit QR save restores settings and logs without touching saved bytes',()=>{
  const a=app();a.run(initial);const before=a.storage.get('rehab_v2');
  shareHash(a,'local_patient',a.run(`[...C.clone(S.menu),{id:'not_saved',name:'保存失敗の架空運動',params:'2回',dows:[]}]`));
  a.ctx.localStorage.setItem=()=>{throw Error('simulated quota failure')};
  assert.equal(a.run('handleImportFromHash()'),false);
  assert.equal(a.storage.get('rehab_v2'),before);assert.equal(a.run('S.menu.length'),1);
  assert.equal(a.run("L[todayKey()].status.old"),'done');
});

test('same-menu URL with changed visit or safety instructions waits for explicit acceptance',()=>{
  const a=app();a.run(initial);const before=a.storage.get('rehab_v2');
  shareHash(a,'local_patient',a.run('C.clone(S.menu)'));
  a.ctx.incoming.nextVisit='2027-01-05';a.ctx.incoming.consultContact='架空の更新窓口';
  a.run(`location.hash='#d='+encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify(incoming)))`);
  assert.equal(a.run('handleImportFromHash(true)'),false);
  assert.equal(a.storage.get('rehab_v2'),before);
  assert.equal(a.run('handleImportFromHash()'),true);
  assert.equal(a.run('S.nextVisit'),'2027-01-05');assert.equal(a.run('S.consultContact'),'架空の更新窓口');
  assert.equal(a.run("L[todayKey()].status.old"),'done');
});

test('selecting an unchanged saved exercise alongside a new one applies the addition today',()=>{
  const a=app();vm.runInContext(fs.readFileSync(process.env.PATIENT_REHAB_UI_FILE||path.join(root,'clinical-ui.js'),'utf8'),a.ctx,{filename:'clinical-ui.js'});
  a.run(`renderTherapist=()=>{};S=C.settings({patientId:'batch_synthetic',affectedSide:'bilateral',startDate:todayKey(),menu:[]},'fallback',todayKey());L={};persist();
    var first=newClinicalCandidate('P31','A12');first.selected=true;clinicalBatch={patientId:S.patientId,items:{P31:first}};commitMenu(prepareClinicalBatch());
    writableLog().status[S.menu[0].id]='done';persist();var originalItem=C.clone(S.menu[0]),originalLog=C.clone(L[todayKey()]);
    var saved=newClinicalCandidate('P31','A12'),added=newClinicalCandidate('P32','A12');saved.selected=true;added.selected=true;
    clinicalBatch={patientId:S.patientId,items:{P31:saved,P32:added}};commitMenu(prepareClinicalBatch());`);
  assert.equal(a.run('todayExercises(todayDow()).length'),2);
  assert.equal(a.run('JSON.stringify(S.menu.find(x=>x.id===originalItem.id))===JSON.stringify(originalItem)'),true,'unchanged selection must keep its revision');
  assert.equal(a.run('L[todayKey()].status[originalItem.id]'),'done');
  assert.equal(a.run('JSON.stringify(L[todayKey()].menuRevisions[0].status)===JSON.stringify(originalLog.status)'),true);
});
