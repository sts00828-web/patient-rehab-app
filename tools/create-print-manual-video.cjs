const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const outDir=path.join(root,'output','manual-video');
const finalPath=path.join(outDir,'patient-menu-print-manual.webm');
const appUrl=process.env.MANUAL_APP_URL||'http://127.0.0.1:18765/';
const playbackSpeed=0.7;
fs.mkdirSync(outDir,{recursive:true});

const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  const context=await browser.newContext({viewport:{width:1280,height:720},locale:'ja-JP',colorScheme:'light'});
  const page=await context.newPage();
  const frames=[];
  page.setDefaultTimeout(15000);

  async function caption(text,ms=2300){
    await page.evaluate(value=>{
      let el=document.getElementById('manual-video-caption');
      if(!el){
        el=document.createElement('div');
        el.id='manual-video-caption';
        Object.assign(el.style,{
          position:'fixed',left:'4%',right:'4%',bottom:'22px',zIndex:'2147483647',
          padding:'14px 22px',borderRadius:'12px',background:'rgba(10,26,31,.90)',
          color:'#fff',font:'700 25px/1.45 "Yu Gothic",Meiryo,sans-serif',
          textAlign:'center',boxShadow:'0 4px 18px rgba(0,0,0,.32)',pointerEvents:'none'
        });
        document.body.appendChild(el);
      }
      el.textContent=value;
    },text);
    await pause(120);
    const shot=await page.screenshot({type:'jpeg',quality:82});
    frames.push({data:shot.toString('base64'),duration:Math.round(ms/playbackSpeed)});
  }

  async function focus(locator,ms=900){
    await locator.scrollIntoViewIfNeeded();
    await locator.evaluate(el=>{
      el.dataset.manualOldStyle=el.getAttribute('style')||'';
      el.style.outline='5px solid #ffb300';
      el.style.outlineOffset='4px';
      el.style.boxShadow='0 0 0 8px rgba(255,179,0,.25)';
    });
    await pause(ms);
  }

  async function clearFocus(locator){
    await locator.evaluate(el=>{
      el.setAttribute('style',el.dataset.manualOldStyle||'');
      delete el.dataset.manualOldStyle;
    }).catch(()=>{});
  }

  await page.goto(appUrl,{waitUntil:'networkidle'});
  await page.evaluate(()=>{const overlay=document.getElementById('setupOverlay');if(overlay)overlay.hidden=false;});
  await caption('紙で患者さんへ渡すメニューを印刷する方法',2600);
  await caption('現在はQRコード・URLを使用せず、紙で渡す場合だけこの手順を行います',2600);
  await caption('アプリを開くと、最初にこの開始画面が表示されます',2600);

  const staff=page.locator('#setupOverlay button[onclick="openPinModal()"]');
  await focus(staff);
  await caption('「スタッフ画面を開く」を押します',2200);
  await clearFocus(staff);
  await staff.click();
  await pause(900);
  await caption('試験運用中はPIN入力なしでセラピストモードに入れます',2600);
  await caption('患者IDと患者名は任意です。空欄のままでも作成・印刷できます',2800);
  const patientId=page.locator('#patient-chart-id');
  await focus(patientId);
  await patientId.fill('DEMO-001');
  await patientId.blur();
  await caption('必要な場合だけ入力します。ここでは架空のID「DEMO-001」を使います',2600);
  await clearFocus(patientId);

  const toMenu=page.getByRole('button',{name:'運動メニューへ →'});
  await focus(toMenu);
  await caption('「運動メニューへ」を押します',1600);
  await clearFocus(toMenu);
  await toMenu.click();
  await pause(500);

  const lowBack=page.getByRole('button',{name:'腰痛',exact:true});
  await focus(lowBack);
  await caption('疾患・目的を選び、印刷する運動を登録します',2100);
  await clearFocus(lowBack);
  await lowBack.click();
  await pause(500);

  const checks=[
    page.getByRole('checkbox',{name:/骨盤の小さな前後運動/}),
    page.getByRole('checkbox',{name:/四つ這いで背中を動かす/}),
    page.getByRole('checkbox',{name:/横向きで胸を開く/})
  ];
  await caption('必要な運動にチェックします（印刷は最大8種目）',2200);
  for(const check of checks){await check.setChecked(true);await pause(350);}
  const save=page.getByRole('button',{name:'選択した項目を保存'});
  await save.click();
  await pause(500);
  await page.getByRole('combobox',{name:'実施する側'}).selectOption({label:'左右指定なし'});
  await caption('回数・セット数・持続時間・実施側を確認します',2600);

  await focus(save);
  await caption('確認できたら「選択した項目を保存」を押します',1800);
  await clearFocus(save);
  await save.click();
  await pause(700);
  await caption('保存された3種目と処方内容を確認します',2400);

  const handoff=page.getByRole('button',{name:'患者へ渡す →'});
  await focus(handoff);
  await caption('「患者へ渡す」を押します',1600);
  await clearFocus(handoff);
  await handoff.click();
  await pause(500);

  const paper=page.getByRole('button',{name:'紙で渡す（印刷・最大8種目）'});
  await focus(paper);
  await caption('「紙で渡す」だけを選びます。QRコード・URLは使用しません',2300);
  await clearFocus(paper);
  await paper.click();
  await pause(500);
  await caption('8種目は3ページです。両面印刷なら用紙2枚で、最後の裏面は空白です',3200);
  await caption('印刷する運動にチェックが入っていることを確認します',2300);

  const previewButton=page.getByRole('button',{name:'印刷用画面を開く'});
  await focus(previewButton);
  await caption('「印刷用画面を開く」を押します',1700);
  await clearFocus(previewButton);
  const popupPromise=page.waitForEvent('popup');
  await previewButton.click();
  const popup=await popupPromise;
  await popup.waitForLoadState('load');
  await popup.getByText('準備できました。説明と回数を確認して印刷してください。').waitFor();
  await pause(1000);
  const printShot=await popup.screenshot({type:'png'});
  await popup.close();

  const dataUrl='data:image/png;base64,'+printShot.toString('base64');
  await page.evaluate(()=>{document.getElementById('exercisePrintModal')?.remove();closeTherapist();});
  await page.reload({waitUntil:'networkidle'});
  await caption('一度処方すると、次回は保存済み患者のホーム画面から始まります',3000);
  const headerStaff=page.getByRole('button',{name:'⚙ スタッフ画面'});
  await focus(headerStaff);
  await caption('右上の「スタッフ画面」を押します',1900);
  await clearFocus(headerStaff);
  await headerStaff.click();
  await pause(700);
  await caption('保存済みデータがある場合は、上部の「現在の患者」を確認します',2800);
  const nextPatient=page.getByRole('button',{name:'次の患者の処方を始める'});
  await focus(nextPatient);
  await caption('別の患者を処方する時は、必ず「次の患者の処方を始める」を押します',3200);
  await clearFocus(nextPatient);

  await page.setContent(`<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#253238;overflow:hidden}img{display:block;width:100vw;height:100vh;object-fit:contain}</style></head><body><img src="${dataUrl}" alt="印刷用画面"></body></html>`);
  await caption('印刷物には運動名・イラスト・回数・セット数・実施条件が表示されます',3200);
  await caption('患者ID・患者名は、入力した場合だけ印刷物に表示されます',2600);
  await caption('内容を確認し、上部の「印刷・PDFに保存」を押します',2800);
  await caption('A4・縦・倍率100％で印刷してください。実施記録は印刷されません',3400);
  await caption('紙を患者さん本人へ直接お渡しして完了です',2600);

  const previewIndexes=[0,Math.floor(frames.length/2),frames.length-1];
  previewIndexes.forEach((index,order)=>{
    fs.writeFileSync(path.join(outDir,`preview-${order+1}.jpg`),Buffer.from(frames[index].data,'base64'));
  });

  await page.setContent('<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="1280" height="720"></canvas></body></html>');
  const rendered=await page.evaluate(async input=>{
    const canvas=document.getElementById('c');
    const ctx=canvas.getContext('2d');
    const mimeType=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(type=>MediaRecorder.isTypeSupported(type));
    if(!mimeType)throw new Error('このブラウザーはWebM録画に対応していません');
    const stream=canvas.captureStream(10);
    const chunks=[];
    const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:2500000});
    recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
    const stopped=new Promise(resolve=>recorder.onstop=resolve);
    recorder.start(500);
    for(const frame of input){
      const image=new Image();
      image.src='data:image/jpeg;base64,'+frame.data;
      await image.decode();
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(image,0,0,canvas.width,canvas.height);
      await new Promise(resolve=>setTimeout(resolve,frame.duration));
    }
    recorder.stop();
    await stopped;
    const blob=new Blob(chunks,{type:mimeType});
    const bytes=new Uint8Array(await blob.arrayBuffer());
    let binary='';
    const block=0x8000;
    for(let i=0;i<bytes.length;i+=block)binary+=String.fromCharCode(...bytes.subarray(i,i+block));
    return {base64:btoa(binary),mimeType,durationMs:input.reduce((sum,item)=>sum+item.duration,0)};
  },frames);
  fs.writeFileSync(finalPath,Buffer.from(rendered.base64,'base64'));
  await context.close();
  await browser.close();
  const size=fs.statSync(finalPath).size;
  process.stdout.write(JSON.stringify({finalPath,size,mimeType:rendered.mimeType,durationMs:rendered.durationMs,frames:frames.length}));
})().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
