/* Version 2: isolated patient records, dated prescriptions and illustrated guidance. */
const C = RehabCore;
const STORE_KEY = 'rehab_v2';
let archives = [], localPin = '', committed = null, storageBlocked = false, staffUnlocked = false;
let storedBaseline = null, storageConflict = false;
let activeDay = todayKey();
const $ = id => document.getElementById(id);
const uid = () => crypto.randomUUID().replace(/-/g, '');
const statusLabels = {done:'できた',partial:'一部できた',pain:'痛みで休んだ',forgot:'忘れた'};

for (const key of Object.keys(TEMPLATES)) delete TEMPLATES[key];
for (const [key,d] of Object.entries(DISEASE_LIBRARY)) TEMPLATES[key] = {...d, menu:getDiseaseExerciseMenu(key)};

function cleanTemplates(raw) {
  if (!C.record(raw) || Object.keys(raw).length > 100) throw Error('テンプレート形式が不正です。');
  const result = {};
  for (const [key,t] of Object.entries(raw)) {
    if (!C.id(key) || key in Object.prototype || !C.record(t) || !C.text(t.name,120)) throw Error('テンプレートが不正です。');
    result[key] = {name:C.text(t.name,120),icon:C.text(t.icon,8),desc:C.text(t.desc,200),menu:C.menu((t.menu||[]).map((m,i)=>({...m,id:m.id||'tpl_'+i})))};
  }
  return result;
}
function packState() { return {version:2,settings:S,logs:L,templates:T,archives,localPin}; }
function restoreMemory(data) { S=data.settings;L=data.logs;T=data.templates;archives=data.archives||[];localPin=data.localPin||''; }
function blockConflictingStorage() {
  if(committed) restoreMemory(C.clone(committed));
  storageBlocked=true;storageConflict=true;staffUnlocked=false;
  modal('storageConflictModal','別の画面でデータが更新されました',
    '<p>この画面の古い内容で上書きしないよう、保存を停止しました。他の画面で保存した内容を読み直してください。保存前の入力は反映されません。</p><button class="btn btn-pri" onclick="location.reload()">最新の保存内容を読み直す</button>');
}
window.addEventListener('storage',event=>{
  if((event.key===STORE_KEY||event.key===null)&&event.storageArea===localStorage&&localStorage.getItem(STORE_KEY)!==storedBaseline)blockConflictingStorage();
});
function persist() {
  if (storageBlocked) {if(committed)restoreMemory(C.clone(committed));throw Error('保存できないため操作を停止しています。再読み込みしてください。');}
  // Check the raw persisted value, including fields from older releases, before writing.
  // Never merge patients or silently replace another tab's data.
  try {
    if(localStorage.getItem(STORE_KEY)!==storedBaseline){blockConflictingStorage();throw Error('別の画面で更新されています。最新の保存内容を読み直してください。');}
    const raw=JSON.stringify(packState());localStorage.setItem(STORE_KEY,raw);storedBaseline=raw;committed=JSON.parse(raw);
  } catch(e) { if(committed) restoreMemory(C.clone(committed));if(!storageConflict)alert('保存できませんでした。変更は取り消しました。空き容量・ブラウザ設定を確認し、バックアップを保存してください。');throw e; }
}
function loadState() {
  try {
    const raw=localStorage.getItem(STORE_KEY);
    storedBaseline=raw;
    if(raw) {
      const data=JSON.parse(raw);
      if(data.version!==2) throw Error('未対応のデータ形式です。');
      S=data.settings ? C.settings(data.settings,uid(),todayKey()) : null;
      L=C.logs(data.logs||{});T=cleanTemplates(data.templates||{});archives=validateArchives(data.archives||[]);
      localPin=/^\d{4,6}$/.test(data.localPin||'') ? data.localPin : '';
      committed=C.clone(packState());return;
    }
    const legacy={settings:localStorage.getItem('rehab_settings'),logs:localStorage.getItem('rehab_logs'),templates:localStorage.getItem('rehab_templates_custom')};
    if(Object.values(legacy).some(Boolean)) localStorage.setItem('rehab_legacy_backup',JSON.stringify(legacy));
    const oldS=JSON.parse(legacy.settings||'null');
    const migrated=C.migrate(oldS,JSON.parse(legacy.logs||'{}'),uid(),todayKey());
    S=migrated.settings;L=migrated.logs;T=cleanTemplates(JSON.parse(legacy.templates||'{}'));
    localPin=/^\d{4,6}$/.test(oldS?.passcode||'') ? oldS.passcode : '';
    persist();
  } catch(e) {storageBlocked=true;alert('保存データを読み込めません。元データは消していません。バックアップまたは担当者による確認が必要です。\n'+e.message);}
}
function saveSettings(){persist();}
function saveLogs(){persist();}
function saveTemplates(){persist();}
function validateArchives(raw) {
  if(!Array.isArray(raw)||raw.length>500) throw Error('退避記録が不正です。');
  return raw.map(a=>({settings:C.settings(a.settings,uid(),todayKey()),logs:C.logs(a.logs||{}),savedAt:C.text(a.savedAt,50)}));
}
function getCompletion(key,dow){return C.completion(S,L,key,dow);}
function todayExercises(dow){return C.menuAt(S,L,todayKey(),dow);}
function getLog(key){return L[key]||{done:{},status:{},vas:null,note:''};}
function writableLog() {
  if(activeDay!==todayKey()){refreshDay();throw Error('日付が変わりました。新しい日の画面で入力してください。');}
  const key=todayKey();
  if(!S || key<S.startDate) throw Error('開始日より前には記録できません。');
  const log=getLog(key);
  if(!log.menuSnapshot) {if(log.legacyUnknown) log.legacyOriginal=C.clone(log);log.menuSnapshot=C.menuAt(S,L,key,new Date().getDay());delete log.legacyUnknown;}
  log.status=log.status||{};log.done=log.done||{};L[key]=log;return log;
}
function calcStreak(){
  if(!S)return 0;let count=0;
  for(let i=0;i<20000;i++) {
    const d=addDays(new Date(),-i),key=dk(d);if(key<S.startDate||key<S.knownSince)break;
    const c=getCompletion(key,d.getDay());if(!c.total)continue;
    if(c.done>0)count++;else if(i>0)break;
  }return count;
}
function percentText(c){return c.unknown?'旧記録':!c.total?'—':c.pct+'%';}
function mediaFor(ex){
  if(ex.mediaDisabled)return null;
  if(EXERCISE_LIBRARY[ex.exerciseKey])return EXERCISE_LIBRARY[ex.exerciseKey];
  const match=Object.values(EXERCISE_LIBRARY).find(e=>e.name===ex.name);return match||null;
}
const prescriptionLabels={side:'運動する側',repetitions:'回数',sets:'セット数',hold:'保持・動作の時間',frequency:'1日の実施回数',load:'重さ・動かす範囲',support:'支え方・見守り'};
function doseSummary(ex){return ex.params||Object.entries(prescriptionLabels).filter(([key])=>ex.prescription?.[key]&&ex.prescription[key]!=='該当なし').map(([key,label])=>`${label}：${ex.prescription[key]}`).join(' ／ ')||'担当の理学療法士と指示を確認してください';}
function prescriptionHtml(ex){
  const p=ex.prescription||{},rows=Object.entries(prescriptionLabels).filter(([key])=>p[key]);
  return `${ex.params?`<div class="dose">${escapeHtml(ex.params)}</div>`:''}${rows.length?`<dl class="prescription-list">${rows.map(([key,label])=>`<div><dt>${label}</dt><dd>${escapeHtml(p[key])}</dd></div>`).join('')}</dl>`:''}<p class="hint">実施日：${ex.dows?.length?ex.dows.map(d=>DOW_LABEL[d]).join('・')+'曜日':'毎日'}${ex.scheduleConfirmed?'':'（実施曜日・頻度を担当者と確認してください）'}</p>${!p.side||!p.frequency?'<p class="hint">左右や回数が分からないときは、図から判断せず担当の理学療法士に確認してください。</p>':''}`;
}
function consultationHtml(){
  return `<div class="notice"><strong>相談先：</strong>${escapeHtml(S?.consultContact||'担当の理学療法士・受診している医療機関（連絡先は担当者に確認してください）')}<p class="hint">記録は自動送信されません。相談は医療機関へ直接ご連絡ください。</p></div>`;
}
function safetyHtml(compact=false){
  return `<div class="notice safety-notice"><strong>痛み・しびれが増したとき</strong><p>いったん中止し、担当の理学療法士に負荷と再開方法を相談してください。自己判断で負荷を変えて続けないでください。</p>${S?.restartInstructions?`<p><strong>あなたへの対応指示：</strong>${escapeHtml(S.restartInstructions)}</p>`:''}</div>${compact?'':consultationHtml()}`;
}
function exerciseNotices(ex,media){
  // Remove only a complete, known boilerplate line from the display; stored notes remain intact.
  const noteLines=(ex.note||'').split('\n').filter(line=>line.trim()!==media?.caution?.trim()&&line.trim()!==ex.diseaseNote?.trim());
  const note=noteLines.join('\n').trim();
  return `${note?`<div class="notice individual-note"><strong>あなたへの指示・引き継いだ注意</strong><p>${escapeHtml(note)}</p></div>`:''}${media?.caution||ex.diseaseNote?`<div class="notice"><strong>始める前の注意</strong>${media?.caution?`<p>${escapeHtml(media.caution)}</p>`:''}${ex.diseaseNote?`<p>${escapeHtml(ex.diseaseNote)}</p>`:''}</div>`:''}`;
}
function recordSummary(items,log){
  const counts={done:0,partial:0,pain:0,forgot:0};
  for(const ex of items){const status=log.status?.[ex.id]||(log.done?.[ex.id]?'done':'');if(status in counts)counts[status]++;}
  const recorded=Object.values(counts).reduce((a,b)=>a+b,0);
  return {recorded,counts,html:`<div class="card record-summary" id="daily-record-summary" role="status"><h2>${items.length&&recorded===items.length?'今日の運動の様子を記録しました':'今日の記録'}</h2><p>${items.length}種目中 ${recorded}種目を記録${recorded<items.length?`（未記録 ${items.length-recorded}種目）`:''}</p><p>${Object.entries(counts).filter(([,n])=>n).map(([key,n])=>`${statusLabels[key]} ${n}種目`).join(' ／ ')||'実施状況を選ぶと、この端末に保存されます。'}</p>${items.length&&recorded===items.length?'<p>記録は保存済みです。ここで閉じて大丈夫です。</p>':''}<p class="hint">痛みとメモは任意です。休んだ日も、そのまま記録してください。</p></div>`};
}
function renderToday(){
  if(storageBlocked){$('today-content').innerHTML=storageConflict?'<div class="card">別の画面で更新されています。<button class="btn btn-pri" onclick="location.reload()">最新の保存内容を読み直す</button></div>':'<div class="card">保存データの確認が必要です。元データは保持されています。</div>';return;}
  if(!S){$('today-content').innerHTML='<div class="card empty"><div class="welcome-icon">🌱</div><h2>毎日のリハビリを、少しずつ。</h2><p>担当の理学療法士からメニューを受け取りましょう。</p><button class="btn btn-pri" onclick="startQrScan()">設定QRを読み取る</button><button class="btn btn-out" onclick="openPinModal()">スタッフ：メニューを設定</button></div>';return;}
  const key=todayKey(),dow=new Date().getDay(),log=getLog(key),items=todayExercises(dow),c=getCompletion(key,dow),before=key<S.startDate,summary=recordSummary(items,log);
  let h=`<div class="banner"><div class="banner-d">${fmtJ(new Date())}</div><div class="banner-msg">${escapeHtml(S.patientName||'患者')}さんのペースで、続けましょう。</div></div>`;
  if(S.plans.some(p=>p.from>key))h+=`<div class="notice">現在の設定は${S.menu.length}種目です。本日は記録済みの${items.length}種目を表示し、更新は明日から反映します。今日から変更する場合は、セラピストモードの「今日から反映」を選んでください。</div>`;
  h+=`<div class="card"><div class="comp-bar"><div class="comp-pct record-count">${summary.recorded}<small> / ${items.length} 記録</small></div><div class="comp-d"><div class="comp-lbl">${before?'開始日は '+escapeHtml(S.startDate):!c.total?'今日は休養日です':`今日のできた種目 ${c.done} / ${c.total}`}</div><div class="bar-bg"><div class="bar-fg" style="width:${c.pct}%"></div></div></div></div><div class="hint">痛みで休んだことも、大切な記録です。</div></div>`;
  for(const [i,ex] of items.entries()){
    const media=mediaFor(ex),st=log.status?.[ex.id]||(log.done?.[ex.id]?'done':'');
    h+=`<article class="card exercise-card"><div class="exercise-top"><div><span class="eyebrow">運動 ${i+1}</span><h2>${escapeHtml(ex.name)}</h2><div class="dose">${escapeHtml(doseSummary(ex))}</div></div>${media?`<button class="image-button" onclick="showExercise(${i})" aria-label="${escapeAttr(ex.name)}のイラストと手順"><img src="assets/exercises/${media.image}" alt="${escapeAttr(media.name)}" loading="lazy"></button>`:''}</div><button class="btn btn-out guide-button" onclick="showExercise(${i})">${media?'イラスト・手順・自分の動画':'やり方・注意点・自分の動画'}</button>`;
    h+=`<details class="home-prescription"><summary>あなたの回数・曜日・注意を確認</summary>${prescriptionHtml(ex)}</details>${exerciseNotices(ex,media)}`;
    h+=`<label class="fld-lbl" for="status-${i}">今日の実施状況</label><select id="status-${i}" class="fld-inp status-select ${st==='done'?'is-done':''}" onchange="setExerciseStatus(${i},this.value)"><option value="">未記録</option>${Object.entries(statusLabels).map(([v,label])=>`<option value="${v}" ${st===v?'selected':''}>${label}</option>`).join('')}</select></article>`;
  }
  h+=summary.html;
  if(!before){
    h+=`<div class="card"><div class="card-ttl">今日の痛み（0〜10）</div><p class="hint">0＝痛みなし、10＝想像できる最も強い痛み。毎回、担当の理学療法士と決めた同じ場面で記録してください。</p><p class="hint">記録する場面：${escapeHtml(S.painContext||'未設定。安静時・歩く時など、どの場面を記録するか担当者に確認してください')}</p><div class="pain-value" id="pain-value">${log.vas===null?'未記録':log.vas+' / 10'}</div><div class="pain-options" role="group" aria-label="痛みの強さ">${Array.from({length:11},(_,v)=>`<button type="button" aria-pressed="${log.vas===v}" class="pain-choice ${log.vas===v?'selected':''}" onclick="saveVas(${v})">${v}</button>`).join('')}</div><button class="text-button" onclick="clearPain()">痛みを未記録に戻す</button></div><div class="card"><label class="card-ttl" for="note-ta">メモ</label><textarea class="note-ta" id="note-ta" maxlength="2000" placeholder="気づいたことや、休んだ理由など" oninput="saveNote(this.value)">${escapeHtml(log.note||'')}</textarea><div class="hint">入力すると自動で保存します。</div></div>`;
  }
  h+=safetyHtml();
  h+='<div class="card"><p class="hint">記録はこの端末に保存されます。院内への自動送信はありません。</p><button class="btn btn-out" onclick="showReceiveSettings()">メニュー更新・QR読込</button><button class="btn btn-out" onclick="exportPatientData()">自分の記録をバックアップ</button></div>';
  $('today-content').innerHTML=h;
}
function setExerciseStatus(i,value){
  if(activeDay!==todayKey()){refreshDay();toast('日付が変わりました。内容を確認して記録してください');return;}
  if(value&&!statusLabels[value])return;
  const ex=todayExercises(new Date().getDay())[i];if(!ex)return;
  const log=writableLog();log.status[ex.id]=value;log.done[ex.id]=value==='done';saveLogs();renderToday();toast('記録しました');
}
function saveVas(v){const log=writableLog();const value=Number(v);if(!Number.isInteger(value)||value<0||value>10)return;log.vas=value;saveLogs();renderToday();toast(value===0?'痛みなしを記録しました':'痛みを記録しました');}
function clearPain(){const log=writableLog();log.vas=null;saveLogs();renderToday();}
function saveNote(v){const log=writableLog();log.note=String(v).slice(0,2000);saveLogs();}
function showExercise(i){
  const ex=todayExercises(new Date().getDay())[i];if(!ex)return;showGuide(ex);
}
function showGuide(ex){
  const media=mediaFor(ex),url=C.videoUrl(ex.videoUrl);
  modal('guideModal',escapeHtml(ex.name),`${exerciseNotices(ex,media)}${prescriptionHtml(ex)}${safetyHtml(true)}${media?`<div class="exercise-preparation"><p><strong>この運動の目的：</strong>${escapeHtml(media.purpose||'担当の理学療法士に確認してください')}</p><p><strong>用意するもの：</strong>${escapeHtml(media.equipment||'担当の理学療法士に確認してください')}</p></div><img class="guide-image" src="assets/exercises/${media.image}" alt="${escapeAttr(media.name)}の姿勢">${media.imageCaption?`<p class="hint">${escapeHtml(media.imageCaption)}</p>`:''}<ol class="steps">${media.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ol>`:''}${ex.id?'<section id="patient-video"></section>':''}${consultationHtml()}${url?`<a class="btn btn-out" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">担当の理学療法士が登録した動画を見る ↗</a>`:''}${media?`<details class="source-note"><summary>説明の参考資料</summary><a href="${escapeAttr(media.source)}" target="_blank" rel="noopener noreferrer">医療機関の運動解説（英語）↗</a><p>イラストは説明用です。左右・動かす範囲・負荷はあなたへの指示を優先してください。</p></details>`:''}<button id="guide-return" class="btn btn-pri" onclick="closeModal('guideModal')">元の画面へ戻る</button>`);
  PatientVideo.mount(ex);
}
const modalOrigins=new Map();
let overlayScrollState=null;
function closeModal(id){$(id)?.remove();syncOverlayState();}
function syncOverlayState(){
  const visible=!!document.querySelector('.t-overlay.on');
  if(visible&&!overlayScrollState){
    overlayScrollState={y:window.scrollY,position:document.body.style.position,top:document.body.style.top,width:document.body.style.width};
    document.body.style.position='fixed';document.body.style.top=`-${overlayScrollState.y}px`;document.body.style.width='100%';
  }else if(!visible&&overlayScrollState){
    const old=overlayScrollState;overlayScrollState=null;
    document.body.style.position=old.position;document.body.style.top=old.top;document.body.style.width=old.width;
    window.scrollTo({top:old.y,behavior:'instant'});
  }
  for(const [node,origin] of modalOrigins){if(!node.isConnected){modalOrigins.delete(node);if(origin?.isConnected)origin.focus({preventScroll:true});}}
}
new MutationObserver(syncOverlayState).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
function modal(id,title,body){
  closeModal(id);const origin=document.activeElement;
  const wrap=document.createElement('div');wrap.id=id;wrap.className='t-overlay on dynamic-dialog';wrap.setAttribute('role','dialog');wrap.setAttribute('aria-modal','true');wrap.setAttribute('aria-labelledby',id+'-title');
  wrap.innerHTML=`<div class="t-modal"><div class="t-hd"><h2 id="${id}-title">${title}</h2><button class="t-close" aria-label="閉じる" onclick="closeModal('${id}')">×</button></div>${body}</div>`;
  modalOrigins.set(wrap,origin);document.body.appendChild(wrap);syncOverlayState();wrap.querySelector('button')?.focus({preventScroll:true});
}
document.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;
  const dialogs=[...document.querySelectorAll('.t-overlay.on')].sort((a,b)=>Number(getComputedStyle(a).zIndex)-Number(getComputedStyle(b).zIndex));
  const top=dialogs.at(-1);if(!top)return;
  const controls=[...top.querySelectorAll('button,a[href],input,select,textarea,summary,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
  const first=controls[0],last=controls.at(-1);if(!first)return;
  if(e.shiftKey&&(document.activeElement===first||!top.contains(document.activeElement))){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&(document.activeElement===last||!top.contains(document.activeElement))){e.preventDefault();first.focus();}
});
function renderCalendar(){
  const y=calDate.getFullYear(),m=calDate.getMonth();let h=`<div class="card"><div class="cal-hd"><button class="cal-btn" aria-label="前の月" onclick="calNav(-1)">‹</button><div class="cal-mo">${y}年${m+1}月</div><button class="cal-btn" aria-label="次の月" onclick="calNav(1)">›</button></div><div class="cal-grid">${DOW_LABEL.map(x=>`<div class="cal-wlbl">${x}</div>`).join('')}`;
  for(let i=0;i<new Date(y,m,1).getDay();i++)h+='<div></div>';
  for(let d=1;d<=new Date(y,m+1,0).getDate();d++){
    const date=new Date(y,m,d),key=dk(date),c=getCompletion(key,date.getDay()),log=getLog(key);
    h+=`<button class="cal-day ${key===todayKey()?'today':''} ${c.done&&c.pct===100?'done':c.done?'partial':''}" onclick="calSelect('${key}')" aria-label="${key} ${percentText(c)}">${d}${log.vas!==null?`<span class="cal-vas">${log.vas}</span>`:''}${c.done?'<span class="cal-dot full"></span>':''}</button>`;
  }
  h+='</div></div>';
  if(calSelectedKey){
    const k=calSelectedKey,log=getLog(k),items=C.menuAt(S,L,k,parseDate(k).getDay()),c=getCompletion(k,parseDate(k).getDay());
    h+=`<div class="card"><h2>${fmtJ(parseDate(k))}</h2><p>${k>todayKey()?'予定':percentText(c)}</p>`;
    if(log.legacyUnknown)h+='<div class="notice">旧版の記録です。当時のメニューが保存されていないため、達成率は計算しません。痛み・メモ・元のチェック記録は保持しています。</div>';
    if(log.legacyOriginal){const old=log.legacyOriginal;h+=`<details class="source-note"><summary>旧版から引き継いだ変更前の記録</summary><p>痛み：${old.vas===null?'未記録':old.vas+' / 10'}</p><p class="history-note">${escapeHtml(old.note)}</p>${[...new Set([...Object.keys(old.done||{}),...Object.keys(old.status||{})])].map(id=>`<p>${escapeHtml(id)}：${statusLabels[old.status?.[id]]||(old.done?.[id]?'できた':'未記録')}</p>`).join('')}<p>当時の種目名と対応が確認できない記録は元の種目IDで表示しています。</p></details>`;}
    for(const ex of items){const status=log.status?.[ex.id]||(log.done?.[ex.id]?'done':'');h+=`<p class="history-row">${escapeHtml(ex.name)}<strong>${statusLabels[status]||'未記録'}</strong></p>`;}
    for(const [i,revision] of (log.menuRevisions||[]).entries())h+=`<details class="source-note"><summary>当日の変更前の記録 ${i+1}</summary>${revision.menuSnapshot.map(ex=>`<section><p>${escapeHtml(ex.name)}：${statusLabels[revision.status[ex.id]]||(revision.done[ex.id]?'できた':'未記録')}</p>${prescriptionHtml(ex)}</section>`).join('')}</details>`;
    h+=`<p>痛み：${log.vas===null?'未記録':log.vas+' / 10'}</p><p class="history-note">${escapeHtml(log.note)}</p></div>`;
  }$('cal-content').innerHTML=h;
}
function calNav(n){calDate=new Date(calDate.getFullYear(),calDate.getMonth()+n,1);calSelectedKey=null;renderCalendar();}
function weekly(){let done=0,total=0;for(let i=0;i<7;i++){const d=addDays(new Date(),-i),c=getCompletion(dk(d),d.getDay());if(c.unknown)continue;done+=c.done;total+=c.total;}return{done,total,pct:total?Math.round(done/total*100):null};}
function renderProgress(){
  if(!S){$('prog-content').innerHTML='<div class="card empty">メニューを設定してください。</div>';return;}
  const w=weekly(),points=[];for(let i=29;i>=0;i--){const d=addDays(new Date(),-i),log=getLog(dk(d));if(log.vas!==null)points.push({d,val:log.vas});}
  $('prog-content').innerHTML=`<div class="card"><h2>続けた記録</h2><div class="statgrid"><div class="statitem"><div class="statval">${calcStreak()}</div><div class="statlbl">連続実施日数<br>休養日は除く</div></div><div class="statitem"><div class="statval">${w.pct===null?'—':w.pct+'%'}</div><div class="statlbl">直近7日の達成率</div></div><div class="statitem"><div class="statval">${dayCount()}</div><div class="statlbl">開始からの日数</div></div></div><p class="hint">開始前・休養日・当時のメニューが不明な日は計算から除きます。</p></div><div class="card"><h2>痛みの推移</h2><p class="hint">過去30日。未記録の日は点を表示しません。</p>${points.length?renderVasSvg(points):'<p class="empty">痛みの記録はまだありません。</p>'}</div>${S.nextVisit?`<div class="card"><h2>次回の予定</h2><p>${escapeHtml(S.nextVisit)}</p></div>`:''}<div class="card"><button class="btn btn-pri" onclick="showReport()">来院時に見せるレポート</button><button class="btn btn-out" onclick="exportPatientData()">自分の記録をバックアップ</button></div><div class="notice">記録はこの端末内に保存されています。スマホの変更やブラウザデータ削除の前にバックアップしてください。</div>`;
}
function renderVasSvg(points){
  const first=parseDate(dk(addDays(new Date(),-29))).getTime(),range=29*86400000;
  const pts=points.map(p=>({...p,x:28+(parseDate(dk(p.d)).getTime()-first)/range*274,y:116-p.val*10}));
  return `<svg viewBox="0 0 320 145" role="img" aria-label="過去30日の日付に沿った痛みの推移">${[0,5,10].map(v=>`<line x1="28" x2="302" y1="${116-v*10}" y2="${116-v*10}" stroke="#dbe4ec"/><text x="10" y="${120-v*10}" font-size="10">${v}</text>`).join('')}${pts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="4" fill="#2e7d8a"><title>${dk(p.d)}：${p.val}</title></circle>`).join('')}<text x="28" y="139" font-size="10">${dk(new Date(first)).slice(5)}</text><text x="265" y="139" font-size="10">${todayKey().slice(5)}</text></svg>`;
}
function showReport(){
  let rows='';for(let i=29;i>=0;i--){const d=addDays(new Date(),-i),key=dk(d),c=getCompletion(key,d.getDay()),l=getLog(key);if(key<S.startDate||(!c.total&&!L[key]))continue;const reason=Object.values(l.status||{}).filter(x=>x&&x!=='done').map(x=>statusLabels[x]).join('、');rows+=`<tr><td>${key.slice(5)}</td><td>${percentText(c)}${c.total?` (${c.done}/${c.total})`:''}</td><td>${l.vas===null?'—':l.vas}</td><td>${escapeHtml([reason,l.note].filter(Boolean).join('／'))}</td></tr>`;}
  modal('reportModal','来院時のリハビリ記録',`<p>${escapeHtml(S.patientName||'患者')}さん ／ 過去30日</p><div class="report-scroll"><table class="report-table"><thead><tr><th>日付</th><th>実施</th><th>痛み</th><th>メモ・休んだ理由</th></tr></thead><tbody>${rows}</tbody></table></div><button class="btn btn-out" onclick="window.print()">印刷・PDFに保存</button>`);
}

function checkPin(){if($('pin-input').value===localPin){staffUnlocked=true;closePinModal();openTherapist();}else toast('PINが違います');}
function requireStaff(){if(!staffUnlocked){openPinModal();return false;}return true;}
function openTherapist(){
  if(!requireStaff()||storageBlocked)return;
  if(!S){S=C.settings({menu:[],startDate:todayKey(),knownSince:todayKey()},uid(),todayKey());persist();}
  $('setupOverlay').hidden=true;renderTherapist();$('therapistModal').classList.add('on');
}
function closeTherapist(){staffUnlocked=false;$('therapistModal').classList.remove('on');renderHeader();renderToday();}
function updS(field,val){
  if(!requireStaff())return;
  if(field==='passcode'){if(val&&!/^\d{4,6}$/.test(val)){toast('PINは4〜6桁の数字です');renderTherapist();return;}localPin=val;}
  else if(['patientName','chartId','age','diagnosis','therapistName'].includes(field))S[field]=C.text(val,field==='age'?3:['patientName','chartId'].includes(field)?80:120);
  else if(['painContext','consultContact','restartInstructions'].includes(field))S[field]=C.text(val,500);
  else if(['startDate','nextVisit'].includes(field)){if(val&&!C.validDate(val)){toast('日付を確認してください');return;}if(field==='startDate'&&Object.keys(L).length){toast('記録後の開始日は変更できません');renderTherapist();return;}S[field]=val|| (field==='startDate'?todayKey():'');if(field==='startDate'){S.knownSince=S.startDate;S.plans=[{from:S.startDate,menu:C.clone(S.menu)}];}}
  persist();renderHeader();if($('patient-identity-summary'))$('patient-identity-summary').textContent=[S.chartId,S.patientName].filter(Boolean).join(' / ')||'未入力';
}
function dateField(id,field,label,value,disabled=false){
  return `<div class="fld"><label class="fld-lbl" for="${id}">${label}</label><div class="date-control ${disabled?'is-disabled':''}"><span class="date-display" id="${id}-display" aria-hidden="true">${escapeHtml(value?value.replaceAll('-',' / '):'日付を選択')}</span><span class="date-icon" aria-hidden="true">▦</span><input id="${id}" class="date-native" type="date" value="${escapeAttr(value)}" ${disabled?'disabled':''} onclick="openDatePicker(this)" onchange="saveDateField('${field}',this)"></div>${field==='nextVisit'?`<button type="button" class="text-button" onclick="clearNextVisit()">次回来院日を未設定にする</button>`:''}</div>`;
}
function openDatePicker(input){try{if(typeof input.showPicker==='function')input.showPicker();}catch{ /* Native touch/focus behavior remains available. */ }}
function syncDateFields(){
  for(const [id,field] of [['start-date','startDate'],['next-visit','nextVisit']]){
    if($(id))$(id).value=S[field]||'';
    if($(id+'-display'))$(id+'-display').textContent=S[field]?S[field].replaceAll('-',' / '):'日付を選択';
  }
}
function saveDateField(field,input){try{updS(field,input.value);}finally{syncDateFields();}}
function clearNextVisit(){if(!requireStaff())return;try{updS('nextVisit','');}finally{syncDateFields();}}
function menuTimingNotice(){
  const count=todayExercises(new Date().getDay()).length;
  return `<div class="notice">患者画面の本日の対象：${count}種目（実施曜日を反映）。${S.plans.some(p=>p.from>todayKey())?'保存した変更は明日から反映されます。<button type="button" id="apply-menu-today" class="btn btn-out" onclick="applyCurrentMenuToday()">保存したメニューを今日から反映</button>':''}</div>`;
}
function applyCurrentMenuToday(){
  if(!requireStaff())return;
  if(!confirm(`保存した${S.menu.length}種目のメニューを今日から反映しますか？\n本日は実施曜日に合う種目を表示します。内容・回数が同じ種目の実施状況と、痛み・メモを引き継ぎます。変更前の実施記録はカレンダーに残します。`))return;
  try{C.applyMenuToday(S,L,todayKey(),new Date().getDay());persist();renderTherapist();renderToday();if($('tab-cal').classList.contains('active'))renderCalendar();if($('tab-prog').classList.contains('active'))renderProgress();toast('保存したメニューを今日から反映しました');}
  catch(e){alert(e.message);}
}
function patientSafetyFields(){
  const fields={painContext:'痛みの数字を記録する場面（例：歩く時・運動前）',consultContact:'相談先・連絡方法（受付時間など）',restartInstructions:'中止後の再開についての個別指示'};
  return `<fieldset><legend>患者さんへの相談・再開の案内</legend><p class="hint">患者さんに共有されます。共通の中止案内に加えて必要な指示を記入してください。個人の秘密情報は入力しないでください。</p>${Object.entries(fields).map(([field,label])=>`<label class="fld-lbl" for="safety-${field}">${label}</label><textarea class="fld-inp" id="safety-${field}" maxlength="500" onchange="updS('${field}',this.value)">${escapeHtml(S[field]||'')}</textarea>`).join('')}</fieldset>`;
}
function renderTherapist(){
  if(!S)return;const all=getAllTemplates();
  $('therapist-content').innerHTML=`<div class="notice">患者さんの状態に合わせて種目・回数を選び、院内で動作を確認してからお渡しください。</div><button class="btn btn-out" onclick="newPatient()">新しい処方を作る（別の患者・別の部位）</button><details class="pt-details" id="patient-info"><summary>患者ID・患者名など（任意）<br><span id="patient-identity-summary">${escapeHtml([S.chartId,S.patientName].filter(Boolean).join(" / ")||"未入力")}</span></summary><p class="hint">空欄のまま運動を渡せます。入力内容はこの端末とバックアップに保存され、電子カルテへはまだ連携しません。</p><div class="t-sec"><div class="t-sec-ttl">患者情報（この端末内）</div><div class="fld"><label for="patient-chart-id" class="fld-lbl">患者ID・カルテ番号（任意）</label><input id="patient-chart-id" class="fld-inp" value="${escapeAttr(S.chartId||'')}" maxlength="80" autocomplete="off" onchange="updS('chartId',this.value)"></div><div class="fld"><label for="patient-name" class="fld-lbl">患者名・呼び名（任意）</label><input id="patient-name" class="fld-inp" value="${escapeAttr(S.patientName)}" maxlength="80" onchange="updS('patientName',this.value)"></div><div class="fld"><label for="diagnosis" class="fld-lbl">診断名</label><input id="diagnosis" class="fld-inp" value="${escapeAttr(S.diagnosis)}" onchange="updS('diagnosis',this.value)"></div><div class="fld-row">${dateField('start-date','startDate','開始日',S.startDate,Object.keys(L).length>0)}${dateField('next-visit','nextVisit','次回来院日',S.nextVisit)}</div><div class="fld"><label class="fld-lbl" for="therapist-name">担当PT</label><input id="therapist-name" class="fld-inp" value="${escapeAttr(S.therapistName)}" onchange="updS('therapistName',this.value)"></div>${patientSafetyFields()}<div class="hint">アプリ内部の処方識別ID：${escapeHtml(S.patientId)}</div></div></details><div class="t-sec"><div class="t-sec-ttl">処方メニュー ${S.menu.length}種目</div>${menuTimingNotice()}${typeof ExerciseSelection!=='undefined'?ExerciseSelection.warnings(S.menu.map(ex=>ex.exerciseKey).filter(Boolean)):''}${S.menu.map((ex,i)=>`<div class="menu-item"><div class="menu-item-hd"><div class="menu-item-nm">${escapeHtml(ex.name)}</div><button type="button" class="evidence-button" onclick="showExerciseEvidence(S.menu[${i}],S.template)">参考資料</button><button class="menu-item-btn" aria-label="編集" onclick="editEx(${i})">✏</button><button class="menu-item-btn" aria-label="削除" onclick="delEx(${i})">×</button></div><div class="menu-item-pm">${escapeHtml(ex.params||prescriptionSummary(C.prescription(ex.prescription)))} ／ ${ex.dows.length?ex.dows.map(d=>DOW_LABEL[d]).join('・'):'毎日'}</div>${C.prescriptionIssues(ex).length?`<p class="hint">個別指示の確認が必要：${escapeHtml(C.prescriptionIssues(ex).join('・'))}</p>`:''}</div>`).join('')}<button class="btn btn-out" onclick="openExerciseCatalog()">＋ 運動を選んで追加</button><details class="pt-details"><summary>運動セット・独自種目</summary><button class="btn btn-out" onclick="editEx(-1)">独自の種目を入力</button><button class="btn btn-out" onclick="saveCurrentAsTemplate()">現在のメニューをテンプレート保存</button><button class="btn btn-out" onclick="showTemplateManagement()">テンプレートの共有・削除</button></details></div><div class="t-sec"><div class="t-sec-ttl">患者さんへ渡す</div><p class="hint">QRにカルテ番号・氏名・年齢・診断名・PINは含めません。設定した運動・注意文は含まれるため、本人へ直接お渡しください。</p><button class="btn btn-pri" onclick="showShareQR()">患者に渡す（QR・URL）</button><button class="btn btn-out" onclick="openExercisePrint()">紙で渡す（印刷・最大6種目）</button><button class="btn btn-out" onclick="showInstallQR()">アプリ追加用QR（共通）</button></div><div id="exercise-catalog"><div class="t-sec"><div class="t-sec-ttl">疾患別メニューから選ぶ</div><div class="video-actions"><button class="btn btn-out" id="catalog-general" onclick="setCatalogAudience(false)" aria-pressed="true">一般向け</button><button class="btn btn-out" id="catalog-athlete" onclick="setCatalogAudience(true)" aria-pressed="false">アスリート向け</button></div><p class="hint" id="catalog-athlete-note" hidden>保存療法・運動許可後の候補です。完了は競技復帰の許可を意味しません。</p><div class="tpl-grid">${Object.entries(all).map(([k,t])=>`<button data-athlete="${t.audience==='athlete'}" ${t.audience==='athlete'?'hidden':''} class="tpl-card" onclick="applyTemplate('${k}',S.menu.length?'append':'replace')"><div class="tpl-ico">${escapeHtml(t.icon)}</div><div class="tpl-nm">${escapeHtml(t.name)}</div><div class="tpl-desc">${escapeHtml(t.desc)}</div></button>`).join('')}</div></div></div><details class="pt-details"><summary>端末設定・バックアップ</summary><div class="t-sec"><div class="t-sec-ttl">端末の誤操作防止PIN</div><input aria-label="端末のPIN" class="fld-inp" type="password" inputmode="numeric" maxlength="6" value="${escapeAttr(localPin)}" onchange="updS('passcode',this.value)"><p class="hint">4〜6桁。空欄で無効。この端末だけの簡易ロックで、本人認証ではありません。</p></div><div class="t-sec"><div class="t-sec-ttl">保存・復元</div><button class="btn btn-out" onclick="exportData()">端末全体をバックアップ</button><button class="btn btn-out" onclick="document.getElementById('restore-file').click()">バックアップを復元</button><input id="restore-file" type="file" accept=".json" hidden onchange="importData(event)"><button class="btn btn-out" onclick="showArchives()">退避した患者記録（${archives.length}件）</button><button class="btn btn-danger" onclick="resetAll()">この患者のデータを削除</button></div></details>`;
  if(!S.menu.length)$('patient-info').after($('exercise-catalog'));
}
function openExerciseCatalog(){
  if(!requireStaff())return;
  $('exercise-catalog').scrollIntoView({block:'start',behavior:'smooth'});
}
let selectedTemplate=null,templateMode='replace';
function standardPrescription(ex,kind='default'){
  const same=m=>!!m&&(ex.exerciseKey?m.exerciseKey===ex.exerciseKey:!m.exerciseKey&&m.name===ex.name);
  const saved=kind==='default'?Object.entries(T).filter(([k])=>k.startsWith('doseDefault_')).map(([,t])=>t.menu[0]).find(same):null;
  const builtIn=typeof PRESCRIPTION_DEFAULTS!=='undefined'?PRESCRIPTION_DEFAULTS[ex.exerciseKey]:null;
  if(saved)return {...C.clone(saved),defaultNote:'この端末で保存した標準指示を入れています。患者さんに合わせて確認してください。',scheduleConfirmed:false};
  if(!builtIn)return null;
  return {prescription:C.prescription(builtIn.prescription),dows:[...builtIn.dows],scheduleConfirmed:false,defaultNote:builtIn.note,defaultSource:builtIn.source};
}
function initialPrescriptionDraft(ex,disease){
  const standard=standardPrescription(ex);if(!standard)return ex;
  const result={...ex,prescription:standard.prescription,dows:standard.dows,scheduleConfirmed:false,defaultNote:standard.defaultNote,defaultSource:standard.defaultSource};
  // Injury-specific range and loading permission must not be borrowed from another diagnosis.
  if(DISEASE_LIBRARY[disease]?.audience==='athlete'||['anteriorShoulderDislocation','rotatorCuffTear','slapLesion'].includes(disease)){
    result.prescription.load='';result.defaultNote+=' この疾患では、医師の許可と動かす範囲・負荷を個別に入力してください。';
  }
  return result;
}
function prescriptionFields(prefix,ex={}){
  const p=C.prescription(ex.prescription);
  return `<fieldset id="${prefix}-prescription"><legend>患者さんへの個別指示</legend>${ex.defaultNote?`<div class="notice"><strong>標準指示のたたき台</strong><p>${escapeHtml(ex.defaultNote)}</p>${ex.defaultSource?`<a href="${escapeAttr(ex.defaultSource)}" target="_blank" rel="noopener noreferrer">参考資料</a>`:''}</div>`:''}<div class="dose-reuse"><button type="button" class="btn btn-out" onclick="reusePrescription('${prefix}','default')">標準指示を入れる</button><button type="button" class="btn btn-out" onclick="reusePrescription('${prefix}','previous')">この患者の前回指示を使う</button></div><p class="hint">タップで選択できます。左右や負荷は患者さんに合わせて確認してください。両側に行う場合は「左右各○回」を選べます。</p>${Object.entries(C.prescriptionLabels).map(([k,label])=>`<details class="dose-field" ${!p[k]?'open':''}><summary id="${prefix}-${k}-summary">${escapeHtml(label)}：${escapeHtml(p[k]||'選択してください')}</summary><span id="${prefix}-${k}-label" class="fld-lbl">${label}</span><div class="dose-options" role="group" aria-labelledby="${prefix}-${k}-label">${prescriptionChoices[k].map((value,i)=>`<button type="button" class="dose-choice" data-dose-key="${k}" data-dose-index="${i}" aria-pressed="${p[k]===value}" onclick="choosePrescription('${prefix}','${k}',${i})">${escapeHtml(value)}</button>`).join('')}</div><details class="dose-custom" ${p[k]&&!prescriptionChoices[k].includes(p[k])?'open':''}><summary>その他・自由入力 <span id="${prefix}-${k}-custom-value">${p[k]&&!prescriptionChoices[k].includes(p[k])?escapeHtml(p[k]):''}</span></summary><label class="fld-lbl" for="${prefix}-${k}">${label}を入力</label><input id="${prefix}-${k}" class="fld-inp" maxlength="120" value="${escapeAttr(p[k])}" oninput="syncPrescriptionChoices('${prefix}')"></details></details>`).join('')}<details class="dose-schedule"><summary>実施曜日：${ex.dows?.length?ex.dows.map(d=>DOW_LABEL[d]).join('・'):'毎日'}（変更）</summary><p>実施曜日</p><button type="button" class="text-button" onclick="setEveryday('${prefix}')">毎日を選ぶ</button><div class="day-options">${DOW_LABEL.map((label,i)=>`<label><input id="${prefix}-day-${i}" type="checkbox" ${(ex.dows||[]).includes(i)?'checked':''} onchange="document.getElementById('${prefix}-schedule-confirmed').checked=false;syncScheduleSummary('${prefix}')">${label}</label>`).join('')}</div><p class="hint">曜日が未選択の場合は毎日です。両側で回数が異なる場合などは自由入力で指定してください。</p></details><input id="${prefix}-schedule-confirmed" type="checkbox" hidden ${ex.scheduleConfirmed?'checked':''}><p class="hint">保存ボタンで、表示した左右・回数・負荷・曜日をこの患者さんの指示として確定します。</p><button type="button" class="text-button" onclick="savePrescriptionDefault('${prefix}')">この内容を種目の標準指示として保存</button><p class="hint">先生が保存した標準指示を優先して呼び出します。患者には確認・保存後に反映されます。</p></fieldset>`;
}
const prescriptionChoices={side:['右','左','両側','該当なし'],repetitions:['5回','10回','左右各5回','左右各10回','該当なし'],sets:['1セット','2セット','3セット','該当なし'],hold:['該当なし','3秒','5秒','10秒','20秒','30秒'],frequency:['1日1回','1日2回','1日3回'],load:['重りなし','軽い力','該当なし'],support:['支え不要','安定した台につかまる','家族の見守り','該当なし']};
function showPrescriptionErrors(prefix,name){
  const root=$(prefix+'-prescription');if(!root)return;
  const row=root.closest('.template-ex');
  // A selected exercise can be hidden by a search or purpose filter.
  if(row?.hidden){
    for(const id of ['template-purpose','template-level','template-search'])$(id).value='';
    filterTemplateExercises();
  }
  let first=null;
  for(const [key,label] of Object.entries(C.prescriptionLabels)){
    const input=$(prefix+'-'+key),field=input.closest('.dose-field'),errorId=prefix+'-'+key+'-error';
    $(errorId)?.remove();input.removeAttribute('aria-invalid');input.removeAttribute('aria-describedby');field.classList.remove('dose-error');
    if(input.value.trim())continue;
    field.open=true;field.classList.add('dose-error');input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby',errorId);
    const error=document.createElement('p');error.id=errorId;error.className='dose-error-message';error.setAttribute('role','alert');
    error.textContent=`${name}：${label}が未設定です。選択または入力してください。`;
    const summary=$(prefix+'-'+key+'-summary');summary.after(error);first??=summary;
  }
  if(first){
    for(let parent=first.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
    first.focus({preventScroll:true});first.scrollIntoView({block:'center',behavior:'instant'});
  }
}
function syncPrescriptionChoices(prefix){
  const root=$(prefix+'-prescription');if(!root)return;
  for(const [key,choices] of Object.entries(prescriptionChoices)){
    const value=$(prefix+'-'+key).value;
    root.querySelectorAll(`[data-dose-key="${key}"]`).forEach(button=>button.setAttribute('aria-pressed',String(value===choices[Number(button.dataset.doseIndex)])));
    $(prefix+'-'+key+'-custom-value').textContent=value&&!choices.includes(value)?value:'';
    $(prefix+'-'+key+'-summary').textContent=C.prescriptionLabels[key]+'：'+(value||'選択してください');
    if(value.trim()){
      const input=$(prefix+'-'+key);input.removeAttribute('aria-invalid');input.removeAttribute('aria-describedby');
      input.closest('.dose-field').classList.remove('dose-error');$(prefix+'-'+key+'-error')?.remove();
    }
  }
  $(prefix+'-schedule-confirmed').checked=false;
  syncScheduleSummary(prefix);
}
function syncScheduleSummary(prefix){
  const days=Array.from({length:7},(_,i)=>i).filter(i=>$(prefix+'-day-'+i).checked);
  $(prefix+'-prescription').querySelector('.dose-schedule>summary').textContent='実施曜日：'+(days.length?days.map(d=>DOW_LABEL[d]).join('・'):'毎日')+'（変更）';
  if(prefix.startsWith('dose-'))updateCandidateDose(Number(prefix.slice(5)));
}
function choosePrescription(prefix,key,index){
  if(!requireStaff()||!prescriptionChoices[key]?.[index])return;
  $(prefix+'-'+key).value=prescriptionChoices[key][index];
  $(prefix+'-'+key).closest('details').open=false;syncPrescriptionChoices(prefix);
}
function setEveryday(prefix){if(!requireStaff())return;for(let i=0;i<7;i++)$(prefix+'-day-'+i).checked=false;$(prefix+'-schedule-confirmed').checked=false;syncScheduleSummary(prefix);}
function prescriptionExercise(prefix){
  return prefix==='ee'?{name:$('ee-name').value.trim(),exerciseKey:$('ee-image').value}:getAllTemplates()[selectedTemplate]?.menu[Number(prefix.replace('dose-',''))];
}
function reusePrescription(prefix,kind){
  if(!requireStaff())return;const ex=prescriptionExercise(prefix);if(!ex)return;
  const same=m=>!!m&&(ex.exerciseKey?m.exerciseKey===ex.exerciseKey:!m.exerciseKey&&m.name===ex.name);
  let saved=kind==='default'?standardPrescription(ex):S.menu.find(same);
  if(saved&&kind==='default'&&prefix!=='ee')saved=initialPrescriptionDraft(ex,templateMode==='append'&&['anteriorShoulderDislocation','rotatorCuffTear','slapLesion'].includes(S.template)?S.template:selectedTemplate);
  if(saved&&kind==='default'&&prefix==='ee'&&['anteriorShoulderDislocation','rotatorCuffTear','slapLesion'].includes(S.template)){saved.prescription.load='';}
  if(!saved){toast(kind==='default'?'この種目の標準指示は未保存です':'この患者の同じ種目の指示はありません');return;}
  const current=readPrescription(prefix);
  if(Object.values(current.prescription).some(Boolean)&&!confirm('入力中の個別指示と曜日を置き換えますか？ 補足・注意文はそのまま残します。'))return;
  for(const key of Object.keys(prescriptionChoices)){$(prefix+'-'+key).value=saved.prescription?.[key]||'';$(prefix+'-'+key).closest('details').open=!!saved.prescription?.[key]&&!prescriptionChoices[key].includes(saved.prescription[key]);}
  for(let i=0;i<7;i++)$(prefix+'-day-'+i).checked=saved.dows.includes(i);
  syncPrescriptionChoices(prefix);toast('指示をコピーしました。患者さんに合わせて確認してください');
}
function savePrescriptionDefault(prefix){
  if(!requireStaff())return;const ex=prescriptionExercise(prefix),dose=readPrescription(prefix,true),issues=C.prescriptionIssues(dose);
  if(!ex?.name||issues.length){toast('種目名と未設定の個別指示を入力してください');if(issues.length)showPrescriptionErrors(prefix,ex?.name||'この運動');return;}
  const same=m=>!!m&&(ex.exerciseKey?m.exerciseKey===ex.exerciseKey:!m.exerciseKey&&m.name===ex.name);
  const existing=Object.entries(T).find(([k,t])=>k.startsWith('doseDefault_')&&same(t.menu[0]));
  if(existing&&!confirm('この種目の標準指示を上書きしますか？'))return;
  const key=existing?.[0]||'doseDefault_'+uid();
  const next={...T,[key]:{name:'標準指示：'+ex.name,icon:'📋',desc:'処方時に患者さんに合わせて確認',menu:[{id:'default',name:ex.name,exerciseKey:ex.exerciseKey,params:'',note:'',...dose,scheduleConfirmed:false}]}};
  try{T=cleanTemplates(next);persist();toast('標準指示を保存しました');}catch(e){alert(e.message);}
}
function readPrescription(prefix,confirmOnSave=false){
  return {prescription:C.prescription(Object.fromEntries(Object.keys(C.prescriptionLabels).map(k=>[k,$(`${prefix}-${k}`).value]))),dows:Array.from({length:7},(_,i)=>i).filter(i=>$(`${prefix}-day-${i}`).checked),scheduleConfirmed:confirmOnSave||$(`${prefix}-schedule-confirmed`).checked};
}
function prescriptionSummary(p){return Object.entries(C.prescriptionLabels).map(([k,label])=>`${label}：${p[k]}`).join(' ／ ');}
function templateCandidate(m,i,e,key){
  const draft=T[key]?{...m,prescription:{...m.prescription,side:''},scheduleConfirmed:false}:initialPrescriptionDraft(m,templateMode==='append'&&['anteriorShoulderDislocation','rotatorCuffTear','slapLesion'].includes(S.template)?S.template:key);
  return `<article class="template-ex compact-candidate" data-index="${i}" data-category="${ExerciseSelection.category(m.exerciseKey)}" data-difficulty="${escapeAttr(e?.difficulty||'')}" data-search="${escapeAttr([m.name,e?.purpose,e?.equipment].filter(Boolean).join(' ').toLowerCase())}">
    <div class="candidate-heading"><label class="pick-label"><input type="checkbox" id="pick-${i}" ${T[key]?'checked':''} onchange="filterTemplateExercises()">${escapeHtml(m.name)}</label>${e?`<button type="button" class="candidate-image" onclick="previewTemplateExercise(${i})" aria-label="${escapeAttr(e.name)}のイラスト・手順"><img src="assets/exercises/${e.image}" alt="${escapeAttr(e.name)}" loading="lazy" width="1536" height="1024"></button>`:''}</div>
    ${e?`<p class="candidate-purpose">${escapeHtml(e.purpose)} <span class="level-badge">${escapeHtml(e.difficulty)}</span></p><details class="candidate-info"><summary>選択時の注意・用具</summary><p>用具：${escapeHtml(e.equipment)}</p><p class="selection-note">${escapeHtml(e.selectionNote)}</p>${typeof ExerciseSelection!=='undefined'?ExerciseSelection.summary(e):''}<p class="hint">${escapeHtml(m.note||'')}</p><button type="button" class="btn btn-out" onclick="previewTemplateExercise(${i})">イラスト・手順を確認</button></details>`:''}
    <button type="button" class="evidence-button" onclick="showTemplateEvidence(${i})">エビデンス・参考資料</button>
    <div class="candidate-selected"><label class="quick-side-label" for="quick-side-${i}">運動する側<select id="quick-side-${i}" class="fld-inp" onchange="setQuickSide(${i},this.value)"><option value="">選択してください</option>${prescriptionChoices.side.map(v=>`<option value="${escapeAttr(v)}">${escapeHtml(v)}</option>`).join('')}</select></label><p id="dose-${i}-overview" class="candidate-dose"></p>
      <details class="selected-dose-details" id="dose-${i}-details"><summary id="dose-${i}-details-summary">回数・負荷などを変更</summary><details class="legacy-dose" ${m.params&&T[key]?'open':''}><summary>補足指示（任意）</summary><label class="fld-lbl" for="dose-${i}">従来の指示・補足</label><input class="fld-inp" id="dose-${i}" value="${T[key]?escapeAttr(m.params):''}" maxlength="100"></details>${prescriptionFields('dose-'+i,draft)}</details>
    </div></article>`;
}
function updateCandidateDose(i){
  const overview=$('dose-'+i+'-overview');if(!overview)return;
  const dose=readPrescription('dose-'+i),p=dose.prescription;
  const missing=Object.entries(C.prescriptionLabels).filter(([k])=>!p[k]).map(([,label])=>label);
  overview.textContent=[p.repetitions,p.sets,p.hold,p.frequency,dose.dows.length?dose.dows.map(d=>DOW_LABEL[d]).join('・')+'曜日':'毎日'].filter(Boolean).join(' ／ ')+(p.load?'\n負荷：'+p.load:'');
  $('quick-side-'+i).value=prescriptionChoices.side.includes(p.side)?p.side:'';
  const select=$('quick-side-'+i);let custom=select.querySelector('[data-custom]');custom?.remove();
  if(p.side&&!prescriptionChoices.side.includes(p.side)){custom=document.createElement('option');custom.dataset.custom='true';custom.value=p.side;custom.textContent=p.side;select.appendChild(custom);select.value=p.side;}
  $('dose-'+i+'-details-summary').textContent=missing.length?'未設定：'+missing.join('・')+'（開いて設定）':'回数・負荷・支え方などを変更';
  $('dose-'+i+'-details-summary').classList.toggle('has-missing',missing.length>0);
}
function setQuickSide(i,value){
  if(!requireStaff())return;
  $('dose-'+i+'-side').value=value;syncPrescriptionChoices('dose-'+i);
}
function showSelectedCandidates(){
  $('template-selected-only').checked=true;
  for(const id of ['template-purpose','template-level','template-search'])$(id).value='';
  filterTemplateExercises();$('chooseTemplate').scrollTo({top:0,behavior:'instant'});
}

function applyTemplate(key,mode='replace'){
  if(!requireStaff())return;const tpl=getAllTemplates()[key];if(!tpl)return;selectedTemplate=key;templateMode=mode==='append'?'append':'replace';
  const groups=ExerciseSelection.groups;
  const grouped=Object.entries(groups).map(([category,label])=>{
    const rows=tpl.menu.map((m,i)=>({m,i,e:EXERCISE_LIBRARY[m.exerciseKey]})).filter(({m})=>ExerciseSelection.category(m.exerciseKey)===category).sort((a,b)=>ExerciseSelection.compare(a.m,b.m));
    if(!rows.length)return '';
    return `<section class="exercise-group" data-group="${category}"><h3>${escapeHtml(label)}</h3>${rows.map(({m,i,e})=>templateCandidate(m,i,e,key)).join('')}</section>`;
  }).join('');
  modal('chooseTemplate',escapeHtml(tpl.name),`<details class="catalog-guidance"><summary>疾患の注意事項・選択前の確認</summary><div class="notice">${escapeHtml(DISEASE_LIBRARY[key]?.guidance||'必要な種目を選び、回数を確認してください。')}</div><p class="hint">標準値は患者さんに合わせて確認してください。難易度は動作の目安で、病期・安全性を判定する尺度ではありません。</p></details><p>${tpl.menu.length}種目から選択。画像を押すと手順を確認できます。</p><label class="selected-only-toggle"><input type="checkbox" id="template-selected-only" onchange="filterTemplateExercises()"> 選択済みだけ表示</label><details class="catalog-filters"><summary>検索・目的で絞り込む</summary><div class="template-filters"><label for="template-purpose">目的<select id="template-purpose" class="fld-inp" onchange="filterTemplateExercises()"><option value="">すべての目的</option>${Object.entries(groups).filter(([c])=>tpl.menu.some(m=>ExerciseSelection.category(m.exerciseKey)===c)).map(([c,l])=>`<option value="${c}">${escapeHtml(l)}</option>`).join('')}</select></label><label for="template-level">難易度の目安<select id="template-level" class="fld-inp" onchange="filterTemplateExercises()"><option value="">すべて</option><option>基本</option><option>標準</option><option>発展</option></select></label><label class="search-field" for="template-search">種目名・目的・用具で探す<input id="template-search" class="fld-inp" type="search" oninput="filterTemplateExercises()" placeholder="例：椅子、体幹"></label></div></details><p id="template-results" class="hint" aria-live="polite"></p>${grouped}<div class="template-actions"><p id="template-selection" role="status"></p><div id="template-choice-warnings" aria-live="polite"></div><p>左右・負荷・曜日と患者さんの動作を確認して保存してください。</p><button class="btn btn-pri" onclick="applySelectedTemplate(true)">確認して保存・QRを表示</button><button class="btn btn-out" onclick="applySelectedTemplate()">確認して保存・運動選択を続ける</button></div>`);
  $('chooseTemplate').classList.add('compact-catalog');
  $('chooseTemplate').querySelector('.t-hd').insertAdjacentHTML('beforeend',`<div class="catalog-shortcuts"><button id="selected-candidates-button" type="button" class="btn btn-out" onclick="showSelectedCandidates()">選択分を確認</button><button type="button" class="btn btn-pri" onclick="applySelectedTemplate(true)">保存・QR</button></div>`);
  filterTemplateExercises();
}
function previewTemplateExercise(i){const ex=getAllTemplates()[selectedTemplate]?.menu[i];if(ex)showGuide({...ex,...readPrescription('dose-'+i),params:$('dose-'+i)?.value.trim()||''});}
function updateTemplateSelection(){
  const root=$('chooseTemplate');if(!root)return;
  const count=root.querySelectorAll('.pick-label input:checked').length;
  const hidden=root.querySelectorAll('.template-ex[hidden] .pick-label input:checked').length;
  $('template-selection').textContent=`選択 ${count}種目${hidden?`（絞り込みで非表示 ${hidden}種目を含む）`:''}`;
  if($('selected-candidates-button'))$('selected-candidates-button').textContent=`選択分を確認（${count}）`;
  root.querySelectorAll('.template-ex').forEach(row=>updateCandidateDose(Number(row.dataset.index)));
  const warnings=$('template-choice-warnings');
  if(warnings&&typeof ExerciseSelection!=='undefined')warnings.innerHTML=ExerciseSelection.warnings([...root.querySelectorAll('.pick-label input:checked')].map(input=>getAllTemplates()[selectedTemplate]?.menu[Number(input.id.slice(5))]?.exerciseKey).filter(Boolean));
}
function filterTemplateExercises(){
  const root=$('chooseTemplate');if(!root)return;
  const category=$('template-purpose').value,level=$('template-level').value,query=$('template-search').value.trim().toLowerCase();let visible=0;
  root.querySelectorAll('.template-ex').forEach(row=>{row.hidden=!!(($('template-selected-only')?.checked&&!row.querySelector('.pick-label input').checked)||(category&&row.dataset.category!==category)||(level&&row.dataset.difficulty!==level)||(query&&!row.dataset.search.includes(query)));if(!row.hidden)visible++;});
  root.querySelectorAll('.exercise-group').forEach(group=>group.hidden=!group.querySelector('.template-ex:not([hidden])'));
  $('template-results').textContent=visible?`${visible}種目を表示中`:'該当する種目がありません。絞り込みを変更してください。';
  updateTemplateSelection();
}
function commitMenu(next){const from=C.changeMenu(S,L,next,todayKey(),dk(addDays(new Date(),1)));persist();renderTherapist();return from;}
function applySelectedTemplate(share=false){
  if(!requireStaff())return;const tpl=getAllTemplates()[selectedTemplate],selected=[];
  for(const [i,m] of tpl.menu.entries())if($('pick-'+i).checked){const dose=readPrescription('dose-'+i,true),issues=C.prescriptionIssues(dose);if(issues.length){toast(`${m.name}：${issues.join('・')}を確認してください`);showPrescriptionErrors('dose-'+i,m.name);return;}selected.push({...m,id:'ex_'+uid(),params:$('dose-'+i).value.trim(),...dose});}
  if(!selected.length){toast('種目を選んでください');return;}
  selected.sort(ExerciseSelection.compare);
  if(templateMode==='replace'&&S.menu.length&&!confirm('現在のメニューを置き換えます。過去の記録はそのまま残ります。'))return;
  if(templateMode==='append'&&selected.some(ex=>S.menu.some(old=>ex.exerciseKey&&old.exerciseKey===ex.exerciseKey))){toast('すでに入っている運動があります。追加する種目だけを選んでください');return;}
  if(S.menu.length+selected.length>60&&templateMode==='append'){toast('メニューは60種目以内にしてください');return;}
  if(templateMode!=='append'||!S.menu.length)S.template=selectedTemplate;const from=commitMenu(templateMode==='append'?[...S.menu,...selected]:selected);$('chooseTemplate').remove();toast(from===todayKey()?'メニューを設定しました':'新しいメニューは明日からです');if(share)showShareQR();
}
function editEx(idx){
  if(!requireStaff())return;__editingExIdx=idx;const ex=idx>=0?S.menu[idx]:{name:'',params:'',note:'',dows:[],exerciseKey:'',videoUrl:''};
  modal('exEditModal',idx>=0?'種目を編集':'種目を追加',`<label class="fld-lbl" for="ee-name">種目名</label><input id="ee-name" class="fld-inp" value="${escapeAttr(ex.name)}" maxlength="120"><label class="fld-lbl" for="ee-params">従来の指示・補足（任意）</label><input id="ee-params" class="fld-inp" value="${escapeAttr(ex.params)}" maxlength="100">${prescriptionFields("ee",ex)}<label class="fld-lbl" for="ee-note">個別の注意点</label><textarea id="ee-note" class="fld-inp" maxlength="500">${escapeHtml(ex.note)}</textarea><label class="fld-lbl" for="ee-image">イラストと手順</label><select id="ee-image" class="fld-inp"><option value="">なし</option>${Object.entries(EXERCISE_LIBRARY).map(([k,e])=>`<option value="${k}" ${!ex.mediaDisabled&&(ex.exerciseKey===k||(!ex.exerciseKey&&EXERCISE_LIBRARY[k]===mediaFor(ex)))?'selected':''}>${escapeHtml(e.name)}</option>`).join('')}</select><details class="pt-details"><summary>動画を選ぶ・撮影する</summary><div id="exercise-video-tools"></div></details><label class="fld-lbl" for="ee-video">動画URL（任意・HTTPS）</label><input id="ee-video" class="fld-inp" type="url" value="${escapeAttr(ex.videoUrl||'')}" placeholder="https://..."><p class="hint">担当PTが確認した動画を登録してください。外部サイトで開きます。</p><button class="btn btn-pri" onclick="saveEx()">指示を確認して保存</button>`);
  ExerciseVideo.mount();
}
function saveEx(){
  if(!requireStaff())return;const name=$('ee-name').value.trim(),params=$('ee-params').value.trim(),video=$('ee-video').value.trim();
  if(!name){toast('種目名を入力してください');return;}if(video&&!C.videoUrl(video)){toast('動画URLはhttps://で入力してください');return;}
  const dose=readPrescription('ee',true),issues=C.prescriptionIssues(dose);if(issues.length){toast(`${issues.join('・')}を確認してください`);showPrescriptionErrors('ee',name);return;}
  const next=C.clone(S.menu),old=__editingExIdx>=0?next[__editingExIdx]:{id:'ex_'+uid()};
  const ex={...old,name,params,note:$('ee-note').value,exerciseKey:$('ee-image').value,mediaDisabled:!$('ee-image').value,videoUrl:video,...dose};
  if(__editingExIdx>=0)next[__editingExIdx]=ex;else next.push(ex);const from=commitMenu(next);$('exEditModal').remove();toast(from===todayKey()?'保存しました':'本日分は保持し、明日から変更します');
}
function delEx(i){if(requireStaff()&&confirm('種目を削除しますか？ 過去の記録は保持されます。')){const next=C.clone(S.menu);next.splice(i,1);commitMenu(next);}}
function doSaveTemplate(){
  if(!requireStaff())return;const name=$('tpl-save-name').value.trim();if(!name){toast('テンプレート名を入力してください');return;}
  T['custom_'+uid()]={name,icon:$('tpl-save-icon').value||'📋',desc:$('tpl-save-desc').value,menu:C.clone(S.menu)};T=cleanTemplates(T);persist();closeSaveTplModal();renderTherapist();toast('曜日とイラストも保存しました');
}
function showTemplateManagement(){
  if(!requireStaff())return;modal('tplManage','カスタムテンプレート',`<button class="btn btn-out" onclick="exportTemplates()">テンプレートを書き出す</button><input type="file" accept=".json" aria-label="テンプレートを取り込む" onchange="importTemplates(event)">${Object.entries(T).map(([k,t])=>`<p>${escapeHtml(t.name)} <button class="text-button" onclick="deleteCustomTemplate('${k}');document.getElementById('tplManage').remove()">削除</button></p>`).join('')}`);
}
async function importTemplates(e){if(!requireStaff())return;const f=e.target.files?.[0];e.target.value='';if(!f)return;try{if(f.size>2000000)throw Error('ファイルが大きすぎます');const data=JSON.parse(await f.text()),incoming=cleanTemplates(data.templates||data);if(confirm(`${Object.keys(incoming).length}件を取り込みます。重複するものは上書きします。`)){T=cleanTemplates({...T,...incoming});persist();renderTherapist();toast('取り込みました');}}catch(err){alert(err.message);}}

function archiveCurrent(){if(S&&(S.menu.length||Object.keys(L).length||S.patientName||S.chartId)){if(archives.length>=500)throw Error('退避記録の上限です。バックアップを保存して整理してください。');archives.push({settings:C.clone(S),logs:C.clone(L),savedAt:new Date().toISOString()});}}
function newPatient(){if(!requireStaff()||!confirm('現在の患者記録を退避し、別の患者を新規作成します。'))return;archiveCurrent();S=C.settings({menu:[],startDate:todayKey(),knownSince:todayKey()},uid(),todayKey());L={};persist();renderTherapist();renderHeader();}
function showArchives(){if(!requireStaff())return;modal('archiveModal','退避した患者記録',archives.length?archives.map((a,i)=>`<div class="card"><p>${escapeHtml([a.settings.chartId,a.settings.patientName].filter(Boolean).join(' ／ ')||'名前未設定')} ／ ${Object.keys(a.logs).length}日分</p><p class="hint">${escapeHtml(a.savedAt)}</p><button class="btn btn-out" onclick="restoreArchive(${i})">この患者に切り替える</button></div>`).join(''):'<p>退避記録はありません。</p>');}
function restoreArchive(i){if(!requireStaff()||!archives[i]||!confirm('現在の記録を退避して切り替えますか？'))return;const a=archives.splice(i,1)[0];archiveCurrent();S=a.settings;L=a.logs;persist();$('archiveModal').remove();renderTherapist();renderHeader();}
function buildSharePayload(){
  return {version:2,patientId:S.patientId,startDate:S.startDate,nextVisit:S.nextVisit,painContext:S.painContext,consultContact:S.consultContact,restartInstructions:S.restartInstructions,menu:C.menu(S.menu)};
}
function buildShareUrl(){
  if(!requireStaff())return null;if(!S.menu.length){toast('メニューを設定してください');return null;}
  const incomplete=S.menu.filter(ex=>C.prescriptionIssues(ex).length);
  if(incomplete.length){alert(`個別指示を確認してから共有してください。従来の指示・記録は保持されています。\n${incomplete.map(ex=>`${ex.name}：${C.prescriptionIssues(ex).join('・')}`).join('\n')}`);return null;}
  if(typeof LZString==='undefined'){alert('共有ライブラリを読み込めませんでした。');return null;}
  return `${location.origin}${location.pathname}#d=${encodeURIComponent(LZString.compressToEncodedURIComponent(JSON.stringify(buildSharePayload())))}`;
}
function handleImportFromHash(){
  if(storageBlocked)return false;const compressed=extractImportData();if(!compressed)return false;
  try{
    if(compressed.length>60000)throw Error('設定データが大きすぎます');
    if(typeof LZString==='undefined')throw Error('読込ライブラリを読み込めませんでした。再読み込みしてください。');
    const json=LZString.decompressFromEncodedURIComponent(compressed.replace(/ /g,'+'))||LZString.decompressFromBase64(compressed);
    if(!json||json.length>150000)throw Error('設定データが不正です');
    const raw=JSON.parse(json),data=C.settings({...raw,plans:[],knownSince:todayKey()},uid(),todayKey());
    const same=!!(S&&C.id(raw.patientId)&&raw.patientId===S.patientId);
    const message=same?'同じ患者のメニューを更新します。過去の記録は保持します。':S?'別の患者または旧形式の設定です。現在の記録を退避し、新しい記録として読み込みます。':'新しいメニューを読み込みます。';
    if(!confirm(`${message}\n${data.menu.length}種目 ／ 開始日 ${data.startDate}\n担当PTから受け取った設定であることを確認してください。`)){history.replaceState(null,'',location.pathname);return false;}
    if(same){C.changeMenu(S,L,data.menu,todayKey(),dk(addDays(new Date(),1)));S.nextVisit=data.nextVisit;for(const field of ['painContext','consultContact','restartInstructions'])if(Object.hasOwn(raw,field))S[field]=data[field];}
    else{const name=prompt('この端末に表示する呼び名を入力してください（空欄でも使えます）。',C.text(raw.patientName,80));if(name===null)return false;archiveCurrent();S=data;S.chartId='';S.patientName=C.text(name,80);S.age='';S.diagnosis='';S.knownSince=S.startDate;S.plans=[{from:S.startDate,menu:C.clone(S.menu)}];L={};}
    persist();history.replaceState(null,'',location.pathname);$('setupOverlay').hidden=true;toast(same?'メニューを更新しました':'新しい患者の設定を読み込みました');return true;
  }catch(e){alert('読み込みできませんでした。\n'+e.message);return false;}
}
function manualImport(urlOverride){
  const txt=String(urlOverride??$('update-url')?.value??$('paste-url')?.value??'').trim();if(!txt){toast('URLを入力してください');return;}
  const m=txt.match(/[#?&](?:d|import)=([^&\s]+)/);let value=m?m[1]:txt;try{value=decodeURIComponent(value);}catch{}
  history.replaceState(null,'',location.pathname+'#d='+encodeURIComponent(value));if(handleImportFromHash()){$('receiveModal')?.remove();renderHeader();renderToday();}
}
function showReceiveSettings(){modal('receiveModal','担当PTからメニューを受け取る','<button class="btn btn-pri" onclick="startQrScan()">設定QRを読み取る</button><label class="fld-lbl" for="update-url">または、受け取ったURLを貼り付け</label><textarea id="update-url" class="fld-inp" rows="3"></textarea><button class="btn btn-out" onclick="manualImport(document.getElementById(\'update-url\').value)">URLから読み込む</button>');}
function downloadJSON(data,name){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportPatientData(){downloadJSON({version:2,settings:S,logs:L,templates:{},archives:[],exportedAt:new Date().toISOString()},'rehab-record-'+todayKey()+'.json');}
function exportData(){if(requireStaff())downloadJSON({...packState(),localPin:undefined,exportedAt:new Date().toISOString()},'rehab-backup-'+todayKey()+'.json');}
async function importData(e){
  if(!requireStaff())return;const f=e.target.files?.[0];e.target.value='';if(!f)return;
  try{if(f.size>12000000)throw Error('ファイルが大きすぎます');const data=JSON.parse(await f.text());let nextS,nextL;
    if(data.version===2){nextS=data.settings?C.settings(data.settings,uid(),todayKey()):null;nextL=C.logs(data.logs||{});}else{const m=C.migrate(data.settings,data.logs,uid(),todayKey());nextS=m.settings;nextL=m.logs;}
    const templates=cleanTemplates(data.templates||{}),others=validateArchives(data.archives||[]);if(!confirm('現在の患者記録を退避し、バックアップを復元しますか？'))return;
    archiveCurrent();if(archives.length+others.length>500)throw Error('退避記録が多すぎます');S=nextS;L=nextL;T=cleanTemplates({...T,...templates});archives.push(...others);persist();renderTherapist();renderHeader();toast('復元しました');
  }catch(err){if(committed)restoreMemory(C.clone(committed));alert('復元できませんでした。'+err.message);}
}
async function resetAll(){if(!requireStaff()||!confirm('この患者の情報・メニュー・実施記録・アプリ内の保存動画を削除します。動画はバックアップに含まれません。必要な元動画を保存しましたか？')||!confirm('本当に削除しますか？'))return;const original=S;try{await PatientVideo.removePatient(original.patientId);if(S!==original||storageBlocked)return;S=null;L={};persist();closeTherapist();$('setupOverlay').hidden=false;}catch{toast('削除できませんでした。ブラウザ設定を確認し、再度お試しください。');}}

// Date rollover must refresh the displayed prescription before any new input.
function refreshDay(){if(activeDay!==todayKey()){activeDay=todayKey();renderHeader();renderToday();if($('tab-cal').classList.contains('active'))renderCalendar();if($('tab-prog').classList.contains('active'))renderProgress();}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDay();});
setInterval(refreshDay,30000);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){for(const id of ['guideModal','shareReviewModal','reportModal','chooseTemplate','exEditModal','archiveModal','tplManage']){const dialog=$(id);if(dialog){closeModal(id);break;}}}});

function setCatalogAudience(athlete){if(!requireStaff())return;document.querySelectorAll('#exercise-catalog [data-athlete]').forEach(b=>b.hidden=(b.dataset.athlete==='true')!==athlete);$('catalog-general').setAttribute('aria-pressed',String(!athlete));$('catalog-athlete').setAttribute('aria-pressed',String(athlete));$('catalog-athlete-note').hidden=!athlete;}
