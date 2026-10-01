/* Separate print document: no patient logs, QR payloads or application styles. */
const RehabPrint = (() => {
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function documentHtml(settings,items,media,baseUrl){
    if(typeof ClinicalRules!=='undefined')ClinicalRules.assertPrescribable(items,settings.patientId);
    if(!items.length||items.length>6)throw Error('印刷する運動は1〜6種目を選んでください。');
    const pages=[];
    const perPage=3;
    const patientLabel=[settings.chartId,settings.patientName].filter(Boolean).join(' ／ ');
    for(let offset=0;offset<items.length;offset+=perPage){
      const cards=items.slice(offset,offset+perPage).map((ex,j)=>{
        const m=media[offset+j],p=ex.prescription||{},steps=typeof ClinicalRules!=='undefined'?ClinicalRules.patientSteps(ex,m):m?.steps||[];
        const hold=p.hold&&!['該当なし','保持設定なし','保持なし（PT確認）','保持なし'].includes(p.hold)?p.hold:'';
        const quantities=[['回数',p.repetitions||'要確認'],['セット数',p.sets||'要確認'],...(hold?[['保持時間',hold]]:[])];
        const details=[['実施側',p.side==='左右指定なし'?'左右の指定なし':p.side],['頻度',p.frequency],['負荷・範囲',p.load],['支え',p.support]].filter(([,value])=>value&&value!=='該当なし');
        const cautions=[ex.note,ex.diseaseNote,ex.clinicalV02?.constraints,m?.caution].filter(Boolean).filter((value,index,array)=>array.indexOf(value)===index);
        return `<article class="exercise"><h2>${offset+j+1}. ${esc(ex.name)}</h2><div class="exercise-body"><div class="picture">${m?`<img src="${esc(m.imageData||new URL(m.imagePath||'assets/exercises/'+m.image,baseUrl).href)}" alt="${esc(ex.name)}">`:'<p>イラストなし</p>'}</div><div class="simple-content"><div class="dose-grid">${quantities.map(([label,value])=>`<div><span>${label}</span><strong>${esc(value)}</strong></div>`).join('')}</div>${details.length?`<dl class="print-details">${details.map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`:''}<div class="instructions"><h3>やり方</h3>${steps.length?`<ol>${steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol>`:'<p>院内で確認した動作で行ってください。</p>'}</div>${cautions.length?`<p class="print-caution"><strong>注意：</strong>${cautions.map(esc).join('／')}</p>`:''}</div></div></article>`;
      }).join('');
      pages.push(`<section class="sheet"><header><div><h1>ご自宅で行う運動</h1>${patientLabel?`<p class="patient-label">対象：${esc(patientLabel)}</p>`:''}</div><div>${pages.length+1} / ${Math.ceil(items.length/perPage)}ページ</div></header><main>${cards}</main></section>`);
    }
    return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ホームエクササイズ 印刷</title><style>
      *{box-sizing:border-box}body{margin:0;background:#e8edef;color:#182b32;font-family:"Yu Gothic",Meiryo,sans-serif;font-size:11pt;line-height:1.38}p{margin:1.5mm 0;white-space:pre-wrap;overflow-wrap:anywhere}h1{font-size:17pt;margin:0}h2{font-size:15pt;margin:0 0 2mm;overflow-wrap:anywhere}h3{font-size:10.5pt;margin:1.5mm 0 .5mm}header{height:17mm;display:flex;align-items:center;justify-content:space-between;border-bottom:0.4mm solid #3d666e}.patient-label{font-size:9pt;margin:0;color:#36575e}main{height:260mm;display:grid;grid-template-rows:repeat(3,86.66mm)}.sheet{width:190mm;height:277mm;margin:10mm auto;background:white;box-shadow:0 2px 12px #0002}.exercise{height:86.66mm;padding:3mm 0;border-bottom:0.2mm solid #b4c2c6;break-inside:avoid}.exercise:last-child{border-bottom:0}.exercise-body{display:grid;grid-template-columns:74mm 1fr;gap:5mm}.picture img{display:block;width:74mm;height:56mm;object-fit:contain}.simple-content{min-width:0}.dose-grid{display:flex;gap:2mm;margin-bottom:1mm}.dose-grid>div{min-width:22mm;border:0.4mm solid #3d666e;border-radius:2mm;padding:1.2mm 1mm;text-align:center}.dose-grid span{display:block;font-size:7.5pt;color:#48646b}.dose-grid strong{display:block;font-size:11.5pt;line-height:1.2}.print-details{margin:0;font-size:8.5pt}.print-details div{display:flex;gap:1mm}.print-details dt{font-weight:700;white-space:nowrap}.print-details dd{margin:0;overflow-wrap:anywhere}.instructions ol{margin:.5mm 0;padding-left:5mm}.instructions li{padding-bottom:.5mm;overflow-wrap:anywhere}.print-caution{font-size:8.5pt;color:#7a341e;margin-top:1mm}.toolbar{padding:16px;background:white;position:sticky;top:0;z-index:2;border-bottom:1px solid #ccc}.toolbar button{font:inherit;padding:10px 20px;margin-right:12px}.toolbar p{margin:8px 0}.error{color:#a12525;font-weight:bold}
      .exercise.compact{padding:2mm 0;line-height:1.2}.exercise.compact h2{margin-bottom:1mm}.exercise.compact p{margin:1mm 0}.exercise.compact ol{margin:1mm 0}.exercise.compact li{padding-bottom:0.2mm}.exercise.compact .print-details{font-size:7.8pt}.exercise.compact .instructions{font-size:8.5pt;line-height:1.18}.exercise.compact .print-caution{font-size:7.2pt;line-height:1.12}
      @page{size:A4 portrait;margin:10mm}
      @media print{body{background:white}.toolbar{display:none}.sheet{margin:0;box-shadow:none;break-after:page}.sheet:last-of-type{break-after:auto}body.invalid .sheet{display:none}body.invalid .toolbar{display:block;position:static}body.invalid .toolbar button{display:none}}
    </style></head><body class="invalid"><div class="toolbar"><button id="print" disabled>印刷・PDFに保存</button><button onclick="window.close()">閉じる</button><p><strong>院内PC専用：A4・縦・サイズ調整100%・長辺とじ。</strong>ヘッダーとフッターはオフにしてください。iPhoneからの印刷は禁止です。</p><p id="status" role="status">イラストを読み込んでいます…</p></div>${pages.join('')}<script>
      async function ready(){
        await document.fonts.ready;
        const imgs=[...document.images];await Promise.all(imgs.map(img=>img.complete?Promise.resolve():new Promise(r=>{img.onload=r;img.onerror=r})));
        const missing=imgs.some(img=>!img.naturalWidth);
        for(const img of imgs)if(!img.naturalWidth)img.hidden=true;
        for(const el of document.querySelectorAll('.exercise')){el.classList.remove('compact');if(el.scrollHeight>el.clientHeight+2)el.classList.add('compact');}
        const overflow=[...document.querySelectorAll('.exercise,header,footer')].some(el=>el.scrollHeight>el.clientHeight+2);
        const status=document.getElementById('status');
        const valid=!missing&&!overflow;document.body.classList.toggle('invalid',!valid);
        status.className=valid?'':'error';status.textContent=missing?'画像を読み込めません。元の画面に戻って、再度印刷用画面を開いてください。':overflow?'長い指示が印刷枠に収まりません。元の画面で指示を確認・整理してください。文章を省略せずに表示しているため、この状態では印刷できません。':'準備できました。説明と回数を確認して印刷してください。';
        document.getElementById('print').disabled=!valid;return valid;
      }
      document.getElementById('print').onclick=async()=>{if(await ready())window.print()};ready();
    </script></body></html>`;
  }
  return {documentHtml};
})();

function openExercisePrint(){
  if(!requireStaff())return;
  if(!S?.menu.length){toast('先に運動を選んで保存してください');return;}
  modal('exercisePrintModal','紙で渡す運動を選ぶ',`<p>A4縦・1ページ3種目、最大6種目で2ページです。両面印刷なら用紙1枚です。処方済みの運動から印刷するものを選んでください。</p>${S.menu.map((ex,i)=>`<label class="pick-label" style="padding:12px 0"><input type="checkbox" name="print-exercise" value="${i}" ${S.menu.length<=6?'checked':''}>${escapeHtml(ex.name)}</label>`).join('')}<p class="hint">印刷内容は、運動名、イラスト、回数、セット数、保持時間、実施側、頻度、負荷・支え、やり方、注意です。患者ID・患者名を入力した場合だけ対象患者も表示します。実施記録は印刷しません。</p><button class="btn btn-pri" onclick="previewExercisePrint()">印刷用画面を開く</button>`);
  const firstParagraph=$('exercisePrintModal')?.querySelector('.t-modal>p');if(firstParagraph){const note=document.createElement('p');note.className='notice';note.innerHTML='<strong>印刷は院内PC限定です。iPhoneからは印刷できません。</strong>';firstParagraph.after(note);}
}
function isIOSPrintDevice(nav=globalThis.navigator||{}){
  return /iPhone|iPad|iPod/i.test(nav.userAgent||'')||((nav.platform||'')==='MacIntel'&&Number(nav.maxTouchPoints)>1);
}
async function embedPrintImage(media,baseUrl){
  if(!media)return media;
  const url=new URL(media.imagePath||'assets/exercises/'+media.image,baseUrl).href;
  const response=await fetch(url);if(!response.ok)throw Error('画像を取得できません');
  const blob=await response.blob();
  const imageData=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('画像を変換できません'));reader.readAsDataURL(blob);});
  return {...media,imageData};
}
async function previewExercisePrint(){
  if(!requireStaff())return;
  if(isIOSPrintDevice()){alert('iPhone・iPadからの印刷は禁止です。院内PCで印刷してください。');return;}
  const items=[...document.querySelectorAll('#exercisePrintModal input:checked')].map(input=>S.menu[Number(input.value)]);
  if(!items.length||items.length>6){toast('1〜6種目を選んでください');return;}
  const incomplete=items.filter(ex=>C.prescriptionIssues(ex).length);
  if(incomplete.length){alert('印刷前に個別指示を確認・保存してください。\n'+incomplete.map(ex=>ex.name+'：'+C.prescriptionIssues(ex).join('・')).join('\n'));return;}
  const win=window.open('about:blank','_blank');
  if(!win){toast('印刷用画面がブロックされました。このサイトのポップアップを許可してください');return;}
  win.opener=null;win.document.open();win.document.write('<!doctype html><meta charset="utf-8"><title>印刷画像を準備中</title><p style="font-family:sans-serif;padding:24px">印刷画像を準備しています…</p>');win.document.close();
  try{
    const media=await Promise.all(items.map(ex=>embedPrintImage(mediaFor(ex),location.href)));
    const html=RehabPrint.documentHtml(S,items,media,location.href);
    win.document.open();win.document.write(html);win.document.close();
  }catch(error){
    win.document.open();win.document.write('<!doctype html><meta charset="utf-8"><title>印刷準備エラー</title><p style="font-family:sans-serif;padding:24px;color:#a12525">画像を準備できませんでした。通信を確認し、元の画面からもう一度お試しください。</p>');win.document.close();
    toast('印刷画像を準備できませんでした。通信を確認して再度お試しください');
  }
}
