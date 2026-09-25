  await evaluate(`(async()=>{window.confirm=()=>true;window.prompt=()=> '架空端末';window.alert=m=>window.lastAlert=m;
    openPinModal();newPatient();updS('affectedSide','left');openClinicalShelf('G03');
    for(const id of CC.categories.G03.levels.beginner)$('cb-'+id+'-selected').click();
    saveClinicalBatch(true);window.sentMenu=JSON.stringify(S.menu);window.sentUrl=$('qrUrl').value;closeQR();closeTherapist();
    window.waitFor=async f=>{for(let i=0;i<200&&!f();i++)await new Promise(r=>setTimeout(r,50));return !!f()};
    window.originalGetUserMedia=navigator.mediaDevices.getUserMedia;
    // Only acquisition is synthetic: real video, canvas sampling and vendored ZXing decode.
    delete window.BarcodeDetector;
    window.frame=document.createElement('canvas');frame.width=1920;frame.height=1080;
    window.qr=qrcode(0,'M');qr.addData(sentUrl);try{qr.make()}catch{qr=qrcode(0,'L');qr.addData(sentUrl);qr.make()}
    const ctx=frame.getContext('2d'),modules=qr.getModuleCount(),unit=Math.floor(1020/(modules+8)),size=(modules+8)*unit;
    ctx.fillStyle='#fff';ctx.fillRect(0,0,1920,1080);ctx.fillStyle='#000';
    for(let y=0;y<modules;y++)for(let x=0;x<modules;x++)if(qr.isDark(y,x))ctx.fillRect(Math.floor((1920-size)/2)+(x+4)*unit,Math.floor((1080-size)/2)+(y+4)*unit,unit,unit);
    window.frameTimer=setInterval(()=>{ctx.fillStyle="#fff";ctx.fillRect(0,0,1,1)},100);window.streams=[];window.cameraTracks=[];window.constraints=[];
    navigator.mediaDevices.getUserMedia=async c=>{constraints.push(c);const stream=frame.captureStream(5);streams.push(stream);cameraTracks.push(stream.getTracks());return stream};
  })()`);
  console.log('QR fixture',await evaluate('({exercises:S.menu.length,urlLength:sentUrl.length,modules:qr.getModuleCount()})'));
  await check('real six exercise fixture', 'S.menu.length===6&&qr.getModuleCount()>80');
  // Same full-resolution synthetic video with previous scanner settings.
  await evaluate(`(async()=>{window.legacyRoot=document.createElement('div');legacyRoot.id='legacy-reader';legacyRoot.style.width='300px';document.body.appendChild(legacyRoot);
    window.legacy=new Html5Qrcode('legacy-reader');window.legacyRead=false;
    await legacy.start({facingMode:'environment'},{fps:10,qrbox:{width:240,height:240}},()=>legacyRead=true,()=>{});
    await new Promise(r=>setTimeout(r,1500));window.legacyCanvasWidth=legacy.canvasElement.width;await legacy.stop();legacy.clear();legacyRoot.remove();})()`);
  console.log('Previous configuration',await evaluate('({decoded:legacyRead,canvasWidth:legacyCanvasWidth})'));
  await check('previous configuration does not decode this dense fixture', '!legacyRead');
  for(const width of [320,390]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
    await evaluate(`(async()=>{window.importCount=0;window.originalImport=manualImport;
      manualImport=text=>{importCount++;window.receivedText=text;originalImport(text)};
      S=null;L={};persist();startQrScan();await __qrScanner.ready;})()`);
    await check('actual ZXing camera decode and exact six prescription import at '+width,`(async()=>{
      const read=await waitFor(()=>importCount===1&&__qrScanner===null);
      return read&&receivedText===sentUrl&&JSON.stringify(S.menu)===sentMenu&&cameraTracks.at(-1).every(t=>t.readyState==='ended')&&!$('qrScanModal');
    })()`);
    await evaluate('manualImport=originalImport');
  }
  await check('high resolution request retains rear camera preference', 'constraints.slice(1).every(c=>c.video.width.ideal===1920&&c.video.height.ideal===1080&&c.video.facingMode.ideal===\'environment\')');
  await check('real library falls back after unsupported constraints and stops track', `(async()=>{
    let calls=0;const acquire=navigator.mediaDevices.getUserMedia;
    navigator.mediaDevices.getUserMedia=async c=>{calls++;if(calls===1)throw new DOMException('fixture constraint','OverconstrainedError');return acquire(c)};
    try{startQrScan();await __qrScanner.ready;const ok=calls===2&&constraints.at(-1).video.facingMode==='environment';await stopQrScan();return ok&&cameraTracks.at(-1).every(t=>t.readyState==='ended')}
    finally{navigator.mediaDevices.getUserMedia=acquire}
  })()`);
  await check('permission denied does not retry', `(async()=>{
    let calls=0;const acquire=navigator.mediaDevices.getUserMedia;
    navigator.mediaDevices.getUserMedia=async()=>{calls++;throw new DOMException('fixture denial','NotAllowedError')};
    try{startQrScan();await __qrScanner.ready;const ok=calls===1&&$('qr-reader-status').textContent.includes('NotAllowedError');await stopQrScan();return ok&&__qrScanner===null}
    finally{navigator.mediaDevices.getUserMedia=acquire}
  })()`);
  await check('cancel pending fallback prevents a third scanner and releases actual stream', `(async()=>{
    let calls=0,release;const acquire=navigator.mediaDevices.getUserMedia;
    navigator.mediaDevices.getUserMedia=async c=>{calls++;if(calls===1)throw new DOMException('fixture constraint','OverconstrainedError');await new Promise(r=>release=r);return acquire(c)};
    try{startQrScan();await waitFor(()=>!!release);const closing=stopQrScan();startQrScan();release();await closing;return calls===2&&__qrScanner===null&&cameraTracks.at(-1).every(t=>t.readyState==='ended')}
    finally{navigator.mediaDevices.getUserMedia=acquire}
  })()`);
  await check('cancel before constraint rejection prevents fallback', `(async()=>{
    let calls=0,reject;const acquire=navigator.mediaDevices.getUserMedia;
    navigator.mediaDevices.getUserMedia=()=>{calls++;return new Promise((r,j)=>reject=j)};
    try{startQrScan();await waitFor(()=>!!reject);const closing=stopQrScan();reject(new DOMException('fixture constraint','OverconstrainedError'));await closing;return calls===1&&__qrScanner===null}
    finally{navigator.mediaDevices.getUserMedia=acquire}
  })()`);
  await check('duplicate success callback imports once after camera stops', `(async()=>{
    const Original=Html5Qrcode,importer=manualImport;let callback,imports=0,stopped=false;
    Html5Qrcode=class{start(c,o,success){callback=success;return Promise.resolve()}stop(){stopped=true;return Promise.resolve()}clear(){}};
    manualImport=()=>{if(!stopped)throw Error('import before stop');imports++};
    try{startQrScan();await __qrScanner.ready;callback(sentUrl);callback(sentUrl);await waitFor(()=>__qrScanner===null);return stopped&&imports===1}
    finally{Html5Qrcode=Original;manualImport=importer}
  })()`);
  await evaluate('navigator.mediaDevices.getUserMedia=originalGetUserMedia');
