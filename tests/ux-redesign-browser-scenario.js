await evaluate(`window.confirm=()=>true;window.alert=m=>window.lastAlert=m;openPinModal();newPatient();updS('affectedSide','left');openClinicalShelf('G03');`);
await check('weekday selectors removed, weekly dose retained',`!document.querySelector('[id^="cb-K01-day-"]')&&!!$('cb-K01-daysPerWeek')&&!!$('cb-K01-restSeconds')`);
await check('disease conditions are immediately visible',`[...$('clinicalShelf').querySelectorAll('.notice')].some(n=>n.textContent.includes('疾患の注意')&&n.checkVisibility())`);
await evaluate(`$('cb-K01-selected').click();setClinicalBatchValue('K01','daysPerWeek',2);setClinicalBatchValue('K01','restSeconds',60);$('cb-K01-constraints').value='架空の個別制限 TESTUX';$('cb-K01-constraints').dispatchEvent(new Event('input',{bubbles:true}));saveClinicalBatch();`);
await check('save without weekdays keeps flexible weekly frequency and rest',`!$('clinicalShelf')&&S.menu.length===1&&S.menu[0].scheduleMode==='flexible'&&S.menu[0].dows.length===0&&S.menu[0].clinicalV02.daysPerWeek===2&&S.menu[0].clinicalV02.restSeconds===60`);
await evaluate('closeTherapist();renderToday();');
await check('home has one exercise CTA, visible frequency and optional records hidden',`document.querySelectorAll('.exercise-card button').length===1&&document.querySelector('.exercise-card .dose').innerText.includes('週2日')&&!$('note-ta').checkVisibility()&&!document.querySelector('.bar-fg')`);
await check('no daily all-exercise completion pressure',`!$('today-content').innerText.includes('未記録 1種目')&&$('today-content').innerText.includes('毎日すべて行う必要はありません')`);
await evaluate("document.querySelector('.optional-record').open=true;saveVas(0)");
await check('pain recording retains optional panel and explicit zero',`document.querySelector('.optional-record').open&&getLog(todayKey()).vas===0&&$('note-ta').checkVisibility()`);
await evaluate("showExercise(0);window.waitUxImage=async()=>{for(let i=0;i<100&&!document.querySelector('#patientSession img')?.naturalWidth;i++)await new Promise(r=>setTimeout(r,50));};waitUxImage()");
await check('individual restriction, weekly dose and rest visible before starting',`(()=>{const e=document.querySelector('.session-essential');return e.checkVisibility()&&e.innerText.includes('架空の個別制限 TESTUX')&&e.innerText.includes('週2日')&&e.innerText.includes('60秒')&&(getLog(todayKey()).events||[]).length===0;})()`);
for(const width of [320,390]){
 await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
 await check('session fits mobile '+width,`(()=>{const body=document.querySelector('[data-patient-session]');return body.scrollWidth<=body.clientWidth+1&&[...document.querySelectorAll('#patientSession .session-actions button')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;});})()`);
 const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'session-'+width+'.png'),Buffer.from(shot.data,'base64'));
}
await evaluate("startPatientSession();recordPatientSession('done');recordPatientSession('done')");
await check('completion records once, without automatic next start',"getLog(todayKey()).events.length===1&&getLog(todayKey()).events[0].status==='done'&&!patientSession.started");
await evaluate("closeModal('patientSession');renderProgress();");
await check('progress uses days, not daily achievement percentage',`$('prog-content').innerText.includes('直近7日で記録した日数')&&!$('prog-content').innerText.includes('直近7日の達成率')`);
await evaluate("openPinModal();editEx(0);");
await check('single item editor has no weekdays and retains weekly frequency',`!$('cr-day-0')&&$('cr-daysPerWeek').value==='2'`);
await evaluate("saveClinicalPrescription();closeModal('clinicalShelf');closeTherapist();renderToday();");
await check('edit retains existing records and frequency',`S.menu[0].scheduleMode==='flexible'&&S.menu[0].clinicalV02.daysPerWeek===2&&getLog(todayKey()).events.length===1`);
const home=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'home.png'),Buffer.from(home.data,'base64'));
await check('flexible report does not present every-day targets',`(()=>{showReport();const text=$('reportModal').innerText;closeModal('reportModal');return !text.includes('(1/1)')&&text.includes('1種目実施');})()`);
await check('legacy exercise caution is visible before starting',`(()=>{const key=Object.keys(EXERCISE_LIBRARY).find(k=>EXERCISE_LIBRARY[k].caution);const ex={exerciseKey:key,prescription:{}};return sessionEssentialInstructions(ex).includes(escapeHtml(EXERCISE_LIBRARY[key].caution));})()`);
await check('legacy daily-count choice and custom input keep explicit weekly days',`(()=>{
 staffUnlocked=true;const ex={dows:[1,4],prescription:{side:'右',repetitions:'5回',sets:'1セット',hold:'該当なし',frequency:'1日1回',load:'重りなし',support:'椅子'}};
 modal('uxLegacy','架空の頻度検証',prescriptionFields('uxlegacy',ex));
 choosePrescription('uxlegacy','frequency',1);
 const keep=readPrescription('uxlegacy',true).prescription.frequency==='1日2回・週2日';
 $('uxlegacy-frequency').value='1日3回';const custom=readPrescription('uxlegacy',true).prescription.frequency==='1日3回・週2日';
 setWeeklyFrequency('uxlegacy','3');const changed=readPrescription('uxlegacy',true).prescription.frequency==='1日3回・週3日';
 closeModal('uxLegacy');return keep&&custom&&changed;
})()`);
