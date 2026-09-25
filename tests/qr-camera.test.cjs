const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),{test}=require('node:test');
function app(start){
 const nodes=new Map(['qrScanModal','qr-reader','qr-reader-status'].map(id=>[id,{style:{},remove(){nodes.delete(id)},querySelectorAll(){return []}}]));
 const calls={created:0,stopped:0,cleared:0,imports:[],starts:[]};
 const ctx=vm.createContext({console,Promise,Date,setTimeout,clearTimeout,alert(){},navigator:{},
 document:{addEventListener(){},createElement(){return {firstChild:{}}},body:{appendChild(){}},getElementById:id=>nodes.get(id)},
 Html5QrcodeSupportedFormats:{QR_CODE:0},Html5Qrcode:class{
 constructor(id,config){calls.created++;calls.constructorConfig=config}
 start(camera,config,success){calls.starts.push({camera,config});calls.success=success;return start(calls)}
 stop(){calls.stopped++;return Promise.resolve()} clear(){calls.cleared++}
 }});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../ui.js'),'utf8'),ctx);
 ctx.toast=()=>{};ctx.manualImport=text=>{assert.equal(calls.stopped,1);calls.imports.push(text)};
 const run=s=>vm.runInContext(s,ctx);return {ctx,run,calls,nodes};
}
test('full frame native sampling, ideal rear camera and QR-only config; duplicate decode imports once',async()=>{
 const a=app(()=>Promise.resolve());a.run('startQrScan()');await a.run('__qrScanner.ready');
 const c=a.calls.starts[0].config;assert.equal(c.qrbox,undefined);assert.equal(c.useNativeResolution,true);assert.equal(c.videoConstraints.width.ideal,1920);assert.equal(c.videoConstraints.height.ideal,1080);assert.equal(c.videoConstraints.facingMode.ideal,'environment');assert.equal(a.calls.constructorConfig.formatsToSupport[0],0);
 a.calls.success('fixture');a.calls.success('fixture');await a.run('__qrScanner.closing');assert.deepEqual(a.calls.imports,['fixture']);assert.equal(a.calls.cleared,1);
});
test('pending startup cancellation prevents second scanner and stops eventual camera',async()=>{
 let resolve;const a=app(()=>new Promise(r=>resolve=r));a.run('startQrScan()');await Promise.resolve();const closing=a.run('stopQrScan()');a.run('startQrScan()');assert.equal(a.calls.created,1);resolve();await closing;assert.equal(a.calls.stopped,1);assert.equal(a.run('__qrScanner'),null);
});
for(const name of ['OverconstrainedError','ConstraintNotSatisfiedError','TypeError'])test(name+' retries once with default resolution',async()=>{
 const a=app(c=>c.starts.length===1?Promise.reject('Error getting userMedia: '+name):Promise.resolve());a.run('startQrScan()');await a.run('__qrScanner.ready');assert.equal(a.calls.starts.length,2);assert.equal(a.calls.starts[1].config.videoConstraints,undefined);assert.equal(a.calls.starts[1].config.useNativeResolution,true);assert.equal(a.calls.starts[1].camera.facingMode,'environment');await a.run('stopQrScan()');assert.equal(a.calls.stopped,1);
});
for(const name of ['NotAllowedError','NotReadableError','NotFoundError'])test(name+' does not retry and can close',async()=>{
 const a=app(()=>Promise.reject(name));a.run('startQrScan()');await a.run('__qrScanner.ready');assert.equal(a.calls.starts.length,1);assert.match(a.nodes.get('qr-reader-status').innerHTML,new RegExp(name));await a.run('stopQrScan()');assert.equal(a.calls.stopped,0);assert.equal(a.run('__qrScanner'),null);
});
test('failed fallback is bounded to two attempts',async()=>{
 const a=app(()=>Promise.reject('OverconstrainedError'));a.run('startQrScan()');await a.run('__qrScanner.ready');assert.equal(a.calls.starts.length,2);await a.run('stopQrScan()');assert.equal(a.run('__qrScanner'),null);
});
test('cancelled constraint rejection cannot start fallback',async()=>{
 let reject;const a=app(()=>new Promise((r,j)=>reject=j));a.run('startQrScan()');await Promise.resolve();const closing=a.run('stopQrScan()');reject('OverconstrainedError');await closing;assert.equal(a.calls.starts.length,1);assert.equal(a.run('__qrScanner'),null);
});
test('cancel during fallback waits and stops eventual camera',async()=>{
 let resolve;const a=app(c=>c.starts.length===1?Promise.reject('OverconstrainedError'):new Promise(r=>resolve=r));a.run('startQrScan()');for(let i=0;i<10&&!resolve;i++)await Promise.resolve();assert.ok(resolve);const closing=a.run('stopQrScan()');a.run('startQrScan()');resolve();await closing;assert.equal(a.calls.created,1);assert.equal(a.calls.starts.length,2);assert.equal(a.calls.stopped,1);assert.equal(a.run('__qrScanner'),null);
});
test('vendored native sampling retains source pixels, caps long edge, and defaults to old sampling',async()=>{
 const ctx=vm.createContext({console,setTimeout:()=>0,clearTimeout,document:{},navigator:{}});ctx.window=ctx;
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../vendor/html5-qrcode.min.js'),'utf8'),ctx);
 for(const [native,width,height,expectedW,expectedH] of [[true,1920,1080,1920,1080],[true,3840,2160,1920,1080],[true,720,1280,720,1280],[false,1920,1080,300,169]]){
  const canvas={width:300,height:169},draws=[],transforms=[];
  const scanner={shouldScan:true,renderedCamera:{getSurface:()=>({videoWidth:width,videoHeight:height,clientWidth:300,clientHeight:169})},qrRegion:{x:0,y:0,width:300,height:169},canvasElement:canvas,context:{canvas,setTransform(...a){transforms.push(a)},drawImage(...a){draws.push(a)}},scanContext:()=>Promise.resolve(true),getTimeoutFps:()=>200};
  ctx.Html5Qrcode.prototype.foreverScan.call(scanner,{useNativeResolution:native},()=>{},()=>{});await Promise.resolve();
  assert.equal(draws[0][7],expectedW);assert.equal(draws[0][8],expectedH);assert.equal(draws[0][3],width);assert.equal(draws[0][4],height);assert.equal(transforms.length,native?1:0);
 }
});

test('real Html5Qrcode ZXing decodes dense six-exercise QR pixels and preserves full payload',async()=>{
 const C=require('../core.js'),rules=require('../clinical-rules.js'),catalog=require('../clinical-catalog.js'),lz=require('../vendor/lz-string.min.js'),qrcode=require('../vendor/qrcode.min.js');
 const patientId='synthetic_patient_0123456789012345';
 const payload={version:2,patientId,startDate:'2026-09-25',menu:C.menu(catalog.categories.G03.levels.beginner.map((id,i)=>({id:'synthetic_exercise_'+i,name:catalog.definitions[id].name,exerciseKey:'v02_'+id,dows:rules.weekdayDraft(rules.doseDraft(id).daysPerWeek),scheduleConfirmed:true,clinicalV02:{...rules.doseDraft(id),mode:'simple',side:rules.initialSide(id,'left'),amountBasis:rules.doseDraft(id).amountBasis||'per_side',categoryId:'G03',revision:'synthetic_revision_'+i,patient:{patientId},constraints:'手すりを使用し、指示された範囲で実施'}})))};
 const url='https://patient-rehab-app.vercel.app/#d='+encodeURIComponent(lz.compressToEncodedURIComponent(JSON.stringify(C.encodeShare(payload))));
 const qr=qrcode(0,'M');qr.addData(url);qr.make();const modules=qr.getModuleCount();assert.ok(modules>80);
 const ctx=vm.createContext({console,performance,document:{getElementById:()=>({})},navigator:{}});ctx.window=ctx;
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../vendor/html5-qrcode.min.js'),'utf8'),ctx);
 const scanner=new ctx.Html5Qrcode('fixture',{formatsToSupport:[ctx.Html5QrcodeSupportedFormats.QR_CODE],useBarCodeDetectorIfSupported:false});
 // Canvas-shaped RGBA input to the actual vendored decoder; no mocked decode result.
 function raster(width,height){
  const data=new Uint8ClampedArray(width*height*4).fill(255),unit=Math.floor(800/(modules+8)),size=(modules+8)*unit;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const mx=Math.floor(((x+.5)*1920/width-(1920-size)/2)/unit)-4,my=Math.floor(((y+.5)*1080/height-(1080-size)/2)/unit)-4;
   if(mx>=0&&mx<modules&&my>=0&&my<modules&&qr.isDark(my,mx)){const i=(y*width+x)*4;data[i]=data[i+1]=data[i+2]=0;}
  }
  return {width,height,getContext:()=>({getImageData:()=>({data})})};
 }
 await assert.rejects(scanner.qrcode.decodeAsync(raster(300,169)),error=>String(error).includes('No MultiFormat Readers'));
 const decoded=await scanner.qrcode.decodeAsync(raster(1920,1080));assert.equal(decoded.text,url);
 assert.deepEqual(C.decodeShare(JSON.parse(lz.decompressFromEncodedURIComponent(decodeURIComponent(decoded.text.split('#d=')[1])))),payload);
 console.log({sixExerciseQrModules:modules,urlLength:url.length,decoder:'vendored ZXing',nativePixels:'1920x1080',undersampledPixels:'300x169'});
});

// Exercise the actual vendor lifecycle; only DOM/media primitives are synthetic.
function vendorPlayback(play) {
 const listeners=new Map(),children=new Set();let stopped=0,playCalled=false,scanStarts=0,uiReady=false;
 const track={stop(){stopped++}},tracks=[track];
 const stream={getVideoTracks:()=>tracks.slice(),removeTrack(t){tracks.splice(tracks.indexOf(t),1)}};
 const parent={style:{},clientWidth:390,append(el){children.add(el)},removeChild(el){assert.ok(children.delete(el))}};
 const video={style:{},clientWidth:390,clientHeight:220,setAttribute(){},
  addEventListener(name,fn){listeners.set(name,fn)},removeEventListener(name,fn){if(listeners.get(name)===fn)listeners.delete(name)},
  play(){playCalled=true;return play()},};
 const ctx=vm.createContext({console,Promise,setTimeout,clearTimeout,navigator:{mediaDevices:{getUserMedia:async()=>stream}},
  document:{getElementById:id=>id==='reader'?parent:null,createElement:()=>video}});ctx.window=ctx;
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../vendor/html5-qrcode.min.js'),'utf8'),ctx);
 const scanner=new ctx.Html5Qrcode('reader',{formatsToSupport:[ctx.Html5QrcodeSupportedFormats.QR_CODE],useBarCodeDetectorIfSupported:false});
 scanner.clearElement=()=>{};scanner.setupUi=()=>{uiReady=true;scanner.canvasElement={};children.add(scanner.canvasElement)};
 scanner.foreverScan=()=>{scanStarts++;assert.equal(uiReady,true);assert.ok(scanner.renderedCamera);assert.equal(scanner.getState(),2);assert.equal(scanner.isScanning,true)};scanner.hidePausedState=()=>{};
 return {scanner,children,listeners,get scanStarts(){return scanStarts},get stopped(){return stopped},get playCalled(){return playCalled},playing(){listeners.get('playing')?.()}};
}
test('real vendor startup waits for play before immediate cancellation removes video',async()=>{
 let resolvePlay;const playback=new Promise(r=>resolvePlay=r),v=vendorPlayback(()=>playback);
 let ready=false;
 const start=v.scanner.start({facingMode:'environment'},{fps:5},()=>{}).then(()=>{ready=true});
 // Match stopQrScan: wait for pending startup before stopping/removing the modal.
 const closing=start.then(()=>v.scanner.stop());
 await new Promise(r=>setImmediate(r));assert.equal(v.playCalled,true);assert.equal(ready,false);assert.equal(v.stopped,0);assert.equal(v.children.size,1);
 v.playing();assert.equal(v.scanStarts,0);resolvePlay();await closing;
 assert.equal(v.scanStarts,1);
 assert.equal(ready,true);assert.equal(v.stopped,1);assert.equal(v.children.size,0);assert.equal(v.listeners.size,0);
});
for(const mode of ['NotAllowedError','NotSupportedError','AbortError','synchronous'])test('real vendor playback failure settles startup and releases camera: '+mode,async()=>{
 const error=Object.assign(new Error('synthetic playback failure'),{name:mode==='synchronous'?'NotSupportedError':mode});
 const v=vendorPlayback(()=>{if(mode==='synchronous')throw error;return Promise.reject(error)});
 const start=v.scanner.start({facingMode:'environment'},{fps:5},()=>{});
 await assert.rejects(start,e=>e===error);
 assert.equal(v.stopped,1);assert.equal(v.children.size,0);assert.equal(v.listeners.size,0);assert.equal(v.scanner.getState(),1);assert.equal(v.scanStarts,0);assert.equal(v.scanner.isScanning,false);
});
for(const name of ['NotSupportedError','AbortError'])test('playback failure is displayed and scanner can close: '+name,async()=>{
 const a=app(()=>Promise.reject(Object.assign(new Error('playback failed'),{name})));
 a.run('startQrScan()');await a.run('__qrScanner.ready');
 assert.match(a.nodes.get('qr-reader-status').innerHTML,new RegExp(name));assert.equal(a.calls.starts.length,1);
 await a.run('stopQrScan()');assert.equal(a.run('__qrScanner'),null);
});

test('real vendor starts once after UI, camera assignment and state transition',async()=>{
 let resolvePlay;const v=vendorPlayback(()=>new Promise(r=>resolvePlay=r));
 const start=v.scanner.start({facingMode:'environment'},{fps:5},()=>{});
 await new Promise(r=>setImmediate(r));
 v.playing();v.playing();assert.equal(v.scanStarts,0);assert.equal(v.scanner.isScanning,false);
 resolvePlay();await start;assert.equal(v.scanStarts,1);
 v.playing();assert.equal(v.scanStarts,1);
 assert.equal(v.scanStarts,1);await v.scanner.stop();assert.equal(v.stopped,1);assert.equal(v.children.size,0);
});
