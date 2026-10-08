await evaluate("window.confirm=()=>true;window.alert=message=>window.lastAlert=message;openPinModal();newPatient();updS('affectedSide','left');openExerciseCatalog();setTherapistStep('menu',false);showAthleteStretchCategories()");
await check('direct stretch shortcut reveals all four athlete shelves',"JSON.stringify([...document.querySelectorAll('[data-clinical-category]')].map(e=>e.dataset.clinicalCategory))===JSON.stringify(['A12','A13','A14','A16'])");
await evaluate("openClinicalShelf('A12');$('cb-P31-selected').click();$('cb-P31-side').value='left';$('cb-P31-side').dispatchEvent(new Event('input',{bubbles:true}));");
await check('chosen side updates dose basis and static label is visible',"clinicalBatch.items.P31.ex.clinicalV02.amountBasis==='per_side'&&document.querySelector('[data-clinical-exercise=P31]').textContent.includes('静的ストレッチ')");
await evaluate("saveClinicalBatch(false);closeTherapist();writableLog().vas=0;saveLogs();showExercise(0)");
for(let i=0;i<50;i++){if(await evaluate("$('patientSession').querySelector('img')?.naturalWidth>0"))break;await delay(100);}
await evaluate("startPatientSession();recordPatientSession('done');closeModal('patientSession');window.stretchOldId=S.menu[0].id;localStorage.setItem('stretchOldId',stretchOldId);localStorage.setItem('originalStretchEvent',JSON.stringify(getLog(todayKey()).events[0]));openPinModal();openClinicalShelf('A12','intermediate');$('cb-P37-selected').click();saveClinicalBatch(false);closeTherapist();");
await check('second addition is visible today and keeps the earlier completed record',"S.menu.length===2&&L[todayKey()].status[stretchOldId]==='done'&&L[todayKey()].menuSnapshot.some(e=>e.exerciseKey==='v02_P37')");
await send('Page.reload');for(let i=0;i<100;i++){if(await evaluate("typeof CR!=='undefined'&&document.readyState==='complete'"))break;await delay(100);}
await check('reload keeps both prescriptions and original completion',"S.menu.length===2&&L[todayKey()].status[localStorage.getItem('stretchOldId')]==='done'");
await evaluate("openPinModal();openClinicalShelf('A12');$('cb-P32-selected').click();closeModal('clinicalShelf')");
await check('cancelled selection never enters patient menu',"S.menu.length===2&&!S.menu.some(e=>e.exerciseKey==='v02_P32')");
await evaluate("openClinicalShelf('A12');$('cb-P31-selected').click();saveClinicalBatch(false);closeTherapist();");
await check('reselecting saved exercise does not duplicate it or erase its record',"S.menu.filter(e=>e.exerciseKey==='v02_P31').length===1&&L[todayKey()].status[localStorage.getItem('stretchOldId')]==='done'");
await evaluate("openPinModal();openClinicalPrescription('P31','A12');$('cr-side').value='right';$('cr-amountBasis').value='each_side';saveClinicalPrescription();closeModal('clinicalShelf');");
await check('single re-edit normalizes unilateral quantity even when raw dose still says each side',"S.menu[0].clinicalV02.side==='right'&&S.menu[0].clinicalV02.amountBasis==='per_side'&&!S.menu[0].prescription.repetitions.includes('左右各')");
await evaluate("openClinicalPrescription('P31','A12');$('cr-side').value='left';saveClinicalPrescription();closeModal('clinicalShelf');");
await check('QR roundtrip and printed instructions agree with unilateral prescription',`(()=>{
 const shared=C.settings(C.decodeShare(JSON.parse(JSON.stringify(C.encodeShare(S)))),S.patientId,todayKey());
 const ex=shared.menu.find(e=>e.exerciseKey==='v02_P31');
 const html=RehabPrint.documentHtml(shared,[ex],[{...CC.definitions.P31,imagePath:CC.definitions.P31.image}],location.href);
 return ex.clinicalV02.side==='left'&&!ex.prescription.repetitions.includes('左右各')&&!html.includes('左右各')&&!html.includes('反対側も')&&html.includes('左')&&html.includes('15秒');
})()`);
await evaluate("openClinicalPrescription('P39','A14');$('cr-side').value='right';$('cr-amountBasis').value='each_side';saveClinicalPrescription();closeModal('clinicalShelf');");
await check('single new prescription saves a chosen side without a bilateral instruction',"S.menu.length===3&&S.menu[2].clinicalV02.side==='right'&&!S.menu[2].prescription.repetitions.includes('左右各')&&!CR.patientSteps(S.menu[2]).join('').includes('反対側も')");
await evaluate("commitMenu(S.menu.filter(e=>e.exerciseKey!=='v02_P39'));closeTherapist();");
await evaluate("openPinModal();openClinicalShelf('A16');previewClinical('P40')");
for(let i=0;i<50;i++){if(await evaluate("$('clinicalPreview').querySelector('img')?.naturalWidth>0"))break;await delay(100);}
await check('reused wrist image loads and metadata is visible',"$('clinicalPreview').querySelector('img').naturalWidth>0&&$('clinicalPreview').textContent.includes('前腕屈筋群')&&$('clinicalPreview').textContent.includes('避ける代償')");
await evaluate("closeModal('clinicalPreview');closeModal('clinicalShelf');openClinicalShelf('A12')");
let shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'stretch-shelf-mobile.png'),Buffer.from(shot.data,'base64'));
await evaluate("closeModal('clinicalShelf');closeTherapist();showExercise(0)");
for(let i=0;i<50;i++){if(await evaluate("$('patientSession').querySelector('img')?.naturalWidth>0"))break;await delay(100);}
await check('patient detail contains prescribed side and hold with no opposite-side instruction',"$('patientSession').textContent.includes('左')&&$('patientSession').textContent.includes('15')&&!$('patientSession').textContent.includes('反対側も行います')&&$('patientSession').querySelector('img').naturalWidth>0");
shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'stretch-patient-mobile.png'),Buffer.from(shot.data,'base64'));
await evaluate("closeModal('patientSession');cacheClinicalImages()");
await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
await send('Page.reload');for(let i=0;i<100;i++){if(await evaluate("typeof CR!=='undefined'&&document.readyState==='complete'"))break;await delay(100);}
await evaluate('showExercise(0)');for(let i=0;i<50;i++){if(await evaluate("$('patientSession').querySelector('img')?.naturalWidth>0"))break;await delay(100);}
const offlineState=await evaluate("(()=>{const log=L[todayKey()],id=localStorage.getItem('stretchOldId'),original=JSON.parse(localStorage.getItem('originalStretchEvent'));return {image:!!$('patientSession').querySelector('img')?.naturalWidth,menuLength:S.menu.length,recordRetained:log.status[id]==='done'||(log.menuRevisions||[]).some(r=>r.status[id]==='done'),eventUnchanged:JSON.stringify(log.events.find(e=>e.event_id===original.event_id))===JSON.stringify(original)}})()");
assert.ok(offlineState.image&&offlineState.menuLength===2&&offlineState.recordRetained&&offlineState.eventUnchanged,'offline image, prescription and original versioned record: '+JSON.stringify(offlineState));console.log('PASS offline reload retains the new image, prescription and original versioned completion');

await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
await evaluate(`closeModal('patientSession');window.unchangedBefore=JSON.stringify(S.menu.find(e=>e.exerciseKey==='v02_P31'));window.eventsBeforeBatch=JSON.stringify(getLog(todayKey()).events);openPinModal();openClinicalShelf('A12');$('cb-P31-selected').click();$('cb-P32-selected').click();saveClinicalBatch(false);closeTherapist();`);
await check('unchanged saved selection plus a new exercise is visible today',`S.menu.length===3&&todayExercises(todayDow()).some(e=>e.exerciseKey==='v02_P32')`);
await check('combined selection keeps the existing revision and every prior event',`JSON.stringify(S.menu.find(e=>e.exerciseKey==='v02_P31'))===unchangedBefore&&JSON.stringify(getLog(todayKey()).events)===eventsBeforeBatch`);
