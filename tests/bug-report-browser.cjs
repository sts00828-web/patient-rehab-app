/* Isolated localhost real-DOM runner; also usable by the parent reviewer. */
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const source=fs.readFileSync(path.join(__dirname,'browser-smoke.cjs'),'utf8');
const prefix=source.slice(0,source.indexOf('  await evaluate("window.fillTestPrescription='));
const suffix=source.slice(source.indexOf("  assert.deepEqual(errors,[],'browser runtime errors');"));
const scenario=`
 await check('setup report entry exists',"!!document.querySelector('#setupOverlay button[onclick=\\\"openBugReport()\\\"]')");
 await evaluate("document.querySelector('#setupOverlay button[onclick=\\\"openBugReport()\\\"]').click()");
 await check('available before staff setup',"!!$('bugReportModal')&&document.activeElement===$('bug-intent')");
 await evaluate("closeModal('bugReportModal');openPinModal();updS('patientName','PRIVATE_NAME');updS('chartId','PRIVATE_ID');S.menu=[{name:'PRIVATE_RX'}];L.private='PRIVATE_LOG';localStorage.setItem('private-test','PRIVATE_STORAGE');history.replaceState(null,'','#PRIVATE_HASH');window.beforeState=JSON.stringify(packState());window.beforeStorage=JSON.stringify(localStorage);document.querySelector('#therapist-content button[onclick=\\\"openBugReport()\\\"]').click()");
 for(const width of [320,390]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:700,deviceScaleFactor:1,mobile:true});
  await check('report fits width '+width,"$('bugReportModal').scrollWidth<="+width+"&&[...$('bugReportModal').querySelectorAll('textarea,button')].every(e=>e.getBoundingClientRect().right<="+width+")");
  const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'bug-report-'+width+'.png'),Buffer.from(shot.data,'base64'));
 }
 await evaluate("window.attack='</textarea><img src=x onerror=window.injected=true>'; $('bug-intent').value=attack;$('bug-actual').value='起きたこと';$('bug-intent').dispatchEvent(new Event('input'));Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedReport=text;}}});$('bug-copy').click()");
 await check('successful copy and no automatic private data',"$('bug-status').textContent.startsWith('コピーしました')&&copiedReport.includes(attack)&&copiedReport.includes('v54')&&!/PRIVATE_|https?:/.test(copiedReport)");
 await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}});$('bug-copy').click()");
 await check('rejected copy fallback',"!$('bug-fallback').hidden&&$('bug-status').textContent.includes('自動コピーできません')&&$('bug-text').value.includes(attack)&&!$('bugReportModal').querySelector('img')&&!window.injected");
 await evaluate("$('bug-select').click()");
 await check('select entire report',"$('bug-text').selectionEnd-$('bug-text').selectionStart===$('bug-text').value.length");
 for(const width of [320,390]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:700,deviceScaleFactor:1,mobile:true});
  await check('fallback fits width '+width,"$('bugReportModal').scrollWidth<="+width+"&&$('bug-text').getBoundingClientRect().right<="+width);
 }
 await evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined});$('bug-copy').click()");
 await check('API absent preserves input',"!$('bug-fallback').hidden&&$('bug-intent').value===attack");
 await evaluate("closeModal('bugReportModal');openBugReport()");
 await check('reopen literal draft; patient state and storage unchanged',"$('bug-intent').value===attack&&!$('bugReportModal').querySelector('img')&&JSON.stringify(packState())===beforeState&&JSON.stringify(localStorage)===beforeStorage");
 await evaluate("closeModal('bugReportModal')");
`;
const file=path.join(__dirname,'bug-report-browser-generated.cjs');
const runner=new Module(file,module);runner.filename=file;runner.paths=module.paths;runner._compile(prefix+scenario+suffix,file);
