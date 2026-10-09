'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),R=require('../clinical-rules.js'),C=require('../core.js'),catalog=require('../clinical-catalog.js'),ids=['P27','P28','P29','P30','P41'],clone=x=>JSON.parse(JSON.stringify(x));
const retired=ids.map(id=>({id:'synthetic-'+id,exerciseKey:'v02_'+id,name:catalog.definitions[id].name,dows:[],scheduleMode:'flexible',prescription:{repetitions:'1回',sets:'1セット'},clinicalV02:{revision:'keep-'+id,side:'right',amountBasis:'per_side',patient:{patientId:'synthetic-retired'}}}));
test('old stable IDs remain reserved while new prescriptions, images and procedure steps are unavailable',()=>{
  for(const ex of retired){const d=R.definition(ex);assert.equal(d.key,ex.exerciseKey);assert.equal(d.status,'retired');assert.equal(R.isSelectable(d.id),false);assert.equal(R.doseDraft(d.id),null);assert.equal(R.imagePath(ex,true),null);assert.deepEqual(d.steps,[]);assert.throws(()=>R.assertPrescribable([ex],'synthetic-retired'),/提供.*終了/);}
});
test('no clinical category or difficulty exposes retired tapes, and A15 ankle exercise is still selectable',()=>{
  assert.equal(catalog.categories.A15,undefined);assert.equal(R.isSelectable('A15'),true);assert(catalog.definitions.A15.image);
  for(const c of Object.values(catalog.categories))for(const list of Object.values(c.levels))assert(!list.some(id=>ids.includes(id)));
});
test('display filtering does not mutate stored menus or accidentally hide known ordinary/custom keys',()=>{
  const ordinary={id:'synthetic-normal',exerciseKey:'v02_A15',name:retired[0].name},custom={id:'synthetic-custom',exerciseKey:'custom-taping',name:retired[0].name};
  const all=[...retired,ordinary,custom],original=JSON.stringify(all);assert.deepEqual(R.activeItems(all),[ordinary,custom]);assert.equal(JSON.stringify(all),original);
  assert(R.isRetired({name:retired[0].name}));assert(R.isRetired({exerciseKey:'P27'}));assert.deepEqual(R.issues({name:retired[0].name}),[R.retiredMessage]);
});
test('QR decode and storage validation preserve retired item IDs, prescription revisions and past event data',()=>{
  const s=C.settings({patientId:'synthetic-retired',startDate:'2000-01-01',knownSince:'2000-01-01',menu:retired},'fallback','2026-10-09');
  const decoded=C.decodeShare(C.encodeShare({version:2,patientId:s.patientId,startDate:s.startDate,menu:s.menu}));
  assert.deepEqual(decoded.menu.map(ex=>ex.id),s.menu.map(ex=>ex.id));assert.equal(decoded.menu[0].exerciseKey,'v02_P27');
  const history={'2000-01-01':{menuSnapshot:clone(s.menu),done:{'synthetic-P27':true},status:{'synthetic-P27':'done'},vas:2,note:'架空の過去メモ',events:[{event_id:'synthetic-event',session_id:'synthetic-session',prescription_item_id:'synthetic-P27',prescription_version:'keep-P27',local_date:'2000-01-01',time_zone:'Asia/Tokyo',timestamp:'2000-01-01T10:00:00Z',status:'done',reported_reps:7,reason_optional:'架空の実施メモ',supersedes_event_id:null}]}};
  assert.deepEqual(C.logs(history),history);assert.deepEqual(C.menuAt(s,history,'2000-01-01',6),s.menu);assert.equal(C.completion(s,history,'2000-01-01',6).done,1);
});
test('adding an ordinary exercise to an old retired menu keeps every retired prescription and history',()=>{
  const s=C.settings({patientId:'synthetic-retired',startDate:'2000-01-01',knownSince:'2000-01-01',menu:retired},'fallback','2026-10-09'),old=clone(s.menu),history={'2026-10-09':{menuSnapshot:clone(old),done:{'synthetic-P27':true},status:{'synthetic-P27':'done'},vas:0,note:'keep',events:[]}};
  const next=[...clone(old),{id:'synthetic-added-normal',name:'架空の通常運動',dows:[]}];
  C.changeMenu(s,history,next,'2026-10-09','2026-10-10');C.applyMenuToday(s,history,'2026-10-09',5);
  assert.deepEqual(s.menu.slice(0,5),old);assert.equal(s.menu.length,6);assert.equal(history['2026-10-09'].status['synthetic-P27'],'done');assert.equal(history['2026-10-09'].note,'keep');assert.equal(R.activeItems(history['2026-10-09'].menuSnapshot).length,1);
});
test('new or edited retired prescriptions cannot bypass menu-update compatibility',()=>{
  const s=C.settings({patientId:'synthetic-retired',startDate:'2000-01-01',knownSince:'2000-01-01',menu:retired},'fallback','2026-10-09'),saved=JSON.stringify(s);
  const edited=clone(s.menu);edited[0].params='changed';assert.throws(()=>C.changeMenu(s,{},edited,'2026-10-09','2026-10-10'),/提供.*終了/);assert.equal(JSON.stringify(s),saved);
  const added=clone(s.menu);added.push({...clone(added[0]),id:'new-retired'});assert.throws(()=>C.changeMenu(s,{},added,'2026-10-09','2026-10-10'),/提供.*終了/);assert.equal(JSON.stringify(s),saved);
});
test('mixed print excludes retired content and keeps the correct ordinary image aligned',()=>{
  const normal={id:'synthetic-normal',name:'通常の架空運動',prescription:{repetitions:'5回',sets:'1セット'}},ctx=vm.createContext({URL,ClinicalRules:R,input:{},items:[retired[0],normal,retired[4]],media:[{image:'retired-one.webp'},{image:'normal-only.webp',steps:['通常の動作']},{image:'retired-two.webp'}]});
  vm.runInContext(fs.readFileSync(path.join(root,'exercise-print.js'),'utf8'),ctx);
  const html=vm.runInContext("RehabPrint.documentHtml(input,items,media,'https://example.test/')",ctx);assert(html.includes('normal-only.webp'));assert(html.includes('通常の動作'));assert(!html.includes('retired-one.webp'));assert(!html.includes(retired[0].name));assert(!html.includes(retired[4].name));assert.equal(ctx.items.length,3);
  ctx.items=[retired[0]];assert.throws(()=>vm.runInContext("RehabPrint.documentHtml(input,items,media,'https://example.test/')",ctx),/1〜6/);
});
test('public allowlist contains no taping runtime/illustrations and matches every remaining byte',()=>{
  const rows=JSON.parse(fs.readFileSync(path.join(root,'tools/public-files.json'))),removed=JSON.parse(fs.readFileSync(path.join(root,'tools/retired-public-files.json'))),sha=b=>crypto.createHash('sha256').update(b).digest('hex');assert.equal(removed.length,970);
  for(const row of rows){assert(!removed.includes(row.file));const b=fs.readFileSync(path.join(root,row.file));assert.equal(b.length,row.bytes);assert.equal(sha(b),row.sha256);}
  for(const file of removed)assert(!fs.existsSync(path.join(root,file)));
  assert(!/taping-(?:guide|protocol|entry|image)/.test(fs.readFileSync(path.join(root,'index.html'),'utf8')));
});
