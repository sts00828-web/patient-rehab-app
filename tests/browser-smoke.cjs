/* No npm dependencies. Runs an isolated, hidden Chrome profile against localhost. */
const fs=require('fs'),path=require('path'),http=require('http'),{spawn}=require('child_process'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),art=path.join(root,'.test-artifacts');fs.mkdirSync(art,{recursive:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.json':'application/json'};
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost'),p=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(p,(err,data)=>{if(err){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','Cache-Control':'no-cache'}).end(data);});});
let browser,ws;
async function main(){
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
  const profile=fs.mkdtempSync(path.join(art,'chrome-'));
  browser=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
  let spawnError;browser.on('error',e=>spawnError=e);
  const portFile=path.join(profile,'DevToolsActivePort');
  for(let i=0;i<100&&!fs.existsSync(portFile);i++){if(spawnError)throw spawnError;await delay(100);}
  if(!fs.existsSync(portFile))throw Error('Chrome did not start');
  const port=fs.readFileSync(portFile,'utf8').split('\n')[0];const targets=await (await fetch('http://127.0.0.1:'+port+'/json')).json();
  ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
  let seq=0;const pending=new Map(),errors=[];
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const pair=pending.get(m.id);if(pair){clearTimeout(pair.timer);pending.delete(m.id);m.error?pair.reject(Error(JSON.stringify(m.error))):pair.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text+': '+m.params.exceptionDetails.exception?.description);};
  function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},20000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
  async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
  async function check(label,expression){assert.equal(await evaluate(expression),true,label);console.log('PASS '+label);}
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send('Page.navigate',{url:origin+'/'});
  for(let i=0;i<100;i++){if(await evaluate("typeof RehabCore !== 'undefined' && typeof activeDay !== 'undefined' && document.readyState === 'complete'"))break;await delay(100);}
  await check('first launch and local vendor dependencies',"typeof LZString==='object' && typeof qrcode==='function' && typeof Html5Qrcode==='function' && !storageBlocked");
  await check('cancel pending camera startup stops it before reopening',`(async()=>{
    const Original=Html5Qrcode;let resolveStart,created=0,stopped=0,cleared=0;
    Html5Qrcode=class {constructor(){created++}start(){return new Promise(r=>resolveStart=r)}stop(){stopped++;return Promise.resolve()}clear(){cleared++}};
    try {
      startQrScan();await Promise.resolve();const closing=stopQrScan();startQrScan();
      const pending=created===1&&stopped===0&&!!$('qr-reader');
      resolveStart();await closing;
      return pending&&stopped===1&&cleared===1&&__qrScanner===null&&!$('qrScanModal');
    }finally{Html5Qrcode=Original}
  })()`);
  await check('camera denial closes cleanly and allows retry',`(async()=>{
    const Original=Html5Qrcode;
    Html5Qrcode=class {start(){return Promise.reject(Error('test permission denied'))}clear(){}};
    try {startQrScan();await __qrScanner.ready;const shown=$('qr-reader-status').textContent.includes('test permission denied');await stopQrScan();return shown&&__qrScanner===null&&!$('qrScanModal')}
    finally{Html5Qrcode=Original}
  })()`);
  await evaluate("window.confirm=()=>true;window.prompt=()=> 'テスト患者';window.alert=message=>{window.lastAlert=message};$('pin-input').value='';checkPin();updS('patientName','テスト患者');applyTemplate('shoulder');");
  await send('Emulation.setDeviceMetricsOverride',{width:320,height:700,deviceScaleFactor:1,mobile:true});
  await evaluate("$('chooseTemplate').remove();$('next-visit').value='2026-10-08';document.documentElement.style.setProperty('--top-inset','47px');$('hdr-name').textContent='表示名が長い患者さんのスマホ表示確認';");
  await check('date inputs fit therapist modal on narrow phone',"(()=>{const modal=$('therapistModal').querySelector('.t-modal').getBoundingClientRect();return ['start-date','next-visit'].every(id=>{const r=$(id).getBoundingClientRect();return r.left>=modal.left+12&&r.right<=modal.right-12})})()");
  await check('header and modal respect top inset and wrap long name',"(()=>{const name=$('hdr-name').getBoundingClientRect(),day=$('hdr-day').getBoundingClientRect(),title=$('hdr-title').getBoundingClientRect(),modal=$('therapistModal').querySelector('.t-modal').getBoundingClientRect();return title.top>=47&&modal.top>=47&&name.right<=day.left-4&&document.querySelector('.header').scrollWidth<=320})()");
  await check('visible date tracks saved value and can be cleared',"(()=>{$('next-visit').dispatchEvent(new Event('change',{bubbles:true}));const saved=S.nextVisit==='2026-10-08'&&JSON.parse(localStorage.getItem('rehab_v2')).settings.nextVisit==='2026-10-08'&&$('next-visit-display').textContent==='2026 / 10 / 08';clearNextVisit();const cleared=S.nextVisit===''&&$('next-visit').value===''&&$('next-visit-display').textContent==='日付を選択';$('next-visit').value='2026-10-08';$('next-visit').dispatchEvent(new Event('change',{bubbles:true}));return saved&&cleared})()");
  await check('oversized native date widget cannot enlarge visible field',"(()=>{const input=$('next-visit'),frame=input.parentElement,display=$('next-visit-display');input.style.minWidth='400px';const a=frame.getBoundingClientRect(),b=display.getBoundingClientRect();const ok=getComputedStyle(input).opacity==='0'&&getComputedStyle(frame).overflow==='hidden'&&b.right<=a.right-12&&a.right<320&&$('therapistModal').scrollWidth<=320;input.style.minWidth='';return ok})()");
  await check('tapping displayed date reaches enabled native picker',"(async()=>{$('next-visit').scrollIntoView({block:'center',behavior:'instant'});await new Promise(r=>requestAnimationFrame(r));const input=$('next-visit'),r=input.getBoundingClientRect();return !input.disabled&&input.type==='date'&&!!input.labels.length&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)===input})()");
  const dateShot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'therapist-dates-mobile.png'),Buffer.from(dateShot.data,'base64'));
  await evaluate("document.documentElement.style.removeProperty('--top-inset');renderHeader();applyTemplate('shoulder');");
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await check('ten shoulder choices with no automatic selection',"document.querySelectorAll('#chooseTemplate img').length===10 && !document.querySelector('#chooseTemplate input:checked')");
  await check('purpose filter preserves selected exercise and dose',"(()=>{$('pick-0').checked=true;$('dose-0').value='5回';$('template-purpose').value='strength';filterTemplateExercises();return document.querySelectorAll('.template-ex:not([hidden])').length===4&&$('pick-0').checked&&$('dose-0').value==='5回'&&$('template-selection').textContent.includes('非表示 1種目')})()");
  await check('difficulty and search filters can combine',"(()=>{$('template-level').value='発展';$('template-search').value='ゴム';filterTemplateExercises();return document.querySelectorAll('.template-ex:not([hidden])').length===1&&document.querySelector('.template-ex:not([hidden])').textContent.includes('ゴムバンド')})()");
  await check('empty filter gives visible feedback',"(()=>{$('template-search').value='存在しない種目';filterTemplateExercises();return !document.querySelector('.exercise-group:not([hidden])')&&$('template-results').textContent.includes('該当する種目がありません')})()");
  await evaluate("$('template-purpose').value='';$('template-level').value='';$('template-search').value='';filterTemplateExercises();previewTemplateExercise(9);");
  await check('new exercise preview preserves selection screen',"!!$('chooseTemplate')&&$('guideModal').textContent.includes('ゴムバンド')&&$('guideModal').textContent.includes('固定')");
  await check('Escape closes preview without losing prescription draft',"(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));return !$('guideModal')&&!!$('chooseTemplate')&&$('pick-0').checked&&$('dose-0').value==='5回'})()");
  await evaluate("$('pick-9').checked=true;window.menuBeforeDoseCheck=JSON.stringify(S.menu);applySelectedTemplate();");
  await check('selected new exercise needs explicit dosage',"!!$('chooseTemplate')&&JSON.stringify(S.menu)===menuBeforeDoseCheck");
  await evaluate("$('pick-9').checked=false;updateTemplateSelection();");
  await evaluate("for(let i=0;i<3;i++){$('pick-'+i).checked=true;$('dose-'+i).value='PT確認用：5回';}applySelectedTemplate();closeTherapist();");
  await check('three illustrated daily exercises',"document.querySelectorAll('.exercise-card').length===3 && S.menu.every(x=>x.exerciseKey)");
  await check('unrecorded pain explicit',"$('pain-value').textContent==='未記録'");
  await evaluate("setExerciseStatus(0,'done');setExerciseStatus(1,'done');setExerciseStatus(2,'done');saveVas(0);saveNote('保存の確認');");
  await check('first-day weekly total and zero pain',"weekly().pct===100 && getLog(todayKey()).vas===0");
  await check('notes persisted',"JSON.parse(localStorage.getItem('rehab_v2')).logs[todayKey()].note==='保存の確認'");
  await check('no horizontal overflow at 390px',"document.documentElement.scrollWidth<=390");
  await check('last daily action scrolls above bottom navigation',"(async()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,document.documentElement.scrollHeight);await new Promise(r=>requestAnimationFrame(r));const buttons=$('today-content').querySelectorAll('button'),last=buttons[buttons.length-1];return last.getBoundingClientRect().bottom<=document.querySelector('.nav').getBoundingClientRect().top-12})()");
  await send('Emulation.setDeviceMetricsOverride',{width:360,height:640,deviceScaleFactor:1,mobile:true});
  await evaluate("document.documentElement.style.setProperty('--bottom-inset','34px')");
  for(const [tab,id] of [['today','today-content'],['cal','cal-content'],['prog','prog-content']]){
    await check(tab+' content clears tabs on short screen with home-indicator inset',`(async()=>{switchTab('${tab}');window.scrollTo(0,document.documentElement.scrollHeight);await new Promise(r=>requestAnimationFrame(r));return $('${id}').getBoundingClientRect().bottom<=document.querySelector('.nav').getBoundingClientRect().top-12&&document.documentElement.scrollWidth<=360})()`);
  }
  await evaluate("switchTab('today');window.scrollTo(0,document.documentElement.scrollHeight)");
  const bottomShot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'bottom-navigation-mobile.png'),Buffer.from(bottomShot.data,'base64'));
  await evaluate("document.documentElement.style.removeProperty('--bottom-inset')");
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate("window.scrollTo(0,0)");
  let shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'today-mobile.png'),Buffer.from(shot.data,'base64'));
  await evaluate('showExercise(0)');await delay(150);shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'guide-mobile.png'),Buffer.from(shot.data,'base64'));await evaluate("$('guideModal').remove()");
  await evaluate("$('pin-input').value='';checkPin();applyTemplate('knee');for(let i=0;i<3;i++){$('pick-'+i).checked=true;$('dose-'+i).value='PT確認用：5回';}applySelectedTemplate();");
  await check('recorded start date stays disabled in new date control',"$('start-date').disabled&&$('start-date').parentElement.classList.contains('is-disabled')");
  await check('same-day logged prescription unchanged',"getCompletion(todayKey(),new Date().getDay()).pct===100 && todayExercises(new Date().getDay())[0].exerciseKey==='pendulum'");
  await check('next-day prescription updated',"C.menuAt(S,L,dk(addDays(new Date(),1)),addDays(new Date(),1).getDay())[0].exerciseKey==='heel-slide'");
  await evaluate("showShareQR();");await check('QR generated',"!!document.querySelector('#qrBox svg')");await evaluate('closeQR()');
  await check('share excludes identifying profile and PIN',"(()=>{const u=buildShareUrl(),p=JSON.parse(LZString.decompressFromEncodedURIComponent(decodeURIComponent(u.split('#d=')[1])));return !u.includes('?d=')&&!('passcode' in p)&&!('patientName' in p)&&!('diagnosis' in p)&&!('age' in p);})()");
  await evaluate("window.oldId=S.patientId;window.sameUrl=buildShareUrl();closeTherapist();manualImport(sameUrl);");
  await check('same-patient QR preserves logs',"S.patientId===oldId && getLog(todayKey()).vas===0");
  await evaluate("const foreign={version:2,patientId:'another_patient',startDate:todayKey(),menu:[{id:'other',name:'別の運動',params:'確認用',dows:[]}]};manualImport(location.origin+'/#d='+encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify(foreign))));");
  await check('different patient isolated and old patient archived',"S.patientId==='another_patient' && Object.keys(L).length===0 && archives.some(a=>a.settings.patientId===oldId&&a.logs[todayKey()].vas===0)");
  await evaluate("S.patientName='<img src=x onerror=alert(1)>';persist();renderToday();");
  await check('patient name escaped',"!document.querySelector('.banner img')");
  await evaluate("calDate=new Date(2026,0,31);calNav(1)");await check('month end navigation',"calDate.getMonth()===1");
  await check('all thirty images load',"(async()=>{const results=await Promise.all(Object.values(EXERCISE_LIBRARY).map(async e=>{const r=await fetch('assets/exercises/'+e.image);return r.ok&&(await r.blob()).size>1000}));return results.length===30&&results.every(Boolean)})()");
  await evaluate("$('pin-input').value='';checkPin();applyTemplate('lowback');");
  await check('ten low-back illustrations and mobile layout',"document.querySelectorAll('#chooseTemplate img').length===10&&document.documentElement.scrollWidth<=390");
  await check('prescription action follows last exercise without covering it',"(()=>{const rows=$('chooseTemplate').querySelectorAll('.template-ex'),last=rows[rows.length-1],actions=$('chooseTemplate').querySelector('.template-actions');return getComputedStyle(actions).position==='static'&&last.getBoundingClientRect().bottom<=actions.getBoundingClientRect().top})()");
  shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'library-mobile.png'),Buffer.from(shot.data,'base64'));
  await evaluate("for(let i=0;i<10;i++){$('pick-'+i).checked=true;$('dose-'+i).value='PT確認用：左右各5回';}applySelectedTemplate();showShareQR();");
  await check('ten-exercise prescription generates and round-trips QR',"(()=>{const p=JSON.parse(LZString.decompressFromEncodedURIComponent(decodeURIComponent(buildShareUrl().split('#d=')[1])));return S.menu.length===10&&p.menu.length===10&&p.menu.some(e=>e.exerciseKey==='walking')&&!!document.querySelector('#qrBox svg')})()");
  await evaluate("closeQR();closeTherapist();");
  await check('failed writes roll back in-memory changes',"(()=>{const before=S.patientName,original=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('simulated quota failure')};try{S.patientName='not saved';persist()}catch{}finally{Storage.prototype.setItem=original}return S.patientName===before})()");
  await check('malformed import cannot overwrite state',"(()=>{const before=JSON.stringify(packState());manualImport(location.origin+'/#d='+encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify({menu:[{name:'Bad',dows:[9]}]}))));history.replaceState(null,'',location.pathname);return JSON.stringify(packState())===before})()");
  await evaluate("S.patientName='テスト患者B';persist();navigator.serviceWorker.ready.then(()=>true)");
  for(let i=0;i<100;i++){if(await evaluate('!!navigator.serviceWorker.controller'))break;await delay(100);}
  await check('service worker controls page',"!!navigator.serviceWorker.controller");
  await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await send('Page.reload');await delay(1200);
  await check('offline reload retains patient and QR library',"typeof C !== 'undefined' && S.patientId==='another_patient' && typeof LZString==='object' && !storageBlocked");
  await check('illustrations available offline',"(async()=>{const r=await fetch('assets/exercises/pendulum.png');return r.ok&&(await r.blob()).size>1000})()");
  await check('all new illustrations available offline',"(async()=>{const r=await Promise.all(Object.values(EXERCISE_LIBRARY).map(async e=>(await fetch('assets/exercises/'+e.image)).ok));return r.length===30&&r.every(Boolean)})()");
  await check('legacy migration preserves raw backup and marks unknown history',"(()=>{localStorage.removeItem('rehab_v2');const old={patientName:'Legacy test',startDate:'2026-01-01',menu:[{id:'new',name:'New exercise',dows:[]}]};const logs={'2026-01-02':{done:{removed_exercise:true},vas:4,note:'keep'}};localStorage.setItem('rehab_settings',JSON.stringify(old));localStorage.setItem('rehab_logs',JSON.stringify(logs));S=null;L={};T={};archives=[];committed=null;loadState();return L['2026-01-02'].legacyUnknown&&L['2026-01-02'].vas===4&&JSON.parse(localStorage.getItem('rehab_legacy_backup')).logs===JSON.stringify(logs)})()");
  assert.deepEqual(errors,[],'browser runtime errors');
  await send('Browser.close').catch(()=>{});console.log('Browser smoke complete. Screenshots: .test-artifacts/');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{ws?.close();if(browser?.pid)browser.kill();server.close();});
