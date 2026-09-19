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
  await evaluate(`staffUnlocked=true;openTherapist();window.alert=message=>window.testAlert=message;
    window.completePrintEx=(ex,i)=>({...ex,id:'print_'+i,prescription:{...PRESCRIPTION_DEFAULTS[ex.exerciseKey]?.prescription,side:'右',load:PRESCRIPTION_DEFAULTS[ex.exerciseKey]?.prescription.load||'担当者が指定した範囲',support:PRESCRIPTION_DEFAULTS[ex.exerciseKey]?.prescription.support||'安定した台',repetitions:PRESCRIPTION_DEFAULTS[ex.exerciseKey]?.prescription.repetitions||'5回',hold:PRESCRIPTION_DEFAULTS[ex.exerciseKey]?.prescription.hold||'保持なし'},scheduleConfirmed:true});
    S.menu=TEMPLATES.lowback.menu.slice(0,6).map(completePrintEx);renderTherapist();openExercisePrint();`);
  await check('saved six exercises initially selected for printing',"document.querySelectorAll('#exercisePrintModal input:checked').length===6");
  await check('zero and seven selections rejected without opening popup',`(()=>{
    const original=window.open;let opens=0;window.open=()=>{opens++;return null};
    document.querySelectorAll('#exercisePrintModal input').forEach(e=>e.checked=false);previewExercisePrint();
    $('exercisePrintModal').remove();S.menu=TEMPLATES.lowback.menu.slice(0,7).map(completePrintEx);openExercisePrint();
    const none=document.querySelectorAll('#exercisePrintModal input:checked').length===0;
    document.querySelectorAll('#exercisePrintModal input').forEach(e=>e.checked=true);previewExercisePrint();
    window.open=original;return opens===0&&none;
  })()`);
  await check('incomplete prescriptions cannot be printed',`(()=>{
    const original=window.open;let opens=0;window.open=()=>{opens++;return null};
    $('exercisePrintModal').remove();S.menu=S.menu.slice(0,6);S.menu[0].prescription.side='';openExercisePrint();previewExercisePrint();
    S.menu[0].prescription.side='右';window.open=original;return opens===0&&testAlert.includes('個別指示');
  })()`);
  const docs=await evaluate(`(()=>{
    const s={...S,patientName:'印刷テスト',chartId:'000123',consultContact:'担当の理学療法士・当院受付'};
    const items=S.menu,render=(xs,ms)=>RehabPrint.documentHtml(s,xs,ms||xs.map(mediaFor),location.href);
    return {stock:Object.entries(TEMPLATES).flatMap(([key,t])=>Array.from({length:Math.ceil(t.menu.length/6)},(_,n)=>({name:key+'-'+n,html:render(t.menu.slice(n*6,n*6+6).map((ex,i)=>({...completePrintEx(ex,i),params:''})))}))),six:render(items),one:render(items.slice(0,1)),four:render(items.slice(0,4)),long:render([{...items[0],note:'長い個別指示。'.repeat(80)}]),missing:render(items.slice(0,1),[{...mediaFor(items[0]),image:'not-found.png'}])};
  })()`);
  // Open the actual print window through the app's button.
  await send("Runtime.evaluate",{expression:"previewExercisePrint()",userGesture:true});

  let popup;
  for(let i=0;i<40;i++){const ts=await (await fetch('http://127.0.0.1:'+port+'/json')).json();popup=ts.find(t=>t.type==='page'&&t.id!==targets.find(t=>t.type==='page').id);if(popup)break;await delay(100);}
  assert.ok(popup,'actual print popup opened');
  const handler=ws.onmessage;ws.close();ws=new WebSocket(popup.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});ws.onmessage=handler;
  await send('Page.enable');await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:900,height:1250,deviceScaleFactor:1,mobile:false});
  async function ready(){for(let i=0;i<80;i++){if(await evaluate("!!document.getElementById('status')&&!document.getElementById('status').textContent.includes('読み込んでいます')"))return;await delay(100);}throw Error('Print image load timeout');}
  await ready();
  await check('six-exercise popup ready with images, explanations and doses',"!document.body.classList.contains('invalid')&&document.querySelectorAll('.sheet').length===2&&document.images.length===6&&document.querySelectorAll('.instructions ol').length===6&&!document.getElementById('print').disabled");
  await check('print popup cannot access parent window',"window.opener===null");
  async function pdf(name,expected){
    await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    console.log(name+': '+await evaluate("document.querySelectorAll('.sheet').length+ ' sheets; '+document.body.className"));
    const result=await send('Page.printToPDF',{preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});const bytes=Buffer.from(result.data,'base64');
    fs.writeFileSync(path.join(art,'exercise-print-'+name+'.pdf'),bytes);
    const pages=(bytes.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
    assert.equal(pages,expected,name+' PDF page count');console.log('PASS '+name+' PDF has '+pages+' pages');
  }
  await pdf('six',2);
  await send('Emulation.setEmulatedMedia',{media:'print'});
  const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(art,'exercise-print-preview.png'),Buffer.from(shot.data,'base64'));
  await send('Emulation.setEmulatedMedia',{media:''});
  for(const [name,expected] of [['one',1],['four',2]]){
    const frame=(await send('Page.getFrameTree')).frameTree.frame.id;
    await send('Page.setDocumentContent',{frameId:frame,html:docs[name]});await ready();await check(name+' fits without clipping',"!document.body.classList.contains('invalid')");await pdf(name,expected);
  }
  for(const fixture of docs.stock){const frame=(await send('Page.getFrameTree')).frameTree.frame.id;await send('Page.setDocumentContent',{frameId:frame,html:fixture.html});await ready();if(await evaluate("document.body.classList.contains('invalid')"))console.log(await evaluate("JSON.stringify([...document.querySelectorAll('.exercise')].map(e=>({text:e.innerText,height:e.clientHeight,scroll:e.scrollHeight})))"));await check(fixture.name+' standard instructions fit',"!document.body.classList.contains('invalid')");}
  for(const name of ['long','missing']){
    const frame=(await send('Page.getFrameTree')).frameTree.frame.id;
    await send('Page.setDocumentContent',{frameId:frame,html:docs[name]});await ready();await check(name+' prevents printing instead of silent omission',"document.body.classList.contains('invalid')&&document.getElementById('print').disabled");
  }
  assert.deepEqual(errors,[]);await send('Browser.close').catch(()=>{});

}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{
  ws?.close();if(browser?.pid&&browser.exitCode===null){browser.kill();await Promise.race([new Promise(r=>browser.once('exit',r)),delay(3000)]);}server.close();
  if(profile){
    const target=path.resolve(profile),temp=path.resolve(os.tmpdir());
    if(path.dirname(target)!==temp||!path.basename(target).startsWith('patient-rehab-smoke-'))throw Error('Refusing to remove unexpected profile path');
    fs.rmSync(target,{recursive:true,force:true,maxRetries:10,retryDelay:300});
  }
});
