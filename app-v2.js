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
for (const [key,d] of Object.entries(DISEASE_LIBRARY)) TEMPLATES[key] = {...d, menu:Object.entries(EXERCISE_LIBRARY).filter(([,e])=>e.region===key).map(([exerciseKey,e])=>({name:e.name,params:e.params,note:e.caution,exerciseKey,dows:[]}))};

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
function renderToday(){
  if(storageBlocked){$('today-content').innerHTML=storageConflict?'<div class="card">別の画面で更新されています。<button class="btn btn-pri" onclick="location.reload()">最新の保存内容を読み直す</button></div>':'<div class="card">保存データの確認が必要です。元データは保持されています。</div>';return;}
  if(!S){$('today-content').innerHTML='<div class="card empty"><div class="welcome-icon">🌱</div><h2>毎日のリハビリを、少しずつ。</h2><p>担当PTからメニューを受け取りましょう。</p><button class="btn btn-pri" onclick="startQrScan()">設定QRを読み取る</button><button class="btn btn-out" onclick="openPinModal()">スタッフ：メニューを設定</button></div>';return;}
  const key=todayKey(),dow=new Date().getDay(),log=getLog(key),items=todayExercises(dow),c=getCompletion(key,dow),before=key<S.startDate;
  let h=`<div class="banner"><div class="banner-d">${fmtJ(new Date())}</div><div class="banner-msg">${escapeHtml(S.patientName||'患者')}さんのペースで、続けましょう。</div></div>`;
  if(S.plans.some(p=>p.from>key))h+=`<div class="notice">現在の設定は${S.menu.length}種目です。本日は記録済みの${items.length}種目を表示し、更新は明日から反映します。今日から変更する場合は、セラピストモードの「今日から反映」を選んでください。</div>`;
  h+=`<div class="card"><div class="comp-bar"><div class="comp-pct">${percentText(c)}</div><div class="comp-d"><div class="comp-lbl">${before?'開始日は '+escapeHtml(S.startDate):!c.total?'今日は休養日です':`今日のできた種目 ${c.done} / ${c.total}`}</div><div class="bar-bg"><div class="bar-fg" style="width:${c.pct}%"></div></div></div></div><div class="hint">痛みで休んだことも、大切な記録です。</div></div>`;
  for(const [i,ex] of items.entries()){
    const media=mediaFor(ex),st=log.status?.[ex.id]||(log.done?.[ex.id]?'done':'');
    h+=`<article class="card exercise-card"><div class="exercise-top"><div><span class="eyebrow">EXERCISE ${String(i+1).padStart(2,'0')}</span><h2>${escapeHtml(ex.name)}</h2><div class="dose">${escapeHtml(ex.params||'担当PTの指示に合わせて')}</div></div>${media?`<button class="image-button" onclick="showExercise(${i})" aria-label="${escapeAttr(ex.name)}のイラストと手順"><img src="assets/exercises/${media.image}" alt="${escapeAttr(media.name)}" loading="lazy"></button>`:''}</div><button class="btn btn-out guide-button" onclick="showExercise(${i})">${media?'イラストと手順を見る':'やり方・注意点を見る'}</button>`;
    if(ex.note)h+=`<p class="exercise-note">${escapeHtml(ex.note)}</p>`;
    h+=`<label class="fld-lbl" for="status-${i}">今日の実施状況</label><select id="status-${i}" class="fld-inp status-select ${st==='done'?'is-done':''}" onchange="setExerciseStatus(${i},this.value)"><option value="">未記録</option>${Object.entries(statusLabels).map(([v,label])=>`<option value="${v}" ${st===v?'selected':''}>${label}</option>`).join('')}</select></article>`;
  }
  if(!before){
    h+=`<div class="card"><div class="card-ttl">今日の痛み（0〜10）</div><p class="hint">担当PTと決めた同じ場面の痛みを記録しましょう。0は「痛みなし」です。</p><div class="pain-value" id="pain-value">${log.vas===null?'未記録':log.vas+' / 10'}</div><div class="pain-options" role="group" aria-label="痛みの強さ">${Array.from({length:11},(_,v)=>`<button type="button" aria-pressed="${log.vas===v}" class="pain-choice ${log.vas===v?'selected':''}" onclick="saveVas(${v})">${v}</button>`).join('')}</div><button class="text-button" onclick="clearPain()">痛みを未記録に戻す</button></div><div class="card"><label class="card-ttl" for="note-ta">メモ</label><textarea class="note-ta" id="note-ta" maxlength="2000" placeholder="気づいたことや、休んだ理由など" oninput="saveNote(this.value)">${escapeHtml(log.note||'')}</textarea><div class="hint">入力すると自動で保存します。</div></div>`;
  }
  h+='<div class="notice">運動で痛みやしびれが増すときは中止し、担当PTへ相談してください。</div><div class="card"><p class="hint">記録はこの端末に保存されます。院内への自動送信はありません。</p><button class="btn btn-out" onclick="showReceiveSettings()">メニュー更新・QR読込</button><button class="btn btn-out" onclick="exportPatientData()">自分の記録をバックアップ</button></div>';
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
  modal('guideModal',escapeHtml(ex.name),`${media?`<img class="guide-image" src="assets/exercises/${media.image}" alt="${escapeAttr(media.name)}の姿勢">${media.imageCaption?`<p class="hint">${escapeHtml(media.imageCaption)}</p>`:''}`:''}<div class="dose">${escapeHtml(ex.params||'担当PTと回数を確認してください')}</div>${media?`<ol class="steps">${media.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ol><div class="notice">${escapeHtml(media.caution)}</div>`:''}${ex.note?`<h3>担当PTから</h3><p>${escapeHtml(ex.note)}</p>`:''}${url?`<a class="btn btn-out" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">担当PTが登録した動画を見る ↗</a>`:''}${media?`<details class="source-note"><summary>説明の参考資料</summary><a href="${escapeAttr(media.source)}" target="_blank" rel="noopener noreferrer">医療機関の運動解説（英語）↗</a><p>イラストは説明用です。可動域や負荷は個別の指示を優先してください。</p></details>`:''}`);
}
function modal(id,title,body){
  $(id)?.remove();const wrap=document.createElement('div');wrap.id=id;wrap.className='t-overlay on';wrap.setAttribute('role','dialog');wrap.setAttribute('aria-modal','true');
  wrap.innerHTML=`<div class="t-modal"><div class="t-hd"><h2>${title}</h2><button class="t-close" aria-label="閉じる" onclick="document.getElementById('${id}').remove()">×</button></div>${body}</div>`;
  document.body.appendChild(wrap);wrap.querySelector('button')?.focus();
}
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
    for(const [i,revision] of (log.menuRevisions||[]).entries())h+=`<details class="source-note"><summary>当日の変更前の記録 ${i+1}</summary>${revision.menuSnapshot.map(ex=>`<p>${escapeHtml(ex.name)} ／ ${escapeHtml(ex.params)}：${statusLabels[revision.status[ex.id]]||(revision.done[ex.id]?'できた':'未記録')}</p>`).join('')}</details>`;
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
  else if(['patientName','age','diagnosis','therapistName'].includes(field))S[field]=C.text(val,field==='age'?3:120);
  else if(['startDate','nextVisit'].includes(field)){if(val&&!C.validDate(val)){toast('日付を確認してください');return;}if(field==='startDate'&&Object.keys(L).length){toast('記録後の開始日は変更できません');renderTherapist();return;}S[field]=val|| (field==='startDate'?todayKey():'');if(field==='startDate'){S.knownSince=S.startDate;S.plans=[{from:S.startDate,menu:C.clone(S.menu)}];}}
  persist();renderHeader();
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
function renderTherapist(){
  if(!S)return;const all=getAllTemplates();
  $('therapist-content').innerHTML=`<div class="notice">患者さんの状態に合わせて種目・回数を選び、院内で動作を確認してからお渡しください。</div><div class="t-sec"><div class="t-sec-ttl">患者情報（この端末内）</div><div class="fld"><label for="patient-name" class="fld-lbl">表示名・呼び名</label><input id="patient-name" class="fld-inp" value="${escapeAttr(S.patientName)}" maxlength="80" onchange="updS('patientName',this.value)"></div><div class="fld"><label for="diagnosis" class="fld-lbl">診断名</label><input id="diagnosis" class="fld-inp" value="${escapeAttr(S.diagnosis)}" onchange="updS('diagnosis',this.value)"></div><div class="fld-row">${dateField('start-date','startDate','開始日',S.startDate,Object.keys(L).length>0)}${dateField('next-visit','nextVisit','次回来院日',S.nextVisit)}</div><div class="fld"><label class="fld-lbl" for="therapist-name">担当PT</label><input id="therapist-name" class="fld-inp" value="${escapeAttr(S.therapistName)}" onchange="updS('therapistName',this.value)"></div><div class="hint">患者識別ID：${escapeHtml(S.patientId)}</div><button class="btn btn-out" onclick="newPatient()">別の患者のメニューを新規作成</button></div><div class="t-sec"><div class="t-sec-ttl">疾患別メニューから選ぶ</div><div class="tpl-grid">${Object.entries(all).map(([k,t])=>`<button class="tpl-card" onclick="applyTemplate('${k}')"><div class="tpl-ico">${escapeHtml(t.icon)}</div><div class="tpl-nm">${escapeHtml(t.name)}</div><div class="tpl-desc">${escapeHtml(t.desc)}</div></button>`).join('')}</div></div><div class="t-sec"><div class="t-sec-ttl">処方メニュー ${S.menu.length}種目</div>${menuTimingNotice()}${typeof ExerciseSelection!=='undefined'?ExerciseSelection.warnings(S.menu.map(ex=>ex.exerciseKey).filter(Boolean)):''}${S.menu.map((ex,i)=>`<div class="menu-item"><div class="menu-item-hd"><div class="menu-item-nm">${escapeHtml(ex.name)}</div><button class="menu-item-btn" aria-label="編集" onclick="editEx(${i})">✏</button><button class="menu-item-btn" aria-label="削除" onclick="delEx(${i})">×</button></div><div class="menu-item-pm">${escapeHtml(ex.params)} ／ ${ex.dows.length?ex.dows.map(d=>DOW_LABEL[d]).join('・'):'毎日'}</div></div>`).join('')}<button class="btn btn-out" onclick="editEx(-1)">＋ 種目を追加</button><button class="btn btn-out" onclick="saveCurrentAsTemplate()">現在のメニューをテンプレート保存</button><button class="btn btn-out" onclick="showTemplateManagement()">テンプレートの共有・削除</button></div><div class="t-sec"><div class="t-sec-ttl">患者スマホへ</div><p class="hint">新しいQRに氏名・年齢・診断名・PINは含めません。設定した運動・注意文は含まれるため、本人へ直接お渡しください。</p><button class="btn btn-pri" onclick="showShareQR()">設定データQRを表示</button><button class="btn btn-out" onclick="showInstallQR()">アプリ追加用QR（共通）</button></div><div class="t-sec"><div class="t-sec-ttl">端末の誤操作防止PIN</div><input aria-label="端末のPIN" class="fld-inp" type="password" inputmode="numeric" maxlength="6" value="${escapeAttr(localPin)}" onchange="updS('passcode',this.value)"><p class="hint">4〜6桁。空欄で無効。この端末だけの簡易ロックで、本人認証ではありません。</p></div><div class="t-sec"><div class="t-sec-ttl">保存・復元</div><button class="btn btn-out" onclick="exportData()">端末全体をバックアップ</button><button class="btn btn-out" onclick="document.getElementById('restore-file').click()">バックアップを復元</button><input id="restore-file" type="file" accept=".json" hidden onchange="importData(event)"><button class="btn btn-out" onclick="showArchives()">退避した患者記録（${archives.length}件）</button><button class="btn btn-danger" onclick="resetAll()">この患者のデータを削除</button></div>`;
}
let selectedTemplate=null;
function applyTemplate(key){
  if(!requireStaff())return;const tpl=getAllTemplates()[key];if(!tpl)return;selectedTemplate=key;
  const groups={...EXERCISE_GROUPS,custom:'その他の種目'};
  const grouped=Object.entries(groups).map(([category,label])=>{
    const rows=tpl.menu.map((m,i)=>({m,i,e:EXERCISE_LIBRARY[m.exerciseKey]})).filter(({e})=>(e?.category||'custom')===category);
    if(!rows.length)return '';
    return `<section class="exercise-group" data-group="${category}"><h3>${escapeHtml(label)}</h3>${rows.map(({m,i,e})=>`<article class="template-ex" data-index="${i}" data-category="${category}" data-difficulty="${escapeAttr(e?.difficulty||'')}" data-search="${escapeAttr([m.name,e?.purpose,e?.equipment].filter(Boolean).join(' ').toLowerCase())}"><label class="pick-label"><input type="checkbox" id="pick-${i}" onchange="updateTemplateSelection()"> ${escapeHtml(m.name)}</label>${e?`<div class="template-summary"><button type="button" class="image-button" onclick="previewTemplateExercise(${i})" aria-label="${escapeAttr(e.name)}の手順を確認"><img src="assets/exercises/${e.image}" alt="${escapeAttr(e.name)}" loading="lazy" width="1536" height="1024"></button><div><span class="level-badge">${escapeHtml(e.difficulty)}</span><p>${escapeHtml(e.purpose)}</p><p class="hint">用具：${escapeHtml(e.equipment)}</p></div></div><p class="selection-note"><strong>選択時の注意：</strong>${escapeHtml(e.selectionNote)}</p>${typeof ExerciseSelection!=='undefined'?ExerciseSelection.summary(e):''}<button type="button" class="btn btn-out" onclick="previewTemplateExercise(${i})">イラスト・手順を確認</button>`:''}<p class="hint">${escapeHtml(m.note||'')}</p><label class="fld-lbl" for="dose-${i}">回数・時間・セット</label><input class="fld-inp" id="dose-${i}" value="${T[key]?escapeAttr(m.params):''}" maxlength="100" placeholder="患者さんに合わせた指示を入力"></article>`).join('')}</section>`;
  }).join('');
  modal('chooseTemplate',escapeHtml(tpl.name),`<div class="notice">${escapeHtml(DISEASE_LIBRARY[key]?.guidance||'必要な種目を選び、回数を確認してください。')}</div><p>${tpl.menu.length}種目の候補から必要なものだけ選び、指示量を入力してください。</p><p class="hint">難易度は動作の目安です。病期・安全性を判定する尺度ではありません。</p><div class="template-filters"><label for="template-purpose">目的<select id="template-purpose" class="fld-inp" onchange="filterTemplateExercises()"><option value="">すべての目的</option>${Object.entries(groups).filter(([c])=>tpl.menu.some(m=>(EXERCISE_LIBRARY[m.exerciseKey]?.category||'custom')===c)).map(([c,l])=>`<option value="${c}">${escapeHtml(l)}</option>`).join('')}</select></label><label for="template-level">難易度の目安<select id="template-level" class="fld-inp" onchange="filterTemplateExercises()"><option value="">すべて</option><option>基本</option><option>標準</option><option>発展</option></select></label><label class="search-field" for="template-search">種目名・目的・用具で探す<input id="template-search" class="fld-inp" type="search" oninput="filterTemplateExercises()" placeholder="例：椅子、体幹"></label></div><p id="template-results" class="hint" aria-live="polite"></p>${grouped}<div class="template-actions"><p id="template-selection" role="status"></p><div id="template-choice-warnings" aria-live="polite"></div><button class="btn btn-pri" onclick="applySelectedTemplate()">選んだ種目でメニューを更新</button></div>`);
  filterTemplateExercises();
}
function previewTemplateExercise(i){const ex=getAllTemplates()[selectedTemplate]?.menu[i];if(ex)showGuide({...ex,params:$('dose-'+i)?.value.trim()||'回数・時間は患者さんに合わせて設定'});}
function updateTemplateSelection(){
  const root=$('chooseTemplate');if(!root)return;
  const count=root.querySelectorAll('.pick-label input:checked').length;
  const hidden=root.querySelectorAll('.template-ex[hidden] .pick-label input:checked').length;
  $('template-selection').textContent=`選択 ${count}種目${hidden?`（絞り込みで非表示 ${hidden}種目を含む）`:''}`;
  const warnings=$('template-choice-warnings');
  if(warnings&&typeof ExerciseSelection!=='undefined')warnings.innerHTML=ExerciseSelection.warnings([...root.querySelectorAll('.pick-label input:checked')].map(input=>getAllTemplates()[selectedTemplate]?.menu[Number(input.id.slice(5))]?.exerciseKey).filter(Boolean));
}
function filterTemplateExercises(){
  const root=$('chooseTemplate');if(!root)return;
  const category=$('template-purpose').value,level=$('template-level').value,query=$('template-search').value.trim().toLowerCase();let visible=0;
  root.querySelectorAll('.template-ex').forEach(row=>{row.hidden=!!((category&&row.dataset.category!==category)||(level&&row.dataset.difficulty!==level)||(query&&!row.dataset.search.includes(query)));if(!row.hidden)visible++;});
  root.querySelectorAll('.exercise-group').forEach(group=>group.hidden=!group.querySelector('.template-ex:not([hidden])'));
  $('template-results').textContent=visible?`${visible}種目を表示中`:'該当する種目がありません。絞り込みを変更してください。';
  updateTemplateSelection();
}
function commitMenu(next){const from=C.changeMenu(S,L,next,todayKey(),dk(addDays(new Date(),1)));persist();renderTherapist();return from;}
function applySelectedTemplate(){
  if(!requireStaff())return;const tpl=getAllTemplates()[selectedTemplate],selected=[];
  for(const [i,m] of tpl.menu.entries())if($('pick-'+i).checked){const params=$('dose-'+i).value.trim();if(!params){toast('選んだ種目の回数・時間を入力してください');return;}selected.push({...m,id:'ex_'+uid(),params,dows:m.dows||[]});}
  if(!selected.length){toast('種目を選んでください');return;}
  if(S.menu.length&&!confirm('現在のメニューを置き換えます。過去の記録はそのまま残ります。'))return;
  S.template=selectedTemplate;S.diagnosis=tpl.name;const from=commitMenu(selected);$('chooseTemplate').remove();toast(from===todayKey()?'メニューを設定しました':'新しいメニューは明日からです');
}
function editEx(idx){
  if(!requireStaff())return;__editingExIdx=idx;const ex=idx>=0?S.menu[idx]:{name:'',params:'',note:'',dows:[],exerciseKey:'',videoUrl:''};
  modal('exEditModal',idx>=0?'種目を編集':'種目を追加',`<label class="fld-lbl" for="ee-name">種目名</label><input id="ee-name" class="fld-inp" value="${escapeAttr(ex.name)}" maxlength="120"><label class="fld-lbl" for="ee-params">回数・時間・セット</label><input id="ee-params" class="fld-inp" value="${escapeAttr(ex.params)}" maxlength="100"><label class="fld-lbl" for="ee-note">個別の注意点</label><textarea id="ee-note" class="fld-inp" maxlength="500">${escapeHtml(ex.note)}</textarea><label class="fld-lbl" for="ee-image">イラストと手順</label><select id="ee-image" class="fld-inp"><option value="">なし</option>${Object.entries(EXERCISE_LIBRARY).map(([k,e])=>`<option value="${k}" ${!ex.mediaDisabled&&(ex.exerciseKey===k||(!ex.exerciseKey&&EXERCISE_LIBRARY[k]===mediaFor(ex)))?'selected':''}>${escapeHtml(e.name)}</option>`).join('')}</select><label class="fld-lbl" for="ee-video">動画URL（任意・HTTPS）</label><input id="ee-video" class="fld-inp" type="url" value="${escapeAttr(ex.videoUrl||'')}" placeholder="https://..."><p class="hint">担当PTが確認した動画を登録してください。外部サイトで開きます。</p><p>実施曜日（無選択＝毎日）</p><div class="day-options">${DOW_LABEL.map((v,i)=>`<label><input id="ee-day-${i}" type="checkbox" ${ex.dows.includes(i)?'checked':''}>${v}</label>`).join('')}</div><button class="btn btn-pri" onclick="saveEx()">保存</button>`);
}
function saveEx(){
  if(!requireStaff())return;const name=$('ee-name').value.trim(),params=$('ee-params').value.trim(),video=$('ee-video').value.trim();
  if(!name||!params){toast('種目名と回数・時間を入力してください');return;}if(video&&!C.videoUrl(video)){toast('動画URLはhttps://で入力してください');return;}
  const next=C.clone(S.menu),old=__editingExIdx>=0?next[__editingExIdx]:{id:'ex_'+uid()};
  const ex={...old,name,params,note:$('ee-note').value,exerciseKey:$('ee-image').value,mediaDisabled:!$('ee-image').value,videoUrl:video,dows:Array.from({length:7},(_,i)=>i).filter(i=>$('ee-day-'+i).checked)};
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

function archiveCurrent(){if(S&&(S.menu.length||Object.keys(L).length||S.patientName)){if(archives.length>=500)throw Error('退避記録の上限です。バックアップを保存して整理してください。');archives.push({settings:C.clone(S),logs:C.clone(L),savedAt:new Date().toISOString()});}}
function newPatient(){if(!requireStaff()||!confirm('現在の患者記録を退避し、別の患者を新規作成します。'))return;archiveCurrent();S=C.settings({menu:[],startDate:todayKey(),knownSince:todayKey()},uid(),todayKey());L={};persist();renderTherapist();renderHeader();}
function showArchives(){if(!requireStaff())return;modal('archiveModal','退避した患者記録',archives.length?archives.map((a,i)=>`<div class="card"><p>${escapeHtml(a.settings.patientName||'名前未設定')} ／ ${Object.keys(a.logs).length}日分</p><p class="hint">${escapeHtml(a.savedAt)}</p><button class="btn btn-out" onclick="restoreArchive(${i})">この患者に切り替える</button></div>`).join(''):'<p>退避記録はありません。</p>');}
function restoreArchive(i){if(!requireStaff()||!archives[i]||!confirm('現在の記録を退避して切り替えますか？'))return;const a=archives.splice(i,1)[0];archiveCurrent();S=a.settings;L=a.logs;persist();$('archiveModal').remove();renderTherapist();renderHeader();}
function buildSharePayload(){
  return {version:2,patientId:S.patientId,startDate:S.startDate,nextVisit:S.nextVisit,menu:C.menu(S.menu)};
}
function buildShareUrl(){
  if(!requireStaff())return null;if(!S.menu.length){toast('メニューを設定してください');return null;}
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
    if(same){C.changeMenu(S,L,data.menu,todayKey(),dk(addDays(new Date(),1)));S.nextVisit=data.nextVisit;}
    else{const name=prompt('この端末に表示する呼び名を入力してください（空欄でも使えます）。',C.text(raw.patientName,80));if(name===null)return false;archiveCurrent();S=data;S.patientName=C.text(name,80);S.age='';S.diagnosis='';S.knownSince=S.startDate;S.plans=[{from:S.startDate,menu:C.clone(S.menu)}];L={};}
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
function resetAll(){if(!requireStaff()||!confirm('この患者の情報・メニュー・実施記録を削除します。バックアップは保存しましたか？')||!confirm('本当に削除しますか？'))return;S=null;L={};persist();closeTherapist();$('setupOverlay').hidden=false;}

// Date rollover must refresh the displayed prescription before any new input.
function refreshDay(){if(activeDay!==todayKey()){activeDay=todayKey();renderHeader();renderToday();if($('tab-cal').classList.contains('active'))renderCalendar();if($('tab-prog').classList.contains('active'))renderProgress();}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDay();});
setInterval(refreshDay,30000);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){for(const id of ['guideModal','reportModal','chooseTemplate','exEditModal','archiveModal','tplManage']){const dialog=$(id);if(dialog){dialog.remove();break;}}}});
