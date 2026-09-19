/* No npm dependencies. Runs an isolated, hidden Chrome profile against localhost. */
const fs=require('fs'),path=require('path'),os=require('os'),http=require('http'),{spawn}=require('child_process'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),art=path.join(root,'.test-artifacts');fs.mkdirSync(art,{recursive:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.json':'application/json'};
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost'),p=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(p,(err,data)=>{if(err){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','Cache-Control':'no-cache'}).end(data);});});
let browser,ws,profile;
async function main(){
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
  profile=fs.mkdtempSync(path.join(os.tmpdir(),'patient-rehab-smoke-'));
  browser=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
  let spawnError;browser.on('error',e=>spawnError=e);
  const portFile=path.join(profile,'DevToolsActivePort');
  for(let i=0;i<100&&!fs.existsSync(portFile);i++){if(spawnError)throw spawnError;await delay(100);}
  if(!fs.existsSync(portFile))throw Error('Chrome did not start');
  let port;for(let i=0;i<50;i++){try{port=fs.readFileSync(portFile,'utf8').split('\n')[0];if(port)break;}catch{}await delay(100);}
  if(!port)throw Error('Chrome debugging port unavailable');const targets=await (await fetch('http://127.0.0.1:'+port+'/json')).json();
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
  await evaluate("window.fillTestPrescription=prefix=>{const values={side:'両側',repetitions:'5回',sets:'1セット',hold:'該当なし',frequency:'1日1回',load:'重りなし',support:'椅子で支える'};for(const [key,value] of Object.entries(values))$(prefix+'-'+key).value=value;$(prefix+'-schedule-confirmed').checked=true;};");
  await check('PIN disabled opens staff workspace directly and optional identity fields remain blank',`(()=>{
    openPinModal();return staffUnlocked&&!$('pinModal').classList.contains('on')&&$('patient-chart-id').value===''&&$('patient-name').value===''&&!$('patient-info').open;
  })()`);
  await check('optional chart ID round trips through storage without changing internal ID',`(()=>{
    const id=S.patientId;updS('chartId','00001234');updS('patientName','架空テスト');
    const stored=JSON.parse(localStorage.getItem(STORE_KEY)).settings;
    const restored=C.settings(stored,'fallback',todayKey());
    const ok=restored.chartId==='00001234'&&restored.patientName==='架空テスト'&&restored.patientId===id;
    updS('chartId','');updS('patientName','');return ok;
  })()`);
  await evaluate('closeTherapist()');
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
  await evaluate("$('chooseTemplate').remove();$('patient-info').open=true;$('next-visit').value='2026-10-08';document.documentElement.style.setProperty('--top-inset','47px');$('hdr-name').textContent='表示名が長い患者さんのスマホ表示確認';");
  await check('date inputs fit therapist modal on narrow phone',"(()=>{const modal=$('therapistModal').querySelector('.t-modal').getBoundingClientRect();return ['start-date','next-visit'].every(id=>{const r=$(id).getBoundingClientRect();return r.left>=modal.left+12&&r.right<=modal.right-12})})()");
  await check('header and modal respect top inset and wrap long name',"(()=>{const name=$('hdr-name').getBoundingClientRect(),day=$('hdr-day').getBoundingClientRect(),title=$('hdr-title').getBoundingClientRect(),modal=$('therapistModal').querySelector('.t-modal').getBoundingClientRect();return title.top>=47&&modal.top>=47&&name.right<=day.left-4&&document.querySelector('.header').scrollWidth<=320})()");
  await check('visible date tracks saved value and can be cleared',"(()=>{$('next-visit').dispatchEvent(new Event('change',{bubbles:true}));const saved=S.nextVisit==='2026-10-08'&&JSON.parse(localStorage.getItem('rehab_v2')).settings.nextVisit==='2026-10-08'&&$('next-visit-display').textContent==='2026 / 10 / 08';clearNextVisit();const cleared=S.nextVisit===''&&$('next-visit').value===''&&$('next-visit-display').textContent==='日付を選択';$('next-visit').value='2026-10-08';$('next-visit').dispatchEvent(new Event('change',{bubbles:true}));return saved&&cleared})()");
  await check('oversized native date widget cannot enlarge visible field',"(()=>{const input=$('next-visit'),frame=input.parentElement,display=$('next-visit-display');input.style.minWidth='400px';const a=frame.getBoundingClientRect(),b=display.getBoundingClientRect();const ok=getComputedStyle(input).opacity==='0'&&getComputedStyle(frame).overflow==='hidden'&&b.right<=a.right-12&&a.right<320&&$('therapistModal').scrollWidth<=320;input.style.minWidth='';return ok})()");
  await check('tapping displayed date reaches enabled native picker',"(async()=>{$('next-visit').scrollIntoView({block:'center',behavior:'instant'});await new Promise(r=>requestAnimationFrame(r));const input=$('next-visit'),r=input.getBoundingClientRect();return !input.disabled&&input.type==='date'&&!!input.labels.length&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)===input})()");
  await check('local video capture tools preserve prescription and release preview on close',`(async()=>{
    const before=JSON.stringify(S);editEx(-1);
    const capture=$('video-camera');if(capture.accept!=='video/*'||capture.getAttribute('capture')!=='environment')return false;
    const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;canvas.getContext('2d').fillRect(0,0,64,64);
    const stream=canvas.captureStream(10),recorder=new MediaRecorder(stream),parts=[];
    recorder.ondataavailable=e=>parts.push(e.data);const stopped=new Promise(r=>recorder.onstop=r);recorder.start();await new Promise(r=>setTimeout(r,250));recorder.stop();await stopped;stream.getTracks().forEach(t=>t.stop());
    const file=new File(parts,'synthetic-exercise.webm',{type:recorder.mimeType}),transfer=new DataTransfer();window.syntheticVideo=file;transfer.items.add(file);
    const input=$('video-file');input.files=transfer.files;input.dispatchEvent(new Event('change'));
    const player=$('video-local-player');await new Promise(r=>{player.onloadedmetadata=r;setTimeout(r,2000)});
    const ok=!$('video-local-preview').hidden&&player.videoWidth===64&&$('video-download').href.startsWith('blob:')&&$('ee-video').value==='';
    const href=$('video-download').href;closeModal('exEditModal');await new Promise(r=>setTimeout(r,0));
    let revoked=false;try{await fetch(href)}catch{revoked=true;}
    return ok&&revoked&&JSON.stringify(S)===before;
  })()`);
  await check('patient video saves locally, survives reopening and separates patients and exercise identity',`(async()=>{
    const ex={id:'local_video_fixture',name:'Local exercise',prescription:{side:'right',repetitions:'5'}},patient=S.patientId,before=JSON.stringify(S);
    const wait=async f=>{for(let i=0;i<100&&!f();i++)await new Promise(r=>setTimeout(r,25));return f();};
    showGuide(ex);await wait(()=>!$('pv-choose').disabled);
    const dt=new DataTransfer();dt.items.add(window.syntheticVideo);$('pv-file').files=dt.files;$('pv-file').dispatchEvent(new Event('change'));
    if(!await wait(()=>!$('pv-save').disabled))return false;$('pv-save').click();
    if(!await wait(()=>$('pv-save').hidden))return false;
    const k=PatientVideo.key(patient,ex);localStorage.setItem('video_test_key',k);
    const row=await PatientVideo.get(k);if(!row||row.blob.size!==syntheticVideo.size)return false;
    closeModal('guideModal');showGuide({...ex,prescription:{side:'right',repetitions:'10'}});
    if(!await wait(()=>$('pv-status').textContent.includes('変更')))return false;
    closeModal('guideModal');S.patientId='other_local_video_patient';showGuide(ex);await wait(()=>!$('pv-choose').disabled);
    const separate=$('pv-player').hidden;closeModal('guideModal');S.patientId=patient;
    const changed=await PatientVideo.get(PatientVideo.key(patient,{...ex,name:'Different exercise'}));
    return separate&&!changed&&JSON.stringify(S)===before&&!JSON.stringify(buildSharePayload()).includes('synthetic-exercise');
  })()`);
  await check('athlete catalog isolates sport candidates and requires individual load',"(()=>{const before=JSON.stringify(S);setCatalogAudience(true);const buttons=[...document.querySelectorAll('#exercise-catalog .tpl-card')].filter(b=>!b.hidden);if(buttons.length!==11||!buttons.every(b=>b.dataset.athlete==='true'))return false;applyTemplate('spondylolysisProtection');const good=document.querySelectorAll('#chooseTemplate .template-ex').length===2&&!$('pick-0').checked&&$('dose-0-load').value==='';closeModal('chooseTemplate');setCatalogAudience(false);return good&&JSON.stringify(S)===before&&!document.querySelector('#exercise-catalog [data-athlete=true]:not([hidden])')})()");
  const dateShot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'therapist-dates-mobile.png'),Buffer.from(dateShot.data,'base64'));
  await check('therapist evidence opens from candidate and preserves draft on close',"(()=>{applyTemplate('shoulder');const before=JSON.stringify(S);const pick=$('pick-0');pick.checked=true;const button=document.querySelector('[data-index=\"0\"] .evidence-button');button.click();const ok=!!$('evidenceModal')&&$('evidenceModal').textContent.includes('2013')&&$('evidenceModal').scrollWidth<=320;closeModal('evidenceModal');const kept=pick.checked;closeModal('chooseTemplate');return ok&&kept&&JSON.stringify(S)===before})()");
  await evaluate("document.documentElement.style.removeProperty('--top-inset');renderHeader();applyTemplate('shoulder');");
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await check('ten shoulder choices with no automatic selection',"document.querySelectorAll('#chooseTemplate img').length===10 && !document.querySelector('#chooseTemplate input:checked')");
  await check('candidate rows use shared stretch mobility strength order',"(()=>{const rows=[...document.querySelectorAll('#chooseTemplate .template-ex')];const keys=rows.map(row=>TEMPLATES.shoulder.menu[Number(row.dataset.index)].exerciseKey);return keys[0]==='crossover'&&keys.at(-1)==='band-row'&&document.querySelector('#template-purpose option[value=stretch]').textContent==='ストレッチ'})()");
  await check('built-in doses prefill drafts without choosing a patient side or confirming a prescription',"(()=>{const d=PRESCRIPTION_DEFAULTS.pendulum.prescription;return Object.keys(PRESCRIPTION_DEFAULTS).length===48&&$('dose-0-repetitions').value===d.repetitions&&$('dose-0-hold').value===d.hold&&$('dose-0-side').value===''&&!$('dose-0-schedule-confirmed').checked&&S.menu.length===0})()");
  await check('empty imported saved default falls back to the built-in draft',"(()=>{T.doseDefault_empty={name:'empty',menu:[]};const draft=standardPrescription(TEMPLATES.shoulder.menu[0]);delete T.doseDefault_empty;return draft.prescription.repetitions===PRESCRIPTION_DEFAULTS.pendulum.prescription.repetitions})()");
  await check('injury-specific range remains individual even when a clinician default exists',`(()=>{
    const key='doseDefault_fixture';T[key]={name:'fixture',menu:[{id:'d',name:'table slide',exerciseKey:'table-slide',prescription:{side:'右',repetitions:'9回',sets:'1セット',hold:'該当なし',frequency:'1日1回',load:'以前の範囲',support:'机で支える'},dows:[]}]};
    const ex=TEMPLATES.shoulder.menu.find(e=>e.exerciseKey==='table-slide');
    const regular=initialPrescriptionDraft(ex,'shoulder'),injury=initialPrescriptionDraft(ex,'anteriorShoulderDislocation');delete T[key];
    return regular.prescription.repetitions==='9回'&&regular.prescription.load==='以前の範囲'&&injury.prescription.load===''&&injury.scheduleConfirmed===false;
  })()`);
  await check('unselected exercises hide prescription controls',"$('dose-0-prescription').getBoundingClientRect().height===0");
  await check('compact candidates keep ten choices under 1800 pixels without expanding dose editors',"(()=>{const rows=[...document.querySelectorAll('#chooseTemplate .template-ex')];return rows.length===10&&rows.reduce((n,row)=>n+row.getBoundingClientRect().height,0)<1800&&rows.every(row=>!row.querySelector('.selected-dose-details').open)})()");
  await check('selected-only filter and quick side edit preserve candidate doses',`(()=>{
    const before=$('dose-0-repetitions').value;$('pick-0').checked=true;$('pick-1').checked=true;updateTemplateSelection();
    setQuickSide(0,'左');showSelectedCandidates();
    const ok=document.querySelectorAll('#chooseTemplate .template-ex:not([hidden])').length===2&&$('dose-0-side').value==='左'&&$('dose-0-repetitions').value===before&&!$('dose-0-details').open;
    $('pick-0').checked=false;$('pick-1').checked=false;setQuickSide(0,'');$('template-selected-only').checked=false;filterTemplateExercises();return ok;
  })()`);
  await check('choice buttons and custom entry stay in sync',`(()=>{
    $('pick-0').checked=true;const field=$('dose-0-prescription');
    field.querySelector('[data-dose-key="side"][data-dose-index="0"]').click();
    const selected=$('dose-0-side').value==='右'&&field.querySelector('[data-dose-key="side"][aria-pressed="true"]').textContent==='右';
    $('dose-0-side').value='右を中心に指定範囲';$('dose-0-side').dispatchEvent(new Event('input',{bubbles:true}));
    const custom=!field.querySelector('[data-dose-key="side"][aria-pressed="true"]')&&$('dose-0-side-custom-value').textContent==='右を中心に指定範囲';
    return selected&&custom&&!$('dose-0-schedule-confirmed').checked;
  })()`);
  await check('clinician defaults persist without prescribing automatically and require reconfirmation',`(()=>{
    fillTestPrescription('dose-0');$('dose-0-day-1').checked=true;savePrescriptionDefault('dose-0');
    const key=Object.keys(T).find(k=>k.startsWith('doseDefault_'));
    const saved=JSON.parse(localStorage.getItem(STORE_KEY)).templates[key];
    choosePrescription('dose-0','side',1);reusePrescription('dose-0','default');
    const ok=saved.menu[0].prescription.side==='両側'&&saved.menu[0].scheduleConfirmed===false&&S.menu.length===0&&!(key in getAllTemplates())&&$('dose-0-side').value==='両側'&&$('dose-0-day-1').checked&&!$('dose-0-schedule-confirmed').checked;
    delete T[key];persist();for(const k of Object.keys(prescriptionChoices))$('dose-0-'+k).value='';setEveryday('dose-0');syncPrescriptionChoices('dose-0');return ok;
  })()`);
  await check('purpose filter preserves selected exercise and dose',"(()=>{$('pick-0').checked=true;$('dose-0').value='5回';$('template-purpose').value='strength';filterTemplateExercises();return document.querySelectorAll('.template-ex:not([hidden])').length===4&&$('pick-0').checked&&$('dose-0').value==='5回'&&$('template-selection').textContent.includes('非表示 1種目')})()");
  await check('difficulty and search filters can combine',"(()=>{$('template-level').value='発展';$('template-search').value='ゴム';filterTemplateExercises();return document.querySelectorAll('.template-ex:not([hidden])').length===1&&document.querySelector('.template-ex:not([hidden])').textContent.includes('ゴムバンド')})()");
  await check('empty filter gives visible feedback',"(()=>{$('template-search').value='存在しない種目';filterTemplateExercises();return !document.querySelector('.exercise-group:not([hidden])')&&$('template-results').textContent.includes('該当する種目がありません')})()");
  await evaluate("$('template-purpose').value='';$('template-level').value='';$('template-search').value='';filterTemplateExercises();previewTemplateExercise(9);");
  await check('new exercise preview preserves selection screen',"!!$('chooseTemplate')&&$('guideModal').textContent.includes('ゴムバンド')&&$('guideModal').textContent.includes('固定')");
  await check('Escape closes preview without losing prescription draft',"(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));return !$('guideModal')&&!!$('chooseTemplate')&&$('pick-0').checked&&$('dose-0').value==='5回'})()");
  await evaluate("$('pick-9').checked=true;window.menuBeforeDoseCheck=JSON.stringify(S.menu);applySelectedTemplate();");
  await check('selected new exercise needs explicit dosage',"!!$('chooseTemplate')&&JSON.stringify(S.menu)===menuBeforeDoseCheck");
  await check('missing load reveals a filtered exercise and focuses its expanded field without saving',`(()=>{
    fillTestPrescription('dose-0');fillTestPrescription('dose-9');$('dose-9-load').value='';
    $('dose-9-load').closest('.dose-field').open=false;
    $('template-search').value='no matching exercise';filterTemplateExercises();applySelectedTemplate();
    const field=$('dose-9-load').closest('.dose-field'),summary=$('dose-9-load-summary'),r=summary.getBoundingClientRect();
    return !$('pick-9').closest('.template-ex').hidden&&field.open&&field.classList.contains('dose-error')&&document.activeElement===summary&&r.top>60&&r.bottom<innerHeight&&$('dose-9-load-error').textContent.includes('負荷')&&$('dose-9-load').getAttribute('aria-invalid')==='true'&&JSON.stringify(S.menu)===menuBeforeDoseCheck;
  })()`);
  const errorShot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'prescription-error-mobile.png'),Buffer.from(errorShot.data,'base64'));
  await check('choosing a missing value clears the inline error',"(()=>{choosePrescription('dose-9','load',0);return !$('dose-9-load-error')&&!$('dose-9-load').hasAttribute('aria-invalid')&&!$('dose-9-load').closest('.dose-field').classList.contains('dose-error')})()");
  await evaluate("$('pick-9').checked=false;updateTemplateSelection();");
  await evaluate("for(let i=0;i<3;i++){$('pick-'+i).checked=true;fillTestPrescription('dose-'+i);$('dose-'+i).value='PT確認用：5回';}$('dose-0-schedule-confirmed').checked=false;applySelectedTemplate();");
  await check('save confirms a complete prescription without an extra checkbox',"!$('chooseTemplate')&&S.menu.length===3&&S.menu.every(ex=>ex.scheduleConfirmed)");
  await evaluate("closeTherapist();");
  await check('three illustrated daily exercises',"document.querySelectorAll('.exercise-card').length===3 && S.menu.every(x=>x.exerciseKey)");
  await check('newly saved prescription matches displayed category order',"S.menu.map(ex=>ex.exerciseKey).join(',')==='crossover,pendulum,supine-flexion'");
  await check('catalog append preserves existing prescription IDs and values',`(()=>{
    staffUnlocked=true;openTherapist();const before=JSON.stringify(S.menu);const diagnosis=S.diagnosis;
    applyTemplate('knee','append');$('pick-0').checked=true;fillTestPrescription('dose-0');applySelectedTemplate();
    const ok=S.menu.length===4&&JSON.stringify(S.menu.slice(0,3))===before&&S.diagnosis===diagnosis;
    commitMenu(S.menu.slice(0,3));closeTherapist();return ok;
  })()`);
  await check('custom set selects all exercises but does not reuse previous patient side',`(()=>{
    staffUnlocked=true;openTherapist();T.custom_quicktest={name:'test set',menu:C.clone(S.menu)};
    applyTemplate('custom_quicktest');const ok=$('pick-0').checked&&$('pick-1').checked&&$('pick-2').checked&&$('dose-0-side').value==='';
    $('chooseTemplate').remove();delete T.custom_quicktest;closeTherapist();return ok;
  })()`);
  await check('previous prescription reuse leaves saved patient menu untouched until save',`(()=>{
    staffUnlocked=true;openTherapist();editEx(0);const before=JSON.stringify(S.menu);
    choosePrescription('ee','side',1);reusePrescription('ee','previous');
    const ok=$('ee-side').value===S.menu[0].prescription.side&&!$('ee-schedule-confirmed').checked&&JSON.stringify(S.menu)===before;
    return ok;
  })()`);
  await send('Emulation.setDeviceMetricsOverride',{width:320,height:700,deviceScaleFactor:1,mobile:true});
  await check('editing an exercise jumps to an empty collapsed field and preserves saved data',`(()=>{
    const before=JSON.stringify(S.menu);$('ee-load').value='';$('ee-load').closest('.dose-field').open=false;saveEx();
    const r=$('ee-load-summary').getBoundingClientRect();
    return document.activeElement===$('ee-load-summary')&&$('ee-load').closest('.dose-field').open&&!!$('ee-load-error')&&r.top>60&&r.bottom<innerHeight&&JSON.stringify(S.menu)===before;
  })()`);
  await evaluate("$('ee-prescription').scrollIntoView({block:'start',behavior:'instant'});");
  await check('choice controls fit narrow phone without horizontal overflow',"$('exEditModal').scrollWidth<=320&&[...$('ee-prescription').querySelectorAll('.dose-choice')].every(b=>b.getBoundingClientRect().width>=44)");
  const choiceShot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'prescription-choices-mobile.png'),Buffer.from(choiceShot.data,'base64'));
  await evaluate("closeModal('exEditModal');closeTherapist();");
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await check('unrecorded pain explicit',"$('pain-value').textContent==='未記録'");
  await check('partial and pain-related rest count as recorded without claiming full completion',"(()=>{setExerciseStatus(0,'partial');setExerciseStatus(1,'pain');setExerciseStatus(2,'forgot');const text=$('daily-record-summary').textContent;return text.includes('3種目中 3種目')&&text.includes('閉じて大丈夫')&&getCompletion(todayKey(),new Date().getDay()).done===0})()");
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
  await check('long guide keeps close action visible, offers bottom return and locks background',`(async()=>{
    window.scrollTo(0,180);await new Promise(r=>requestAnimationFrame(r));const before=window.scrollY;
    showGuide({...todayExercises(new Date().getDay())[0],note:'確認用の個別指示。'.repeat(70)});
    const overlay=$('guideModal');overlay.scrollTop=overlay.scrollHeight;
    await new Promise(r=>requestAnimationFrame(r));
    const close=overlay.querySelector('.t-hd button').getBoundingClientRect();
    const visible=close.top>=0&&close.bottom<=innerHeight&&!!$('guide-return');
    const locked=getComputedStyle(document.body).position==='fixed';
    $('guide-return').click();await new Promise(r=>requestAnimationFrame(r));
    return visible&&locked&&!$('guideModal')&&Math.abs(window.scrollY-before)<=1;
  })()`);
  await evaluate("window.beforeImmediate=C.clone(packState());$('pin-input').value='';checkPin();commitMenu([...S.menu,...[4,5,6,7].map(i=>({id:'added_'+i,name:'追加種目'+i,params:'5回',dows:[]}))]);renderToday();");
  await check('three to seven update explains timing and offers same-day action',"S.menu.length===7&&todayExercises(new Date().getDay()).length===3&&!!$('apply-menu-today')&&$('today-content').textContent.includes('現在の設定は7種目')");
  await evaluate("$('apply-menu-today').click();closeTherapist();");
  await check('same-day action displays all seven and retains existing records',"document.querySelectorAll('#today-content .exercise-card').length===7&&getCompletion(todayKey(),new Date().getDay()).done===3&&L[todayKey()].vas===beforeImmediate.logs[todayKey()].vas&&L[todayKey()].note===beforeImmediate.logs[todayKey()].note");
  await evaluate("loadState();renderToday();calSelectedKey=todayKey();renderCalendar();");
  await check('seven exercises and previous records survive reload',"document.querySelectorAll('#today-content .exercise-card').length===7&&L[todayKey()].menuRevisions[0].menuSnapshot.length===3&&$('cal-content').textContent.includes('当日の変更前の記録')");
  await check('historical structured dosage stays visible even when legacy free text is empty',"(()=>{const ex=L[todayKey()].menuRevisions[0].menuSnapshot[0],oldParams=ex.params,oldPrescription=C.clone(ex.prescription);try{ex.params='';ex.prescription={...ex.prescription,side:'左側のみ・変更前',repetitions:'変更前は7回'};renderCalendar();const revision=[...$('cal-content').querySelectorAll('details')].find(el=>el.querySelector('summary')?.textContent.includes('当日の変更前の記録'));return !!revision&&revision.textContent.includes('左側のみ・変更前')&&revision.textContent.includes('変更前は7回')}finally{ex.params=oldParams;ex.prescription=oldPrescription;renderCalendar()}})()");
  await evaluate("$('pin-input').value='';checkPin();commitMenu([...S.menu,{id:'quota_extra',name:'保存失敗用',params:'5回',dows:[]}]);window.beforeFailedImmediate=JSON.stringify(packState());");
  await check('failed immediate save rolls back current and historical menus',"(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('simulated quota failure')};try{applyCurrentMenuToday()}finally{Storage.prototype.setItem=original}return JSON.stringify(packState())===beforeFailedImmediate})()");
  await evaluate("restoreMemory(beforeImmediate);persist();renderToday();applyTemplate('knee');for(const i of [1,5])$('pick-'+i).checked=true;updateTemplateSelection();$('template-purpose').value='mobility';filterTemplateExercises();");
  await check('related knee selections warn even when filters hide the selected rows',"$('template-choice-warnings').textContent.includes('同系統の種目')&&$('template-choice-warnings').textContent.includes('椅子で膝を伸ばす')&&$('template-selection').textContent.includes('非表示 2種目')&&S.menu.length===3");
  await evaluate("$('template-purpose').value='';filterTemplateExercises();for(const i of [0,1,5]){$('pick-'+i).checked=true;fillTestPrescription('dose-'+i);$('dose-'+i).value='PT確認用：5回';}applySelectedTemplate();");
  await check('saved related prescription retains choices and shows load guidance on mobile',"S.menu.length===3&&$('therapist-content').textContent.includes('同系統の種目を選択しています')&&$('therapistModal').scrollWidth<=390");
  await check('recorded start date stays disabled in new date control',"$('start-date').disabled&&$('start-date').parentElement.classList.contains('is-disabled')");
  await check('same-day logged prescription unchanged',"getCompletion(todayKey(),new Date().getDay()).pct===100 && todayExercises(new Date().getDay())[0].exerciseKey==='crossover'");
  await check('next-day prescription updated',"C.menuAt(S,L,dk(addDays(new Date(),1)),addDays(new Date(),1).getDay())[0].exerciseKey==='heel-slide'");
  await evaluate("showShareQR();");
  await check('complete saved prescription goes straight to QR',"!$('shareReviewModal')&&!!document.querySelector('#qrBox svg')");await evaluate('closeQR()');
  await check('share excludes identifying profile and PIN',"(()=>{const u=buildShareUrl(),p=JSON.parse(LZString.decompressFromEncodedURIComponent(decodeURIComponent(u.split('#d=')[1])));return !u.includes('?d=')&&!('passcode' in p)&&!('patientName' in p)&&!('chartId' in p)&&!('diagnosis' in p)&&!('age' in p);})()");
  await evaluate("window.oldId=S.patientId;window.sameUrl=buildShareUrl();closeTherapist();manualImport(sameUrl);");
  await check('same-patient QR preserves logs',"S.patientId===oldId && getLog(todayKey()).vas===0");
  await evaluate("const foreign={version:2,patientId:'another_patient',startDate:todayKey(),menu:[{id:'other',name:'別の運動',params:'確認用',dows:[]}]};manualImport(location.origin+'/#d='+encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify(foreign))));");
  await check('different patient isolated and old patient archived',"S.patientId==='another_patient' && Object.keys(L).length===0 && archives.some(a=>a.settings.patientId===oldId&&a.logs[todayKey()].vas===0)");
  await evaluate("S.patientName='<img src=x onerror=alert(1)>';persist();renderToday();");
  await check('patient name escaped',"!document.querySelector('.banner img')");
  await evaluate("calDate=new Date(2026,0,31);calNav(1)");await check('month end navigation',"calDate.getMonth()===1");
  await check('all library images load',"(async()=>{const images=[...new Set(Object.values(EXERCISE_LIBRARY).map(e=>e.image))];const results=await Promise.all(images.map(async image=>{const r=await fetch('assets/exercises/'+image);return r.ok&&(await r.blob()).size>1000}));return images.length>0&&results.every(Boolean)})()");
  await evaluate("$('pin-input').value='';checkPin();applyTemplate('lowback');");
  await check('ten low-back illustrations and mobile layout',"document.querySelectorAll('#chooseTemplate img').length===10&&document.documentElement.scrollWidth<=390");
  await check('prescription action follows last exercise without covering it',"(()=>{const rows=$('chooseTemplate').querySelectorAll('.template-ex'),last=rows[rows.length-1],actions=$('chooseTemplate').querySelector('.template-actions');return getComputedStyle(actions).position==='static'&&last.getBoundingClientRect().bottom<=actions.getBoundingClientRect().top})()");
  shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'library-mobile.png'),Buffer.from(shot.data,'base64'));
  await evaluate("for(let i=0;i<10;i++){$('pick-'+i).checked=true;fillTestPrescription('dose-'+i);$('dose-'+i).value='PT確認用：左右各5回';}applySelectedTemplate();showShareQR();if($('shareReviewModal')){$('share-reviewed').checked=true;$('share-confirm').click();}");
  await check('ten-exercise prescription generates and round-trips QR',"(()=>{const p=JSON.parse(LZString.decompressFromEncodedURIComponent(decodeURIComponent(buildShareUrl().split('#d=')[1])));return S.menu.length===10&&p.menu.length===10&&p.menu.some(e=>e.exerciseKey==='walking')&&!!document.querySelector('#qrBox svg')})()");
  await evaluate("closeQR();closeTherapist();");
  await evaluate("$('pin-input').value='';checkPin();window.menuBeforeElbow=JSON.stringify(S.menu);applyTemplate('tennisElbow');");
  await check('tennis elbow offers ten mobile choices without changing existing prescription',"document.querySelectorAll('#chooseTemplate img').length===10&&!document.querySelector('#chooseTemplate input:checked')&&JSON.stringify(S.menu)===menuBeforeElbow&&$('chooseTemplate').textContent.includes('段階違い')&&$('therapistModal').scrollWidth<=390");
  await delay(250);fs.writeFileSync(path.join(art,'tennis-elbow-mobile.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await evaluate("$('template-purpose').value='strength';filterTemplateExercises();$('template-level').value='基本';filterTemplateExercises();");
  await check('elbow strength filter finds isometric entry',"document.querySelectorAll('.template-ex:not([hidden])').length===1&&document.querySelector('.template-ex:not([hidden])').textContent.includes('手の甲')");
  await evaluate("previewTemplateExercise(6)");
  await check('eccentric elbow guide explains illustrated phase and assisted return',"$('guideModal').textContent.includes('反対の手で持ち上げ直します')&&$('guideModal').textContent.includes('図は重りを下ろす場面です')&&$('guideModal').querySelector('img').getAttribute('src').includes('wrist-eccentric-extension')");
  await evaluate("$('guideModal').remove();$('template-purpose').value='';$('template-level').value='';filterTemplateExercises();for(const i of [0,1,5]){$('pick-'+i).checked=true;fillTestPrescription('dose-'+i);$('dose-'+i).value='PT確認用：軽い力で5回';}applySelectedTemplate();showShareQR();if($('shareReviewModal')){$('share-reviewed').checked=true;$('share-confirm').click();}");
  await check('selected elbow exercises persist and generate transferable QR',"(()=>{const p=JSON.parse(LZString.decompressFromEncodedURIComponent(decodeURIComponent(buildShareUrl().split('#d=')[1])));return S.menu.length===3&&p.menu.length===3&&p.menu[2].exerciseKey==='wrist-isometric-extension'&&JSON.parse(localStorage.getItem('rehab_v2')).settings.menu[2].exerciseKey==='wrist-isometric-extension'&&!!document.querySelector('#qrBox svg')})()");
  await evaluate("window.elbowShareUrl=buildShareUrl();closeQR();closeTherapist();window.elbowImportConfirmed=false;window.confirm=()=>{window.elbowImportConfirmed=true;return true};manualImport(elbowShareUrl);window.confirm=()=>true;");
  await check('elbow prescription reimports with matching guides',"elbowImportConfirmed&&location.hash===''&&S.menu.length===3&&mediaFor(S.menu[2]).image==='wrist-isometric-extension.png'");
  await evaluate("$('pin-input').value='';checkPin();window.menuBeforeNeck=JSON.stringify(S.menu);applyTemplate('cervicalSpondylosis');");
  await check('cervical library offers seven unselected choices without changing current prescription',"document.querySelectorAll('#chooseTemplate .template-ex').length===7&&!document.querySelector('#chooseTemplate input:checked')&&JSON.stringify(S.menu)===menuBeforeNeck&&$('chooseTemplate').textContent.includes(DISEASE_LIBRARY.cervicalSpondylosis.guidance)");
  await check('neck library reuses existing shoulder and walking exercise IDs and illustrations',"(()=>{const menu=TEMPLATES.cervicalSpondylosis.menu;return ['scapular-setting','band-row','walking'].every(key=>menu.some(ex=>ex.exerciseKey===key))&&mediaFor(menu.find(ex=>ex.exerciseKey==='scapular-setting')).image===mediaFor(TEMPLATES.shoulder.menu.find(ex=>ex.exerciseKey==='scapular-setting')).image&&mediaFor(menu.find(ex=>ex.exerciseKey==='walking')).image===mediaFor(TEMPLATES.lowback.menu.find(ex=>ex.exerciseKey==='walking')).image})()");
  await evaluate("for(const key of ['neck-rotation','scapular-setting','walking']){const i=TEMPLATES.cervicalSpondylosis.menu.findIndex(ex=>ex.exerciseKey===key);$('pick-'+i).checked=true;fillTestPrescription('dose-'+i);$('dose-'+i).value='PT確認用：5回または指定時間';}applySelectedTemplate();showShareQR();if($('shareReviewModal')){$('share-reviewed').checked=true;$('share-confirm').click();}window.neckShareUrl=buildShareUrl();");
  await check('neck QR contains selected shared IDs and patient restrictions',"(()=>{const p=JSON.parse(LZString.decompressFromEncodedURIComponent(decodeURIComponent(neckShareUrl.split('#d=')[1])));return p.patientId==='another_patient'&&p.menu.length===3&&p.menu.some(ex=>ex.exerciseKey==='walking')&&p.menu.every(ex=>ex.diseaseNote.includes(DISEASE_LIBRARY.cervicalSpondylosis.prescriptionNote))&&!('diagnosis' in p)&&!!document.querySelector('#qrBox svg')})()");
  await evaluate("closeQR();closeTherapist();window.neckImportConfirmed=false;window.confirm=()=>{window.neckImportConfirmed=true;return true};manualImport(neckShareUrl);window.confirm=()=>true;");
  await check('neck reimport displays three prescribed exercises with restrictions and no fabricated records',"neckImportConfirmed&&S.patientId==='another_patient'&&Object.keys(L).length===0&&document.querySelectorAll('#today-content .exercise-card').length===3&&S.menu.every(ex=>ex.diseaseNote.includes(DISEASE_LIBRARY.cervicalSpondylosis.prescriptionNote))&&$('today-content').textContent.includes('手の不器用さ')");
  await evaluate("$('pin-input').value='';checkPin();window.menuBeforeImpingement=JSON.stringify(S.menu);applyTemplate('shoulderImpingement');");
  await check('shoulder impingement offers eight unselected choices including shared original IDs',"document.querySelectorAll('#chooseTemplate .template-ex').length===8&&!document.querySelector('#chooseTemplate input:checked')&&JSON.stringify(S.menu)===menuBeforeImpingement&&['table-slide','shoulder-isometric-external','band-row'].every(key=>TEMPLATES.shoulderImpingement.menu.some(ex=>ex.exerciseKey===key))");
  await evaluate("for(const key of ['shoulder-isometric-external','shoulder-band-external','wall-push-up']){const i=TEMPLATES.shoulderImpingement.menu.findIndex(ex=>ex.exerciseKey===key);$('pick-'+i).checked=true;fillTestPrescription('dose-'+i);$('dose-'+i).value='PT確認用：軽い力で5回';}updateTemplateSelection();");
  await check('isometric and dynamic shoulder selection explains combined loading',"$('template-choice-warnings').textContent.includes('肩を外へ回す筋肉への負荷')&&$('template-choice-warnings').textContent.includes(EXERCISE_LIBRARY['shoulder-isometric-external'].name)&&$('template-choice-warnings').textContent.includes(EXERCISE_LIBRARY['shoulder-band-external'].name)&&$('template-choice-warnings').textContent.includes('負荷を合算')");
  await evaluate("applySelectedTemplate();showShareQR();if($('shareReviewModal')){$('share-reviewed').checked=true;$('share-confirm').click();}window.impingementShareUrl=buildShareUrl();");
  await check('shoulder restrictions survive QR and current prescription shows loading warning',"(()=>{const p=JSON.parse(LZString.decompressFromEncodedURIComponent(decodeURIComponent(impingementShareUrl.split('#d=')[1])));return p.menu.length===3&&p.menu.every(ex=>ex.diseaseNote.includes(DISEASE_LIBRARY.shoulderImpingement.prescriptionNote))&&$('therapist-content').textContent.includes('肩を外へ回す筋肉への負荷')&&!!document.querySelector('#qrBox svg')})()");
  await evaluate("closeQR();closeTherapist();window.impingementImportConfirmed=false;window.confirm=()=>{window.impingementImportConfirmed=true;return true};manualImport(impingementShareUrl);window.confirm=()=>true;");
  await check('shoulder patient view has three exercises and imported restrictions without changing patient identity',"impingementImportConfirmed&&S.patientId==='another_patient'&&Object.keys(L).length===0&&document.querySelectorAll('#today-content .exercise-card').length===3&&S.menu.every(ex=>ex.diseaseNote.includes(DISEASE_LIBRARY.shoulderImpingement.prescriptionNote))&&$('today-content').textContent.includes('術後・脱臼後の指示とは別')");
  for(const disease of ['rotatorCuffTear','cervicalDiscHerniation','anteriorShoulderDislocation','slapLesion','lumbarSpinalStenosis','lumbarDiscHerniation','ankleSprain','meniscalInjury']){
    await evaluate(`window.reviewDisease=${JSON.stringify(disease)};$('pin-input').value='';checkPin();window.menuBeforeReviewDisease=JSON.stringify(S.menu);applyTemplate(reviewDisease);`);
    await check(disease+' starts unselected with its declared candidate count',"document.querySelectorAll('#chooseTemplate .template-ex').length===getDiseaseExerciseKeys(reviewDisease).length&&!document.querySelector('#chooseTemplate input:checked')&&JSON.stringify(S.menu)===menuBeforeReviewDisease&&$('chooseTemplate').textContent.includes(DISEASE_LIBRARY[reviewDisease].guidance)&&document.documentElement.scrollWidth<=390&&$('therapistModal').scrollWidth<=390");
    await delay(150);fs.writeFileSync(path.join(art,disease+'-mobile.png'),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
    await evaluate("window.reviewSharedKeys=getDiseaseExerciseKeys(reviewDisease).filter(key=>reviewDisease==='ankleSprain'||['shoulder','lowback','knee','tennisElbow','cervicalSpondylosis','shoulderImpingement'].some(other=>getDiseaseExerciseKeys(other).includes(key))).slice(0,3).sort((a,b)=>ExerciseSelection.compare({exerciseKey:a},{exerciseKey:b}));window.reviewSharedImages=reviewSharedKeys.map(key=>EXERCISE_LIBRARY[key].image);");
    await check(disease+' uses three library IDs and matching image references',"reviewSharedKeys.length===3&&reviewSharedKeys.every((key,i)=>{const ex=TEMPLATES[reviewDisease].menu.find(ex=>ex.exerciseKey===key);return ex&&mediaFor(ex).image===reviewSharedImages[i]&&document.querySelector('#chooseTemplate .template-ex[data-index=\"'+TEMPLATES[reviewDisease].menu.indexOf(ex)+'\"] img').getAttribute('src')==='assets/exercises/'+reviewSharedImages[i]})");
    await evaluate("for(const key of reviewSharedKeys){const i=TEMPLATES[reviewDisease].menu.findIndex(ex=>ex.exerciseKey===key);$('pick-'+i).checked=true;fillTestPrescription('dose-'+i);$('dose-'+i).value='PT確認用：軽い力で5回';}applySelectedTemplate();showShareQR();if($('shareReviewModal')){$('share-reviewed').checked=true;$('share-confirm').click();}window.reviewDiseaseUrl=buildShareUrl();");
    await check(disease+' QR preserves selected IDs and disease restrictions',"(()=>{const p=JSON.parse(LZString.decompressFromEncodedURIComponent(decodeURIComponent(reviewDiseaseUrl.split('#d=')[1])));return p.patientId==='another_patient'&&p.menu.length===3&&JSON.stringify(p.menu.map(ex=>ex.exerciseKey))===JSON.stringify(reviewSharedKeys)&&!!DISEASE_LIBRARY[reviewDisease].prescriptionNote&&p.menu.every(ex=>ex.diseaseNote.includes(DISEASE_LIBRARY[reviewDisease].prescriptionNote))&&!!document.querySelector('#qrBox svg')})()");
    await evaluate("closeQR();closeTherapist();window.reviewDiseaseImportConfirmed=false;window.confirm=()=>{window.reviewDiseaseImportConfirmed=true;return true};manualImport(reviewDiseaseUrl);window.confirm=()=>true;");
    await check(disease+' import shows three exercises and patient restrictions without making records',"reviewDiseaseImportConfirmed&&S.patientId==='another_patient'&&Object.keys(L).length===0&&document.querySelectorAll('#today-content .exercise-card').length===3&&JSON.stringify(S.menu.map(ex=>ex.exerciseKey))===JSON.stringify(reviewSharedKeys)&&S.menu.every((ex,i)=>ex.diseaseNote.includes(DISEASE_LIBRARY[reviewDisease].prescriptionNote)&&mediaFor(ex).image===reviewSharedImages[i])&&$('today-content').textContent.includes(DISEASE_LIBRARY[reviewDisease].prescriptionNote)");
  }
  await check('failed writes roll back in-memory changes',"(()=>{const before=S.patientName,original=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('simulated quota failure')};try{S.patientName='not saved';persist()}catch{}finally{Storage.prototype.setItem=original}return S.patientName===before})()");
  await check('malformed import cannot overwrite state',"(()=>{const before=JSON.stringify(packState());manualImport(location.origin+'/#d='+encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify({menu:[{name:'Bad',dows:[9]}]}))));history.replaceState(null,'',location.pathname);return JSON.stringify(packState())===before})()");
  await evaluate("S.patientName='テスト患者B';persist();navigator.serviceWorker.ready.then(()=>true)");
  for(let i=0;i<100;i++){if(await evaluate('!!navigator.serviceWorker.controller'))break;await delay(100);}
  await check('service worker controls page',"!!navigator.serviceWorker.controller");
  await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await send('Page.reload');
  for(let i=0;i<100;i++){if(await evaluate("document.readyState==='complete'&&typeof C!=='undefined'&&typeof S!=='undefined'&&!!S"))break;await delay(100);}
  await check('offline reload retains patient and QR library',"typeof C !== 'undefined' && S.patientId==='another_patient' && typeof LZString==='object' && !storageBlocked");
  await check('illustrations available offline',"(async()=>{const r=await fetch('assets/exercises/pendulum.png');return r.ok&&(await r.blob()).size>1000})()");
  await check('all library illustrations available offline',"(async()=>{const images=[...new Set(Object.values(EXERCISE_LIBRARY).map(e=>e.image))];const r=await Promise.all(images.map(async image=>(await fetch('assets/exercises/'+image)).ok));return images.length>0&&r.every(Boolean)})()");
  await check('patient video persists across reload and offline and can be removed',"(async()=>{const k=localStorage.getItem('video_test_key');const row=await PatientVideo.get(k);if(!row||!row.blob.size)return false;await PatientVideo.remove(k);localStorage.removeItem('video_test_key');return !(await PatientVideo.get(k))})()");
  await check('built-in dose library is available offline',"typeof PRESCRIPTION_DEFAULTS!=='undefined'&&Object.keys(PRESCRIPTION_DEFAULTS).length===48");
  await check('empty URL gives visible feedback',"(()=>{showReceiveSettings();manualImport($('update-url').value);const ok=$('toast').textContent==='URLを入力してください';$('receiveModal').remove();return ok})()");
  await check('no illustration selection is saved and overrides name fallback',"(()=>{staffUnlocked=true;openTherapist();S.menu=C.menu([{id:'test_none',name:Object.values(EXERCISE_LIBRARY)[0].name,params:'5回',dows:[]}]);editEx(0);$('ee-image').value='';for(const key of Object.keys(C.prescriptionLabels))$('ee-'+key).value='test prescription';$('ee-schedule-confirmed').checked=true;saveEx();const ok=S.menu[0].mediaDisabled&&mediaFor(S.menu[0])===null&&JSON.parse(localStorage.getItem(STORE_KEY)).settings.menu[0].mediaDisabled;closeTherapist();return !!ok})()");
  await check('empty future prescription still shows today record and note',"(()=>{L[todayKey()]={menuSnapshot:C.clone(S.menu),done:{test_none:true},status:{test_none:'done'},vas:0,note:'keep'};C.changeMenu(S,L,[],todayKey(),dk(addDays(new Date(),1)));persist();renderToday();return document.querySelectorAll('#today-content .exercise-card').length===1&&!!$('note-ta')&&$('pain-value').textContent==='0 / 10'})()");
  await send('Page.reload');await delay(200);for(let i=0;i<100;i++){if(await evaluate("document.readyState==='complete'&&typeof S!=='undefined'&&!!S").catch(()=>false))break;await delay(100);}
  await check('empty saved prescription reload keeps today record visible without setup overlay',"S.menu.length===0&&$('setupOverlay').hidden&&document.querySelectorAll('#today-content .exercise-card').length===1&&!!$('note-ta')");
  await check('legacy migration preserves raw backup and marks unknown history',"(()=>{localStorage.removeItem('rehab_v2');const old={patientName:'Legacy test',startDate:'2026-01-01',menu:[{id:'new',name:'New exercise',dows:[]}]};const logs={'2026-01-02':{done:{removed_exercise:true},vas:4,note:'keep'}};localStorage.setItem('rehab_settings',JSON.stringify(old));localStorage.setItem('rehab_logs',JSON.stringify(logs));S=null;L={};T={};archives=[];committed=null;loadState();return L['2026-01-02'].legacyUnknown&&L['2026-01-02'].vas===4&&JSON.parse(localStorage.getItem('rehab_legacy_backup')).logs===JSON.stringify(logs)})()");
  await check('another window storage event stops stale patient writes',`(async()=>{
    const originalId=S.patientId,frame=document.createElement('iframe');frame.hidden=true;document.body.appendChild(frame);
    const next=C.clone(packState());next.settings.patientId='external_fake_patient';next.logs={};
    frame.contentWindow.localStorage.setItem(STORE_KEY,JSON.stringify(next));
    await new Promise(r=>setTimeout(r,100));
    const notified=storageBlocked&&storageConflict&&!!$('storageConflictModal');
    try{S.patientName='stale draft';persist()}catch{}
    const safe=JSON.parse(localStorage.getItem(STORE_KEY)).settings.patientId==='external_fake_patient'&&S.patientId===originalId&&S.patientName==='Legacy test';frame.remove();return notified&&safe;
  })()`);
  assert.deepEqual(errors,[],'browser runtime errors');
  await send('Browser.close').catch(()=>{});console.log('Browser smoke complete. Screenshots: .test-artifacts/');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{
  ws?.close();if(browser?.pid&&browser.exitCode===null){browser.kill();await Promise.race([new Promise(r=>browser.once('exit',r)),delay(3000)]);}server.close();
  if(profile){
    const target=path.resolve(profile),temp=path.resolve(os.tmpdir());
    if(path.dirname(target)!==temp||!path.basename(target).startsWith('patient-rehab-smoke-'))throw Error('Refusing to remove unexpected profile path');
    fs.rmSync(target,{recursive:true,force:true,maxRetries:10,retryDelay:300});
  }
});
