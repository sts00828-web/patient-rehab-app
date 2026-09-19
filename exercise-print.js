/* Separate print document: no patient logs, QR payloads or application styles. */
const RehabPrint = (() => {
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const days=['日','月','火','水','木','金','土'];
  function documentHtml(settings,items,media,baseUrl){
    if(!items.length||items.length>6)throw Error('印刷する運動は1〜6種目を選んでください。');
    const labels={side:'左右',repetitions:'回数',sets:'セット',hold:'保持時間',frequency:'頻度',load:'負荷・範囲',support:'支え方'};
    const pages=[];
    for(let offset=0;offset<items.length;offset+=3){
      const cards=items.slice(offset,offset+3).map((ex,j)=>{
        const m=media[offset+j],p=ex.prescription||{};
        const notes=[m?.imageCaption,m?.caution,ex.diseaseNote,...(ex.note||'').split('\n')].map(v=>(v||'').trim()).filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i);
        return `<article class="exercise"><h2>${offset+j+1}. ${esc(ex.name)}</h2><div class="exercise-body"><div class="picture">${m?`<img src="${esc(new URL('assets/exercises/'+m.image,baseUrl).href)}" alt="${esc(ex.name)}">`:'<p>イラストなし<br>院内で確認した動作で行ってください。</p>'}</div><div class="instructions"><p class="dose">${Object.entries(labels).filter(([k])=>p[k]).map(([k,v])=>`${v}：${esc(p[k])}`).join(' ／ ')} ／ 実施日：${ex.dows?.length?ex.dows.map(d=>days[d]).join('・')+'曜日':'毎日'}</p>${ex.params?`<p><b>補足：</b>${esc(ex.params)}</p>`:''}${m?.steps?.length?`<ol>${m.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol>`:'<p>運動方法は担当の理学療法士から説明を受けてください。</p>'}</div></div>${notes.length?`<p class="caution"><b>注意：</b>${notes.map(esc).join(' ／ ')}</p>`:''}</article>`;
      }).join('');
      pages.push(`<section class="sheet"><header><h1>ご自宅で行う運動</h1><div>${settings.patientName?`${esc(settings.patientName)} 様`:'お名前：________________'}${settings.chartId?`　患者ID：${esc(settings.chartId)}`:''}</div><div>開始日：${esc(settings.startDate||'未設定')}${settings.nextVisit?`　次回来院日：${esc(settings.nextVisit)}`:''}${settings.therapistName?`　担当：${esc(settings.therapistName)}`:''}　${pages.length+1} / ${Math.ceil(items.length/3)}ページ</div></header><main>${cards}</main><footer><p><b>痛み・しびれが増したら中止し、担当の理学療法士に負荷と再開方法を相談してください。</b>図の左右より、あなたへの指示を優先してください。</p>${settings.restartInstructions?`<p>再開の指示：${esc(settings.restartInstructions)}</p>`:''}<p>相談先：${esc(settings.consultContact||'担当の理学療法士・受診している医療機関')}</p></footer></section>`);
    }
    return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ホームエクササイズ 印刷</title><style>
      *{box-sizing:border-box}body{margin:0;background:#e8edef;color:#182b32;font-family:"Yu Gothic",Meiryo,sans-serif;font-size:10pt;line-height:1.4}p{margin:2mm 0;white-space:pre-wrap;overflow-wrap:anywhere}h1{font-size:16pt;margin:0 0 1mm}h2{font-size:12pt;margin:0 0 2mm;overflow-wrap:anywhere}header{height:22mm;font-size:10pt;border-bottom:0.4mm solid #3d666e}header div{overflow-wrap:anywhere}main{height:231mm;display:grid;grid-template-rows:repeat(3,77mm)}footer{height:24mm;border-top:0.4mm solid #3d666e;font-size:9pt;padding-top:1mm}footer p{margin:1mm 0}.sheet{width:190mm;height:277mm;margin:10mm auto;background:white;box-shadow:0 2px 12px #0002}.exercise{height:77mm;padding:3mm 0;border-bottom:0.2mm solid #b4c2c6;break-inside:avoid}.exercise:last-child{border-bottom:0}.exercise-body{display:grid;grid-template-columns:57mm 1fr;gap:4mm}.picture img{display:block;width:57mm;height:38mm;object-fit:contain}.caption{font-size:9pt}.instructions{min-width:0}.dose{font-weight:bold;margin-top:0}.instructions ol{margin:2mm 0;padding-left:5mm}.instructions li{padding-bottom:1mm;overflow-wrap:anywhere}.caution{font-size:9pt}.toolbar{padding:16px;background:white;position:sticky;top:0;z-index:2;border-bottom:1px solid #ccc}.toolbar button{font:inherit;padding:10px 20px;margin-right:12px}.toolbar p{margin:8px 0}.error{color:#a12525;font-weight:bold}
      .exercise.compact{padding:2mm 0;line-height:1.25}.exercise.compact h2{margin-bottom:1mm}.exercise.compact p{margin:1mm 0}.exercise.compact ol{margin:1mm 0}.exercise.compact li{padding-bottom:0.5mm}.exercise.compact img{height:32mm}
      @page{size:A4 portrait;margin:10mm}
      @media print{body{background:white}.toolbar{display:none}.sheet{margin:0;box-shadow:none;break-after:page}.sheet:last-of-type{break-after:auto}body.invalid .sheet{display:none}body.invalid .toolbar{display:block;position:static}body.invalid .toolbar button{display:none}}
    </style></head><body class="invalid"><div class="toolbar"><button id="print" disabled>印刷・PDFに保存</button><button onclick="window.close()">閉じる</button><p>A4・縦・倍率100%・余白は既定。ヘッダーとフッターはオフにしてください。両面の場合は「長辺とじ」を選択します（プリンター側の設定）。</p><p id="status" role="status">イラストを読み込んでいます…</p></div>${pages.join('')}<script>
      async function ready(){
        await document.fonts.ready;
        const imgs=[...document.images];await Promise.all(imgs.map(img=>img.complete?Promise.resolve():new Promise(r=>{img.onload=r;img.onerror=r})));
        const missing=imgs.some(img=>!img.naturalWidth);
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
  modal('exercisePrintModal','紙で渡す運動を選ぶ',`<p>A4片面3種目、両面で最大6種目です。処方済みの運動から印刷するものを選んでください。</p>${S.menu.map((ex,i)=>`<label class="pick-label" style="padding:12px 0"><input type="checkbox" name="print-exercise" value="${i}" ${S.menu.length<=6?'checked':''}>${escapeHtml(ex.name)}</label>`).join('')}<p class="hint">患者ID・氏名は入力済みの場合に印刷します。この操作で処方や実施記録は変わりません。</p><button class="btn btn-pri" onclick="previewExercisePrint()">印刷用画面を開く</button>`);
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
