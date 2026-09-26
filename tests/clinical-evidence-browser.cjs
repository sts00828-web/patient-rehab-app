/* Reuse isolated localhost browser harness. No real patient data. */
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const source=fs.readFileSync(path.join(__dirname,'browser-smoke.cjs'),'utf8');
const prefix=source.slice(0,source.indexOf('  await evaluate("window.fillTestPrescription='));
const suffix=source.slice(source.indexOf("  assert.deepEqual(errors,[],'browser runtime errors');"));
const scenario=`
  await evaluate('openPinModal();openClinicalShelf("G03","beginner")');
  await check('unselected candidates have references and correct category',\`(()=>{
    const row=document.querySelector('[data-clinical-exercise="K04"]');
    const button=row.querySelector('.evidence-button');button.click();
    return $('evidenceModal').textContent.includes('NG226')&&$('evidenceModal').textContent.includes('Knee Conditioning Program');
  })()\`);
  await evaluate('closeModal("evidenceModal")');
  await check('reference open/close preserves selection and draft',\`(()=>{
    $('cb-K04-selected').click();const before=JSON.stringify(clinicalBatch);const menu=JSON.stringify(S.menu);
    document.querySelector('[data-clinical-exercise="K04"] .evidence-button').click();closeModal('evidenceModal');
    return before===JSON.stringify(clinicalBatch)&&menu===JSON.stringify(S.menu)&&$('cb-K04-selected').checked;
  })()\`);
  await evaluate('closeModal("clinicalShelf");showClinicalEvidence("P04","A06")');
  await check('program study clearly marked as background, not injury treatment evidence',\`$('evidenceModal').textContent.includes('直接裏付ける文献は未確認')&&$('evidenceModal').textContent.includes('健康な大学男子')\`);
  await evaluate('closeModal("evidenceModal");previewClinical("S01")');
  await check('preview reference button works',\`(()=>{document.querySelector('#clinicalPreview .evidence-button').click();return $('evidenceModal').textContent.includes('振り子体操')&&!$('evidenceModal').textContent.includes('この独自種目');})()\`);
  await check('all current definitions render in the browser',\`Object.values(CC.definitions).filter(d=>d.status!=='retired').every(d=>{const html=ExerciseEvidence.html({exerciseKey:d.key});return html.includes('href="https://')&&!html.includes('undefined')&&!html.includes('この独自種目');})\`);
  for(const width of [320,390]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
    await check('reference dialog fits '+width,\`(()=>{const m=document.querySelector('#evidenceModal .t-modal');return m.scrollWidth<=m.clientWidth+1;})()\`);
    const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'evidence-'+width+'.png'),Buffer.from(shot.data,'base64'));
  }
  await evaluate('closeModal("evidenceModal");closeModal("clinicalPreview");staffUnlocked=false');
  await check('patient cannot open staff evidence',\`(()=>{showClinicalEvidence('S01','G01');return !$('evidenceModal')?.classList.contains('on');})()\`);
`;
const file=path.join(__dirname,'clinical-evidence-browser-generated.cjs');
const runner=new Module(file,module);runner.filename=file;runner.paths=module.paths;
runner._compile(prefix+scenario+suffix,file);
