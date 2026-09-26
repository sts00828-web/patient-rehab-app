/* TASK-017 real DOM scenario; reuse the existing isolated localhost harness. */
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const source=fs.readFileSync(path.join(__dirname,'browser-smoke.cjs'),'utf8');
const prefix=source.slice(0,source.indexOf('  await evaluate("window.fillTestPrescription='));
const suffix=source.slice(source.indexOf("  assert.deepEqual(errors,[],'browser runtime errors');"));
const scenario=`
 await evaluate("window.confirm=()=>true;window.prompt=()=> '患者端末';window.alert=m=>window.lastAlert=m;openPinModal();$('pin-input').value='1234';$('pin-confirm').value='1234';checkPin();newPatient();updS('affectedSide','left');openClinicalShelf('G03');");
 await evaluate("for(const id of CC.categories.G03.levels.beginner.slice(0,6))$('cb-'+id+'-selected').click();for(const [k,v] of Object.entries({side:'right',reps:'7',daysPerWeek:'3',constraints:'手すりを使用・痛みが出たら中止'})){const el=$('cb-K01-'+k);el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));}saveClinicalBatch(true)");
 await check('six KOA selections save and generate real SVG',"S.menu.length===6&&!!document.querySelector('#qrBox svg')");
 await evaluate("window.sentMenu=JSON.stringify(S.menu);window.sentUrl=$('qrUrl').value;window.sentPatient=S.patientId;closeQR();S=null;L={};persist();manualImport(sentUrl)");
 await check('received URL restores all six prescriptions exactly',"S.patientId===sentPatient&&JSON.stringify(S.menu)===sentMenu");
 await evaluate("closeTherapist();patientSession=null;showExercise(0);startPatientSession()");
 await check('received patient can start',"patientSession.started===true");
 await evaluate("closeModal('patientSession');staffUnlocked=true;window.notes=Array.from({length:6},()=>Array.from(crypto.getRandomValues(new Uint16Array(300)),v=>String.fromCharCode(0x4e00+v%10000)).join(''));S.menu.forEach((ex,i)=>ex.clinicalV02.constraints=notes[i]);showShareQR()");
 await check('overflow becomes numbered split QR and complete URL remains selectable',"$('qrBox').textContent.includes('分割QR 1 /')&&!$('qrBox').textContent.includes('undefined')&&shareQrParts.length>1&&$('qrUrl').readOnly");
 await evaluate("window.fullUrl=$('qrUrl').value;$('qrUrl').click()");
 await check('URL click selects complete text',"$('qrUrl').selectionEnd-$('qrUrl').selectionStart===fullUrl.length");
 await check('overflow URL retains every instruction',"C.decodeShare(JSON.parse(LZString.decompressFromEncodedURIComponent(decodeURIComponent(fullUrl.split('#d=')[1])))).menu.every((ex,i)=>ex.clinicalV02.constraints===notes[i])");
`;
const file=path.join(__dirname,'share-browser-generated.cjs');
const runner=new Module(file,module);runner.filename=file;runner.paths=module.paths;runner._compile(prefix+scenario+suffix,file);
