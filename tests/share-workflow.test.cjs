const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),{test}=require('node:test');
function app(){
 const nodes=new Map(),storage=new Map();
 const ctx=vm.createContext({console,URL,Date,crypto:require('node:crypto').webcrypto,setInterval(){},setTimeout(){},clearTimeout(){},MutationObserver:class{observe(){}},alert(message){ctx.lastAlert=message},confirm(){return true},prompt(){return '端末の呼び名'},navigator:{},location:{origin:'https://patient-rehab-app.vercel.app',pathname:'/',hash:'',search:''},addEventListener(){},
 document:{addEventListener(){},createElement(){return {innerHTML:'',firstChild:{}}},body:{appendChild(){}},getElementById(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',remove(){nodes.delete(id)},classList:{add(){},remove(){},contains(){return false}}});return nodes.get(id)}},localStorage:{getItem(k){return storage.get(k)||null},setItem(k,v){storage.set(k,v)}}});
 ctx.window=ctx;ctx.history={replaceState(a,b,url){ctx.location.hash=new URL(url,ctx.location.origin).hash;}};
 for(const file of ['clinical-catalog.js','clinical-rules.js','core.js','vendor/lz-string.min.js','vendor/qrcode.min.js','ui.js','exercises.js','disease-library.js','app-v2.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx,{filename:file});
 const run=s=>vm.runInContext(s,ctx);
 run(`S=C.settings({patientId:'share_patient',startDate:todayKey(),menu:[{id:'exercise',name:'テスト種目',dows:[],scheduleConfirmed:true,prescription:{side:'左',repetitions:'5回',sets:'1セット',hold:'なし',frequency:'1日1回',load:'なし',support:'椅子'}}]},'fallback',todayKey());L={};staffUnlocked=true;persist();`);
 return {ctx,run,nodes};
}
test('real URL import functions preserve same-patient history and separate a different patient',()=>{
 const a=app();a.run(`writableLog().status.exercise='done';persist();var beforeLogs=JSON.stringify(L);var incoming=C.clone(buildSharePayload());incoming.menu[0].note='更新した注意';var share=buildShareUrl();`);
 for(const version of [undefined,2,3]){
  a.run(`var raw=${version===3?'C.encodeShare(incoming)':'C.clone(incoming)'};${version===undefined?'delete raw.version;':''}location.hash='#d='+encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify(raw)));`);
  assert.equal(a.run('handleImportFromHash()'),true);
  assert.equal(a.run('JSON.stringify(L)===beforeLogs'),true);assert.equal(a.run('S.menu[0].note'),'更新した注意');
 }
 a.run(`incoming.patientId='different_patient';location.hash='#d='+encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify(C.encodeShare(incoming))));`);
 assert.equal(a.run('handleImportFromHash()'),true);assert.equal(a.run('Object.keys(L).length'),0);
 assert.equal(a.run('archives.at(-1).settings.patientId'),'share_patient');assert.equal(a.run('JSON.stringify(archives.at(-1).logs)===beforeLogs'),true);
});
test('actual QR overflow becomes ordered split QR without truncating the copyable URL',()=>{
 const a=app();a.ctx.longText=require('node:crypto').randomBytes(240).toString('hex');
 a.run(`S.menu=Array.from({length:30},(_,i)=>({...C.clone(S.menu[0]),id:'ex'+i,note:longText+i}));`);
 // Use independent text per item to exceed the real library capacity.
 a.ctx.notes=Array.from({length:30},()=>require('node:crypto').randomBytes(240).toString('hex'));
 a.run(`S.menu.forEach((ex,i)=>ex.note=notes[i]);var fullUrl=buildShareUrl();showShareQR();`);
 assert.match(a.nodes.get('qrBox').innerHTML,/分割QR 1/);assert.doesNotMatch(a.nodes.get('qrBox').innerHTML,/undefined/);
 assert.ok(a.run('shareQrParts.length>1'));
 a.run(`var collected=null;for(const partUrl of [...shareQrParts].reverse()){const part=collectSplitQrPart(partUrl);if(part.complete)collected=part.value;}`);
 assert.equal(a.run(`collected===fullUrl.split('#d=')[1]`),true);
 a.run(`var decoded=C.decodeShare(JSON.parse(LZString.decompressFromEncodedURIComponent(decodeURIComponent(fullUrl.split('#d=')[1]))));`);
 assert.equal(a.run(`JSON.stringify(decoded.menu)===JSON.stringify(C.menu(S.menu))`),true);
 a.run(`var expectedMenu=JSON.stringify(S.menu),scanParts=splitShareUrl(fullUrl);splitQrInbox={};S=null;L={};persist();renderHeader=()=>{};renderToday=()=>{};for(const partUrl of scanParts)manualImport(partUrl);`);
 assert.equal(a.run(`JSON.stringify(S.menu)===expectedMenu`),true);
 a.run(`qrcode=()=>{throw '文字列のエラー'};showShareQR()`);assert.match(a.nodes.get('qrBox').innerHTML,/文字列のエラー/);
});
