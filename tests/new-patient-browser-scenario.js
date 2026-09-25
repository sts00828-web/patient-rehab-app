  await evaluate(`openPinModal();window.alert=m=>{window.lastAlert=m};window.confirm=()=>{window.confirmCount++;return window.acceptNew};window.confirmCount=0;window.acceptNew=true;`);
  async function clickNew(touch=false){
    const p=await evaluate(`(()=>{const b=document.querySelector('[onclick="newPatient()"]');b.scrollIntoView({block:'center',behavior:'instant'});const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    if(touch){await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
    else {await send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});}
  }
  for(const touch of [false,true]){
    await send('Emulation.setTouchEmulationEnabled',{enabled:touch});
    await evaluate(`window.oldId=S.patientId;window.oldArchives=archives.length;window.confirmCount=0;`);
    await clickNew(touch);
    await check('empty prescription responds to one '+(touch?'tap':'mouse click'),`S.patientId!==oldId&&confirmCount===1&&archives.length===oldArchives&&!$('new-patient-status').hidden&&document.activeElement.id==='patient-chart-id'`);
    await evaluate(`$('patient-name').focus()`);
    await send('Input.insertText',{text:'架空患者'});
    await evaluate(`window.oldId=S.patientId;window.confirmCount=0;clinicalSelectionState().query='old query';`);
    await clickNew(touch);
    await check('typed name is saved on blur and archived in one click/tap',`S.patientId!==oldId&&confirmCount===1&&archives.at(-1).settings.patientName==='架空患者'&&clinicalSelectionState().query===''&&!$('new-patient-status').hidden`);
  }
  await evaluate(`updS('diagnosis','架空診断');window.before=JSON.stringify(packState());window.acceptNew=false;`);
  await clickNew();
  await check('cancel preserves all data and shows no success',`JSON.stringify(packState())===before&&$('new-patient-status').hidden`);
  await evaluate(`window.acceptNew=true`);await clickNew();
  await check('diagnosis-only prescription is archived',`archives.at(-1).settings.diagnosis==='架空診断'`);
  await evaluate(`updS('patientName','保存済み患者');L[todayKey()]={done:{},status:{},vas:3,note:'架空記録'};persist();window.before=JSON.stringify(packState());window.diskBefore=localStorage.getItem(STORE_KEY);window.realSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error('test full disk')};`);
  await clickNew();
  await check('new prescription save failure retains old patient, logs and archives',`JSON.stringify(packState())===before&&localStorage.getItem(STORE_KEY)===diskBefore&&$('new-patient-status').hidden`);
  await evaluate(`$('patient-name').focus()`);await send('Input.insertText',{text:'未保存'});await clickNew();
  await check('blur save failure prevents new creation',`patientInputSaveFailed&&JSON.stringify(packState())===before&&$('new-patient-status').hidden`);
  await evaluate(`Storage.prototype.setItem=realSet;updS('patientName','再保存患者');window.oldId=S.patientId;`);await clickNew();
  await check('successful resave permits switching with logs protected',`S.patientId!==oldId&&archives.at(-1).settings.patientName==='再保存患者'&&archives.at(-1).logs[todayKey()].vas===3&&!$('new-patient-status').hidden`);
  await evaluate(`updS('patientName','上限テスト');archives=Array.from({length:500},()=>C.clone(archives[0]));persist();window.before=JSON.stringify(packState());`);await clickNew();
  await check('archive limit preserves old patient without success',`JSON.stringify(packState())===before&&$('new-patient-status').hidden`);
