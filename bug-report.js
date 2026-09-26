/* Report drafts stay in memory. Only explicit text and coarse navigator labels are copied. */
'use strict';
const bugReportDraft={intent:'',actual:''};
function bugReportEnvironment(nav){
  const ua=nav.userAgent||'';
  const ios=/iPhone|iPad|iPod/.test(ua)||(/Mac/.test(nav.platform||'')&&nav.maxTouchPoints>1);
  const os=ios?'iOS / iPadOS':/Android/.test(ua)?'Android':/Windows/.test(ua)?'Windows':/Mac/.test(ua)?'macOS':/Linux/.test(ua)?'Linux':'不明';
  const browser=/Edg(?:e|A|iOS)?\//.test(ua)?'Edge':/Firefox|FxiOS/.test(ua)?'Firefox':/Chrome|CriOS/.test(ua)?'Chrome':/Safari/.test(ua)?'Safari':'その他 / 不明';
  const device=ios||/Android|Mobile/.test(ua)?'スマートフォン / タブレット':'PC / その他';
  return `端末：${device}\nOS：${os}\nブラウザ：${browser}`;
}
function buildBugReport(intent,actual,nav,date){
  return `【不具合報告】\nやろうとしたこと：\n${intent}\n\n実際に起きたこと：\n${actual}\n\nアプリ版：v59\n日時：${date.toISOString()}（UTC）\n${bugReportEnvironment(nav)}`;
}
function openBugReport(){
  modal('bugReportModal','不具合を報告',`
    <p class="hint">患者名・IDは書かず、画像を添える場合も隠してください</p>
    <p class="hint">この画面のURLには処方データが含まれることがあるため、共有しないでください。</p>
    <label class="fld-lbl" for="bug-intent">やろうとしたこと</label>
    <textarea id="bug-intent" class="fld-inp" rows="3"></textarea>
    <label class="fld-lbl" for="bug-actual">実際に起きたこと</label>
    <textarea id="bug-actual" class="fld-inp" rows="3"></textarea>
    <p class="hint">アプリ版v59・日時・端末/OS/ブラウザの種類だけを自動付記します。</p>
    <button id="bug-copy" class="btn btn-pri" type="button">報告文をコピー</button>
    <p id="bug-status" role="status" aria-live="polite"></p>
    <div id="bug-fallback" hidden>
      <label class="fld-lbl" for="bug-text">手動コピー用の報告文</label>
      <textarea id="bug-text" class="fld-inp" rows="8" readonly></textarea>
      <button id="bug-select" class="btn btn-out" type="button">全文を選択</button>
    </div>
    <p class="hint">LINEに貼り付けて管理者へ送ってください</p>
    <p class="hint">自動送信はしません。入力内容はこのページを閉じると消えます。</p>`);
  const dialog=$('bugReportModal'),intent=$('bug-intent'),actual=$('bug-actual'),copy=$('bug-copy');
  const status=$('bug-status'),fallback=$('bug-fallback'),text=$('bug-text');
  intent.value=bugReportDraft.intent;actual.value=bugReportDraft.actual;
  for(const field of [intent,actual])field.addEventListener('input',()=>{
    bugReportDraft.intent=intent.value;bugReportDraft.actual=actual.value;
    status.textContent='';fallback.hidden=true;
  });
  const select=()=>{text.focus();text.select();text.setSelectionRange(0,text.value.length);};
  $('bug-select').addEventListener('click',select);
  copy.addEventListener('click',async()=>{
    const report=buildBugReport(intent.value,actual.value,navigator,new Date());
    copy.disabled=true;intent.readOnly=true;actual.readOnly=true;
    status.textContent='コピーしています…';fallback.hidden=true;
    try{
      if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');
      await navigator.clipboard.writeText(report);
      if(dialog.isConnected)status.textContent='コピーしました。LINEに貼り付けて管理者へ送ってください。';
    }catch{
      if(dialog.isConnected){
        text.value=report;fallback.hidden=false;
        status.textContent='自動コピーできませんでした。「全文を選択」を押し、端末のコピー操作をしてください。';
        select();
      }
    }finally{copy.disabled=false;intent.readOnly=false;actual.readOnly=false;}
  });
  intent.focus({preventScroll:true});
}
