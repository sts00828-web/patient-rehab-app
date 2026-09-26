/* Separate print document: no patient logs, QR payloads or application styles. */
const RehabPrint = (() => {
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function documentHtml(settings,items,media,baseUrl){
    if(typeof ClinicalRules!=='undefined')ClinicalRules.assertPrescribable(items,settings.patientId);
    if(!items.length||items.length>6)throw Error('印刷する運動は1〜6種目を選んでください。');
    const pages=[];
    const perPage=3;
    for(let offset=0;offset<items.length;offset+=perPage){
      const cards=items.slice(offset,offset+perPage).map((ex,j)=>{
        const m=media[offset+j],p=ex.prescription||{},steps=typeof ClinicalRules!=='undefined'?ClinicalRules.patientSteps(ex,m):m?.steps||[];
        const hold=p.hold&&!['該当なし','保持設定なし','保持なし（PT確認）','保持なし'].includes(p.hold)?p.hold:'';
        const quantities=[['回数',p.repetitions||'要確認'],['セット数',p.sets||'要確認'],...(hold?[['保持時間',hold]]:[])];
        return `<article class="exercise"><h2>${offset+j+1}. ${esc(ex.name)}</h2><div class="exercise-body"><div class="picture">${m?`<img src="${esc(new URL(m.imagePath||'assets/exercises/'+m.image,baseUrl).href)}" alt="${esc(ex.name)}">`:'<p>イラストなし</p>'}</div><div class="simple-content"><div class="dose-grid">${quantities.map(([label,value])=>`<div><span>${label}</span><strong>${esc(value)}</strong></div>`).join('')}</div><div class="instructions"><h3>やり方</h3>${steps.length?`<ol>${steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol>`:'<p>院内で確認した動作で行ってください。</p>'}</div></div></div></article>`;
      }).join('');
      pages.push(`<section class="sheet"><header><h1>ご自宅で行う運動</h1><div>${pages.length+1} / ${Math.ceil(items.length/perPage)}ページ</div></header><main>${cards}</main></section>`);
    }
    return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ホームエクササイズ 印刷</title><style>
      *{box-sizing:border-box}body{margin:0;background:#e8edef;color:#182b32;font-family:"Yu Gothic",Meiryo,sans-serif;font-size:11pt;line-height:1.45}p{margin:2mm 0;white-space:pre-wrap;overflow-wrap:anywhere}h1{font-size:17pt;margin:0}h2{font-size:15pt;margin:0 0 2mm;overflow-wrap:anywhere}h3{font-size:11pt;margin:2mm 0 1mm}header{height:17mm;display:flex;align-items:center;justify-content:space-between;border-bottom:0.4mm solid #3d666e}main{height:260mm;display:grid;grid-template-rows:repeat(3,86.66mm)}.sheet{width:190mm;height:277mm;margin:10mm auto;background:white;box-shadow:0 2px 12px #0002}.exercise{height:86.66mm;padding:3mm 0;border-bottom:0.2mm solid #b4c2c6;break-inside:avoid}.exercise:last-child{border-bottom:0}.exercise-body{display:grid;grid-template-columns:61mm 1fr;gap:5mm}.picture img{display:block;width:61mm;height:50mm;object-fit:contain}.simple-content{min-width:0}.dose-grid{display:flex;gap:3mm;margin-bottom:2mm}.dose-grid>div{min-width:29mm;border:0.5mm solid #3d666e;border-radius:2mm;padding:2mm;text-align:center}.dose-grid span{display:block;font-size:9pt;color:#48646b}.dose-grid strong{display:block;font-size:16pt;line-height:1.25}.instructions ol{margin:1mm 0;padding-left:6mm}.instructions li{padding-bottom:1mm;overflow-wrap:anywhere}.toolbar{padding:16px;background:white;position:sticky;top:0;z-index:2;border-bottom:1px solid #ccc}.toolbar button{font:inherit;padding:10px 20px;margin-right:12px}.toolbar p{margin:8px 0}.error{color:#a12525;font-weight:bold}
      .exercise.compact{padding:2mm 0;line-height:1.25}.exercise.compact h2{margin-bottom:1mm}.exercise.compact p{margin:1mm 0}.exercise.compact ol{margin:1mm 0}.exercise.compact li{padding-bottom:0.5mm}
      @page{size:A4 portrait;margin:10mm}
      @media print{body{background:white}.toolbar{display:none}.sheet{margin:0;box-shadow:none;break-after:page}.sheet:last-of-type{break-after:auto}body.invalid .sheet{display:none}body.invalid .toolbar{display:block;position:static}body.invalid .toolbar button{display:none}}
    </style></head><body class="invalid"><div class="toolbar"><button id="print" disabled>印刷・PDFに保存</button><button onclick="window.close()">閉じる</button><p>A4・縦・倍率100%・余白は既定。ヘッダーとフッターはオフにしてください。両面の場合は「長辺とじ」を選択します（プリンター側の設定）。</p><p id="status" role="status">イラストを読み込んでいます…</p></div>${pages.join('')}<script>
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
  modal('exercisePrintModal','紙で渡す運動を選ぶ',`<p>A4縦・1ページ3種目、最大6種目で2ページです。処方済みの運動から印刷するものを選んでください。</p>${S.menu.map((ex,i)=>`<label class="pick-label" style="padding:12px 0"><input type="checkbox" name="print-exercise" value="${i}" ${S.menu.length<=6?'checked':''}>${escapeHtml(ex.name)}</label>`).join('')}<p class="hint">印刷内容は、運動名・イラスト・回数・セット数・必要な保持時間・やり方だけです。患者情報や実施記録は印刷しません。</p><button class="btn btn-pri" onclick="previewExercisePrint()">印刷用画面を開く</button>`);
}
function previewExercisePrint(){
  if(!requireStaff())return;
  const items=[...document.querySelectorAll('#exercisePrintModal input:checked')].map(input=>S.menu[Number(input.value)]);
  if(!items.length||items.length>6){toast('1〜6種目を選んでください');return;}
  const incomplete=items.filter(ex=>C.prescriptionIssues(ex).length);
  if(incomplete.length){alert('印刷前に個別指示を確認・保存してください。\n'+incomplete.map(ex=>ex.name+'：'+C.prescriptionIssues(ex).join('・')).join('\n'));return;}
  const html=RehabPrint.documentHtml(S,items,items.map(mediaFor),location.href);
  const win=window.open('about:blank','_blank');
  if(!win){toast('印刷用画面がブロックされました。このサイトのポップアップを許可してください');return;}
  win.opener=null;win.document.open();win.document.write(html);win.document.close();
}
