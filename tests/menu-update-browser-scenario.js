await evaluate(`window.confirm=()=>true;window.prompt=()=> '架空患者';
S=C.settings({patientId:'browser_fake',startDate:todayKey(),knownSince:todayKey(),menu:[{id:'old',name:'架空運動A',exerciseKey:'',params:'5回',note:'',dows:[]}]},'fallback',todayKey());L={};persist();writableLog().status.old='done';persist();
commitMenu([...C.clone(S.menu),{id:'local_add',name:'架空運動B',exerciseKey:'',params:'3回',note:'',dows:[]}]);renderToday();`);
await check('local add appears today and keeps the completed result',`S.menu.length===2&&todayExercises(todayDow()).length===2&&L[todayKey()].status.old==='done'`);
await send('Page.reload');
for(let i=0;i<100;i++){if(await evaluate("typeof S!=='undefined'&&S?.menu?.length===2"))break;await delay(100);}
await check('reload keeps added exercises and history',`S.menu.length===2&&L[todayKey()].status.old==='done'`);

await evaluate(`window.confirm=()=>true;window.qrMenu=[...C.clone(S.menu),{id:'qr_add',name:'架空運動C',exerciseKey:'',params:'2回',note:'',dows:[]}];
window.qrUrl=location.origin+location.pathname+'#d='+encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify({version:2,patientId:S.patientId,startDate:todayKey(),menu:qrMenu})));
manualImport(qrUrl);renderToday();`);
await check('QR add appears today without losing prior results',`S.menu.length===3&&todayExercises(todayDow()).length===3&&L[todayKey()].status.old==='done'&&location.hash.startsWith('#d=')`);
await evaluate(`manualImport(qrUrl)`);
await check('re-reading the same QR is idempotent',`S.menu.length===3&&new Set(S.menu.map(ex=>ex.id)).size===3&&L[todayKey()].status.old==='done'`);

await evaluate(`window.confirm=()=>true;window.prompt=()=> '架空患者';writableLog().vas=2;writableLog().note='架空の当日メモ';L['2000-01-01']={done:{past:true},status:{past:'done'},vas:0,note:'架空の過去メモ',menuSnapshot:C.menu([{id:'past',name:'過去の架空運動',params:'4回',dows:[]}])};persist();
localStorage.setItem('qaSavedBeforeOldQr',localStorage.getItem(STORE_KEY));localStorage.setItem('qaOldQr',location.origin+location.pathname+'#d='+encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify({version:2,patientId:S.patientId,startDate:todayKey(),menu:S.menu.slice(0,1)}))));`);
const oldQrUrl=await evaluate("localStorage.getItem('qaOldQr')");
await send('Page.addScriptToEvaluateOnNewDocument',{source:"window.confirm=()=>true;window.prompt=()=> '架空患者';"});
await send('Page.navigate',{url:'about:blank'});await delay(100);await send('Page.navigate',{url:oldQrUrl});
for(let i=0;i<100;i++){if(await evaluate("typeof S!=='undefined'&&document.readyState==='complete'&&!!document.getElementById('receiveModal')"))break;await delay(100);}
await check('old QR navigation retains the exact saved state and requests explicit update',`S.menu.length===3&&localStorage.getItem(STORE_KEY)===localStorage.getItem('qaSavedBeforeOldQr')&&!!$('receiveModal')&&$('receiveModal').textContent.includes('まだ反映していません')`);
for(const width of [320,390]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
  await check('pending URL choices fit the '+width+'px screen',`[...document.querySelectorAll('#receiveModal button')].every(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth})&&document.documentElement.scrollWidth<=innerWidth`);
  const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'pending-url-'+width+'.png'),Buffer.from(shot.data,'base64'));
}
await evaluate(`document.querySelector('#receiveModal [onclick="keepSavedMenu()"]')?.click()`);
await check('keeping saved menu closes the received URL without writing storage',`!$('receiveModal')&&location.hash===''&&S.menu.length===3&&localStorage.getItem(STORE_KEY)===localStorage.getItem('qaSavedBeforeOldQr')`);
await send('Page.reload');for(let i=0;i<100;i++){if(await evaluate("typeof S!=='undefined'&&S?.menu?.length===3&&document.readyState==='complete'"))break;await delay(100);}
await check('reload after old QR keeps additions, past day, pain, note and completion',`S.menu.length===3&&L[todayKey()].status.old==='done'&&L[todayKey()].vas===2&&L[todayKey()].note==='架空の当日メモ'&&L['2000-01-01'].status.past==='done'&&L['2000-01-01'].vas===0`);

await evaluate(`localStorage.setItem('qaUpdateUrl',location.origin+location.pathname+'#d='+encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify({version:2,patientId:S.patientId,startDate:todayKey(),menu:[...C.clone(S.menu),{id:'explicit_add',name:'明示更新の架空運動',params:'1回',dows:[]}]}))));`);
const updateUrl=await evaluate("localStorage.getItem('qaUpdateUrl')");
await send('Page.navigate',{url:'about:blank'});await delay(100);await send('Page.navigate',{url:updateUrl});
for(let i=0;i<100;i++){if(await evaluate("typeof S!=='undefined'&&document.readyState==='complete'&&!!document.getElementById('receiveModal')"))break;await delay(100);}
await check('new direct URL is held until its update button is pressed',`S.menu.length===3&&!!$('receiveModal')&&localStorage.getItem(STORE_KEY)===localStorage.getItem('qaSavedBeforeOldQr')`);
await evaluate(`document.querySelector('#receiveModal [onclick^="manualImport"]')?.click()`);
await check('explicit URL update displays the added exercise and retains old records',`!$('receiveModal')&&S.menu.length===4&&todayExercises(todayDow()).length===4&&L[todayKey()].status.old==='done'&&L[todayKey()].vas===2&&L[todayKey()].note==='架空の当日メモ'&&L['2000-01-01'].status.past==='done'`);
await evaluate(`localStorage.setItem('qaAfterExplicit',localStorage.getItem(STORE_KEY));`);
await send('Page.reload');for(let i=0;i<100;i++){if(await evaluate("typeof S!=='undefined'&&S?.menu?.length===4&&document.readyState==='complete'"))break;await delay(100);}
await check('retained identical URL reload does not add a dated plan or change any saved byte',`S.menu.length===4&&localStorage.getItem(STORE_KEY)===localStorage.getItem('qaAfterExplicit')&&!$('receiveModal')`);
await evaluate(`window.qrUrl=localStorage.getItem('qaUpdateUrl');`);

await evaluate(`window.beforeMismatch=localStorage.getItem(STORE_KEY);window.confirm=()=>true;window.alert=m=>window.lastAlert=m;window.otherUrl=location.origin+location.pathname+'#d='+encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify({version:2,patientId:'other_fake',startDate:todayKey(),menu:[{id:'other',name:'別の架空運動',dows:[]}]})));manualImport(otherUrl);`);
await check('unknown patient QR is rejected without mixing records',`localStorage.getItem(STORE_KEY)===beforeMismatch&&S.menu.length===4&&L[todayKey()].status.old==='done'&&lastAlert.includes('患者識別とQRが一致しない')`);
await evaluate(`window.beforeCancel=localStorage.getItem(STORE_KEY);window.confirm=()=>false;window.cancelUrl=location.origin+location.pathname+'#d='+encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify({version:2,patientId:S.patientId,startDate:todayKey(),menu:[...C.clone(S.menu),{id:'cancelled',name:'取消する架空運動',dows:[]}]})));manualImport(cancelUrl);`);
await check('cancel leaves menu and records unchanged',`localStorage.getItem(STORE_KEY)===beforeCancel&&S.menu.length===4&&L[todayKey()].status.old==='done'`);

await check('manifest uses the installation page URL with fixed app identity',`fetch('manifest.json').then(r=>r.json()).then(m=>!('start_url' in m)&&m.id==='./'&&m.scope==='./')`);
await evaluate(`window.installUrl=qrUrl;localStorage.clear()`);
await send('Page.addScriptToEvaluateOnNewDocument',{source:"Object.defineProperty(navigator,'standalone',{value:true,configurable:true});window.confirm=()=>true;window.prompt=()=> '架空患者';"});
const installUrl=await evaluate('installUrl');
await send('Page.navigate',{url:'about:blank'});await delay(100);
await send('Page.navigate',{url:installUrl});
for(let i=0;i<100;i++){if(await evaluate("typeof S!=='undefined'&&S?.menu?.length===4"))break;await delay(100);}
await check('isolated standalone first launch imports settings and clears payload',`navigator.standalone===true&&S.menu.length===4&&location.hash===''&&!!localStorage.getItem(STORE_KEY)`);
