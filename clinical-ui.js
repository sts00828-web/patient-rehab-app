/* v0.2 review shelf and explicit patient sessions. Legacy keys stay untouched. */
const CR=ClinicalRules, CC=ClinicalCatalog;
const legacyPrescriptionHtml=prescriptionHtml;
prescriptionHtml=function(ex){const r=ex.clinicalV02;return legacyPrescriptionHtml(ex)+(r?`<p class="notice">個別制限：${escapeHtml(r.constraints)}</p>${r.restSeconds?`<p>セット間休息：${r.restSeconds}秒</p>`:''}${r.sportPlan?`<p class="notice">競技準備の個別計画：${escapeHtml(r.sportPlan)}</p>`:''}`:'');};
const legacyMediaFor=mediaFor;
mediaFor=function(ex){const d=CR.definition(ex);return CR.isNew(ex)?(CR.imagePath(ex)&&(!S||ex.clinicalV02?.patient?.patientId===S.patientId)?{...d,imagePath:d.image}:null):legacyMediaFor(ex);};
function exerciseImageHtml(ex,preview=false){
  const d=CR.definition(ex),m=CR.isNew(ex)?d:legacyMediaFor(ex);
  const path=CR.isNew(ex)?(preview||ex.clinicalV02?.patient?.patientId===S?.patientId?CR.imagePath(ex,preview):null):m&&!ex.mediaDisabled?'assets/exercises/'+m.image:null;
  if(!path)return `<p class="notice">${escapeHtml(d?.image? '画像・個別条件の確認が必要です':d?.assetStatus||'イラストなし')}。担当者に確認してください。</p>`;
  return `<figure><img class="guide-image" src="${escapeAttr(path)}" alt="${escapeAttr(m.name)}の姿勢" onerror="this.hidden=true;this.parentElement.querySelector('.image-failure').hidden=false;this.closest('#patientSession')?.querySelector('[data-start]')?.setAttribute('disabled','')"><p class="image-failure notice" hidden>画像を読み込めません。開始せず担当者に確認してください。</p>${m.imageCaption?`<figcaption>${escapeHtml(m.imageCaption)}</figcaption>`:''}</figure>`;
}
function clinicalCatalogHtml(){
  return `<section id="clinical-catalog" class="t-sec"><div class="t-sec-ttl">疾患別メニューから選ぶ</div>${[['G','一般向け'],['A','競技向け']].map(([prefix,label])=>`<h3>${label}</h3><div class="tpl-grid">${Object.values(CC.categories).filter(c=>c.id.startsWith(prefix)).map(c=>`<button class="tpl-card" data-clinical-category="${c.id}" onclick="openClinicalShelf('${c.id}')">${escapeHtml(c.name)}</button>`).join('')}</div>`).join('')}</section>`;
}
const legacyEditEx=editEx;
editEx=function(i){if(S?.menu[i]&&CR.isNew(S.menu[i])){const d=CR.definition(S.menu[i]);if(!d){toast('未対応の運動IDです。処方は保持しています。');return;}return openClinicalPrescription(d.id,S.menu[i].clinicalV02.categoryId,i);}return legacyEditEx(i);};
const legacyApplySelectedTemplate=applySelectedTemplate;
applySelectedTemplate=function(share=false){const previous=S?.template;try{return legacyApplySelectedTemplate(share);}catch(e){if(S)S.template=previous;alert(e.message+'\nこの運動は「疾患別メニューから選ぶ」で、この患者への処方確認を行ってください。');}};
function openClinicalShelf(categoryId='G03',level='beginner'){
  if(!requireStaff())return;
  const c=CC.categories[categoryId];if(!c?.levels[level])return;
  modal('clinicalShelf','疾患別の運動候補',`<p>量は設計案です。臨床責任者の承認と患者ごとのPT確認が済むまで、患者へ確定できません。必要な運動だけを選んでください。</p><label for="clinical-category">疾患カテゴリー</label><select class="fld-inp" id="clinical-category" onchange="openClinicalShelf(this.value,'${level}')">${Object.values(CC.categories).map(x=>`<option value="${x.id}" ${x.id===categoryId?'selected':''}>${escapeHtml(x.id+' '+x.name)}</option>`).join('')}</select><label for="clinical-level">候補段階（患者の自己進級ではありません）</label><select class="fld-inp" id="clinical-level" onchange="openClinicalShelf('${categoryId}',this.value)">${Object.entries({beginner:'初級',intermediate:'中級',advanced:'上級'}).map(([k,v])=>`<option value="${k}" ${k===level?'selected':''}>${v}</option>`).join('')}</select><p class="notice">${escapeHtml(c.notes)}</p>${c.levels[level].map(id=>{const d=CC.definitions[id];return `<article class="card"><h3>${id} ${escapeHtml(d.name)}</h3><p>${escapeHtml(d.purpose)}</p><p>量の案：${escapeHtml(d.doseProposal)} ／ ${escapeHtml(CC.presets[d.doseProposal[0]]||'')}</p><p>${escapeHtml(d.assetStatus)}・臨床承認未設定</p><button class="btn btn-out" onclick="previewClinical('${id}')">画像・説明をレビュー</button><button class="btn btn-pri" ${!d.image?'disabled':''} onclick="openClinicalPrescription('${id}','${categoryId}')">個別処方と承認を入力</button>${!d.image?`<p class="notice">保留：${escapeHtml(d.assetNotes)}</p>`:''}</article>`;}).join('')}`);
}
function previewClinical(id){const d=CC.definitions[id];if(!d||!requireStaff())return;modal('clinicalPreview',escapeHtml(id+' '+d.name),`<p class="notice">臨床承認前のレビュー用。画像の採用候補は開始許可ではありません。</p>${exerciseImageHtml({exerciseKey:d.key},true)}<p>${escapeHtml(d.steps.join(' '))}</p><p>目的：${escapeHtml(d.purpose)}</p><p>用具：${escapeHtml(d.equipment)}</p><p>量の案：${escapeHtml(d.doseProposal)} ／ ${escapeHtml(CC.presets[d.doseProposal[0]]||'')}</p><p class="notice">${escapeHtml(d.caution)}</p><p>姿勢・支持・負荷：${escapeHtml(d.pose)}</p><p>図の確認：${escapeHtml(d.assetNotes)}</p>`);}
const clinicalFieldLabels={reps:'1セットの量（回・歩・分・呼吸）',sets:'セット数',holdSeconds:'1回の保持秒（該当時）',restSeconds:'休息秒（競技準備は必須）',sessionsPerDay:'1日の実施回数',daysPerWeek:'週の実施日数',load:'負荷・重さ（なしも明示）',rom:'許可する方向・動かす範囲',support:'支持物・用具・見守り',constraints:'個別制限（ない場合も明記）',sportPlan:'競技準備の回数・速度・場所・休息・個別計画',extraReason:'6種を超えて処方する理由'};
const surgeryLabels={name:'手術名',date:'手術日',site:'修復部位',prohibited:'禁止動作',rom:'ROM制限',weightBearing:'荷重制限',resistance:'抵抗開始の許可',confirmedDate:'確認日',instructor:'指示者（職員識別子）',protocol:'プロトコル版'};
let clinicalDraft=null;
function openClinicalPrescription(id,categoryId,index=-1){
  if(!requireStaff())return;const d=CC.definitions[id];if(!d||!Object.hasOwn(CC.categories,categoryId))return;
  const ex=index>=0?S.menu[index]:{id:uid(),name:d.name,exerciseKey:d.key,dows:[],clinicalV02:{categoryId}},r=CR.normalize(ex.clinicalV02);
  clinicalDraft={ex:C.clone(ex),index,patientId:S.patientId};
  r.patient.confirmed=false;r.imageCompatible=false;
  const input=(key,label,value,type='text')=>`<label class="fld-lbl" for="cr-${key}">${label}</label><input class="fld-inp" id="cr-${key}" type="${type}" ${type==='number'?'min="0" step="any"':''} value="${escapeAttr(value??'')}" maxlength="1000">`;
  modal('clinicalPrescription',escapeHtml(d.id+' '+d.name+'：個別処方'),`<p class="notice">${escapeHtml(CC.categories[categoryId].notes)}。量の案を個別処方として自動確定しません。</p><button class="btn btn-out" onclick="previewClinical('${id}')">画像・本文・量の案を確認</button><p>${escapeHtml(d.steps[0])}</p><p>量の案：${escapeHtml(d.doseProposal)} ／ ${escapeHtml(CC.presets[d.doseProposal[0]]||'')}</p><p class="notice">${escapeHtml(d.caution)}</p><label for="cr-side">指定側（画像は反転しません）</label><select class="fld-inp" id="cr-side">${Object.entries({'':'未設定',right:'右',left:'左（対応画像未検証）',bilateral:'両側',alternating:'左右交互',none:'左右指定なし'}).map(([k,v])=>`<option value="${k}" ${r.side===k?'selected':''}>${v}</option>`).join('')}</select><label for="cr-doseUnit">量の単位</label><select class="fld-inp" id="cr-doseUnit">${['','回','歩','分','呼吸'].map(v=>`<option ${v===r.doseUnit?'selected':''}>${v}</option>`).join('')}</select><label for="cr-amountBasis">片側・左右各・合計</label><select class="fld-inp" id="cr-amountBasis">${Object.entries({'':'未設定',per_side:'指定側につき',each_side:'左右各',total:'合計'}).map(([k,v])=>`<option value="${k}" ${r.amountBasis===k?'selected':''}>${v}</option>`).join('')}</select>${Object.entries(clinicalFieldLabels).map(([k,v])=>input(k,v,r[k],['reps','sets','holdSeconds','restSeconds','sessionsPerDay','daysPerWeek'].includes(k)?'number':'text')).join('')}<label class="pick-label"><input type="checkbox" id="cr-hold-na" ${r.holdNotApplicable?'checked':''}>保持時間を指定しない運動であることを確認した（保持秒未入力時は必須）</label><fieldset><legend>実施曜日（毎日も明示選択）</legend>${DOW_LABEL.map((v,i)=>`<label class="pick-label"><input type="checkbox" id="cr-day-${i}" ${ex.dows.includes(i)?'checked':''}>${v}</label>`).join('')}</fieldset><label for="cr-operative">保存療法／術後</label><select class="fld-inp" id="cr-operative" onchange="document.getElementById('cr-surgery').hidden=this.value!=='yes'"><option value="">未確認</option><option value="no" ${r.postoperative===false?'selected':''}>手術なし</option><option value="yes" ${r.postoperative===true?'selected':''}>術後</option></select><fieldset id="cr-surgery" ${r.postoperative!==true?'hidden':''}><legend>術後の必須指示</legend>${Object.entries(surgeryLabels).map(([k,v])=>input('surgery-'+k,v,r.surgery[k])).join('')}</fieldset><fieldset><legend>必要な許可（未設定は開始不可）</legend>${CR.requiredGates(ex).map(g=>`<label for="cr-gate-${g}">${g} ${escapeHtml(CC.gates[g])}</label><select class="fld-inp" id="cr-gate-${g}">${Object.entries({pending:'未確認',allowed:'許可を確認',not_applicable:'該当しない（条件付きのみ・理由必須）',denied:'不許可'}).map(([k,v])=>`<option value="${k}" ${r.gates[g]?.status===k?'selected':''}>${v}</option>`).join('')}</select>${input('details-'+g,'許可内容・根拠・確認日／非該当の理由',r.gates[g]?.details)}`).join('')}</fieldset><label class="pick-label"><input type="checkbox" id="cr-image" ${r.imageCompatible?'checked':''}>この画像の動作側・姿勢・支持・範囲が今回の指示と一致することを実見確認した</label><label class="pick-label"><input type="checkbox" id="cr-supervised" ${r.supervised?'checked':''}>競技準備をPT監督下で確認した（G7）</label><fieldset><legend>臨床責任者：本文・量の案・画像の承認</legend>${input('clinical-reviewer','承認者の職員識別子（患者氏名は入力しない）',r.clinical.reviewer)}${input('clinical-date','承認日',r.clinical.date,'date')}<label class="pick-label"><input type="checkbox" id="cr-approved" ${r.clinical.approved?'checked':''}>実際の臨床承認を確認した</label></fieldset><fieldset><legend>担当PT：今回の患者への処方確認</legend>${input('patient-reviewer','担当PTの職員識別子',r.patient.reviewer)}${input('patient-date','確認日',r.patient.date,'date')}<label class="pick-label"><input type="checkbox" id="cr-confirmed" ${r.patient.confirmed?'checked':''}>左右・量・曜日・制限・開始許可を確認した</label></fieldset><p id="cr-errors" role="alert"></p><button class="btn btn-pri" onclick="saveClinicalPrescription()">確認した処方を保存</button><p>この画面は端末内の確認記録です。本人認証や電子署名ではありません。</p>`);
  // Confirmation applies to the final individual prescription, not an earlier draft.
  for(const type of ['input','change'])$('clinicalPrescription').addEventListener(type,invalidateClinicalConfirmation);
}
function invalidateClinicalConfirmation(event){
  const id=event.target?.id||'';
  if(!id.startsWith('cr-')||['cr-image','cr-confirmed','cr-errors'].includes(id)||id.startsWith('cr-clinical-')||id==='cr-approved'||id.startsWith('cr-patient-'))return;
  $('cr-image').checked=false;$('cr-confirmed').checked=false;
  $('cr-errors').textContent='内容を変更しました。画像適合と担当PTの個別処方確認をやり直してください。';
}
function saveClinicalPrescription(){
  if(!requireStaff()||!clinicalDraft||clinicalDraft.patientId!==S.patientId)return;
  const {ex,index}=clinicalDraft,d=CR.definition(ex),r=CR.normalize(ex.clinicalV02),val=k=>$('cr-'+k).value;
  for(const k of Object.keys(clinicalFieldLabels))r[k]=['reps','sets','holdSeconds','restSeconds','sessionsPerDay','daysPerWeek'].includes(k)?(val(k)===''?null:Number(val(k))):val(k);
  r.holdNotApplicable=$('cr-hold-na').checked;
  r.side=val('side');r.doseUnit=val('doseUnit');r.amountBasis=val('amountBasis');r.revision=uid();r.postoperative=val('operative')===''?null:val('operative')==='yes';
  for(const k of Object.keys(surgeryLabels))r.surgery[k]=val('surgery-'+k);
  for(const g of CR.requiredGates(ex))r.gates[g]={status:val('gate-'+g),details:val('details-'+g)};
  r.imageCompatible=$('cr-image').checked;r.imageId=d.image||'';r.imageSha256=d.sha256||'';r.supervised=$('cr-supervised').checked;
  r.clinical={approved:$('cr-approved').checked,reviewer:val('clinical-reviewer'),date:val('clinical-date')};
  r.patient={confirmed:$('cr-confirmed').checked,reviewer:val('patient-reviewer'),date:val('patient-date'),patientId:S.patientId};
  const dows=DOW_LABEL.map((_,i)=>i).filter(i=>$('cr-day-'+i).checked);
  const next={...ex,clinicalV02:CR.normalize(r),dows,scheduleConfirmed:true,note:r.constraints,params:'',prescription:{side:({right:'右',left:'左',bilateral:'両側',alternating:'左右交互',none:'左右指定なし'})[r.side]||'',repetitions:r.reps?`${r.reps}${r.doseUnit}（指定側につき／交互は左右各）`:'',sets:r.sets?`${r.sets}セット`:'',hold:r.holdSeconds?`${r.holdSeconds}秒`:'該当なし',frequency:r.sessionsPerDay?`1日${r.sessionsPerDay}回・週${r.daysPerWeek}日`:'',load:r.load+'／'+r.rom,support:r.support}};
  try{if(!dows.length||dows.length!==r.daysPerWeek)throw Error('実施曜日の数と週の実施日数を一致させてください。');const menu=C.clone(S.menu);if(index>=0)menu[index]=next;else menu.push(next);next.prescription=CR.prescription(r);CR.assertPrescribable(menu);commitMenu(menu);closeModal('clinicalPrescription');closeModal('clinicalShelf');clinicalDraft=null;renderTherapist();toast('個別処方を保存しました');}catch(e){$('cr-errors').textContent=e.message;}
}

// A started session is intentionally transient: opening/closing never records completion.
let patientSession=null;
statusLabels.rest='今日は休んだ';statusLabels.cancelled='記録取消';
function patientItems(){return todayExercises(todayDow());}
function patientAccessIssues(ex){return CR.isNew(ex)?[...C.prescriptionIssues(ex),...(ex.clinicalV02?.patient?.patientId!==S?.patientId?['この患者への処方確認が必要です']:[])]:(!ex.mediaDisabled&&!legacyMediaFor(ex)&&ex.exerciseKey?['未対応の運動：担当者へ確認してください']:[]);}
function openPatientSession(i){
  const ex=patientItems()[i];if(!ex)return;
  if(!patientSession||patientSession.itemId!==ex.id||patientSession.day!==todayKey()||patientSession.patientId!==S.patientId)patientSession={id:uid(),itemId:ex.id,day:todayKey(),patientId:S.patientId,started:false,saved:false,revision:ex.clinicalV02?.revision||'legacy',index:i};
  drawPatientSession(ex);
}
showExercise=openPatientSession;
function drawPatientSession(ex){
  const s=patientSession,m=CR.isNew(ex)?CR.definition(ex):legacyMediaFor(ex),problems=patientAccessIssues(ex),log=getLog(s.day),events=(log.events||[]).filter(e=>e.prescription_item_id===ex.id&&e.prescription_version===s.revision),last=events.at(-1),status=log.status?.[ex.id]||(log.done?.[ex.id]?'done':'');
  modal('patientSession',escapeHtml(ex.name),`<div data-patient-session><p class="notice"><strong>いつもと違う強い痛み、しびれ・力の入りにくさが出たら中止してください。</strong></p>${exerciseNotices(ex,m)}${prescriptionHtml(ex)}${problems.length?`<p class="notice">開始できません：${escapeHtml(problems.join('、'))}</p>`:''}${exerciseImageHtml(ex)}<p>${escapeHtml(m?.steps?.join(' ')||'院内で説明された手順を確認してください。')}</p>${m?`<details><summary>目的・用具</summary><p>${escapeHtml(m.purpose)}／${escapeHtml(m.equipment)}</p></details>`:''}<p>胸痛・強い息苦しさ・失神・急な麻痺は119など緊急対応を優先してください。新しい排尿困難・失禁、会陰部の感覚異常、急な強い両脚症状は速やかに救急受診してください。</p>${consultationHtml()}<div class="session-inputs"><label for="session-reps">実際の量（任意・空欄は回数不明）</label><input id="session-reps" class="fld-inp" type="number" min="0" step="any"><label for="session-reason">理由・メモ（任意）</label><input id="session-reason" class="fld-inp" maxlength="500"></div><p role="status" id="session-status">${s.saved?'この端末に保存済み':s.started?'実施中（完了は未記録）':status?'今日の状態：'+(statusLabels[status]||status):'未開始'}</p><div class="session-actions">${s.saved||status&&!s.started?`<button class="btn btn-pri" onclick="newPatientSession()">別の回を始める</button><button class="btn btn-out" onclick="correctPatientRecord('${last?.event_id||''}')">記録を訂正</button>`:s.started?`<button class="btn btn-pri" onclick="recordPatientSession('done')">できた・記録する</button><button class="btn btn-out" onclick="recordPatientSession('partial')">一部だけできた</button><button class="btn btn-stop" onclick="recordPatientSession('pain')">痛みなどで中止</button>`:`<button data-start class="btn btn-pri" ${problems.length?'disabled':''} onclick="startPatientSession()">運動を始める</button><button class="btn btn-out" onclick="recordPatientSession('rest')">今日は休む</button>`}</div>${events.length?`<details><summary>実施回・訂正履歴 ${events.length}件</summary>${events.map(e=>`<p>${escapeHtml(e.timestamp_unknown?e.local_date+' 実施時刻不明（旧日次記録）':e.timestamp)}：${statusLabels[e.status]}／${e.reported_reps===null?'回数不明':e.reported_reps} ${e.supersedes_event_id?'（訂正）':''}</p>${!events.some(n=>n.supersedes_event_id===e.event_id)?`<button class="btn btn-out" onclick="correctPatientRecord('${e.event_id}')">この実施回を訂正</button>`:''}`).join('')}</details>`:''}<p id="session-error" role="alert"></p></div>`);
}
const drawPatientSessionContent=drawPatientSession;
drawPatientSession=function(ex){drawPatientSessionContent(ex);const dialog=$('patientSession');dialog.querySelector('.t-modal').appendChild(dialog.querySelector('.session-actions'));dialog.querySelector('[data-patient-session]').insertAdjacentHTML('beforeend','<section id="patient-video"></section>');if(typeof PatientVideo!=='undefined')PatientVideo.mount(ex);if(C.videoUrl(ex.videoUrl))dialog.querySelector('[data-patient-session]').insertAdjacentHTML('beforeend',`<a class="btn btn-out" href="${escapeAttr(C.videoUrl(ex.videoUrl))}" target="_blank" rel="noopener noreferrer">担当者の動画を見る</a>`);};
function currentSessionExercise(){const s=patientSession;if(!s||(!s.history&&s.day!==todayKey())||s.day>todayKey()||s.patientId!==S?.patientId)throw Error('日付または患者が変わりました。今日の画面から開き直してください。');const ex=(s.history?getLog(s.day).menuSnapshot||[]:patientItems()).find(e=>e.id===s.itemId);if(!ex||(ex.clinicalV02?.revision||'legacy')!==s.revision)throw Error('処方が変わりました。開き直してください。');return ex;}
function sessionError(e){const node=$('session-error');if(node)node.textContent=e.message;else toast(e.message);}
function startPatientSession(){try{if(patientSession?.history)throw Error('過去の記録から運動は開始できません。今日の画面へ戻ってください。');const ex=currentSessionExercise(),issues=patientAccessIssues(ex);if(issues.length)throw Error(issues.join('、'));const img=$('patientSession').querySelector('img');if((CR.isNew(ex)||legacyMediaFor(ex))&&!ex.mediaDisabled&&(!img?.complete||!img.naturalWidth))throw Error('画像が確認できません。読み込み後に開始してください。');patientSession.started=true;drawPatientSession(ex);}catch(e){sessionError(e);}}
function newPatientSession(){try{if(patientSession?.history)throw Error('過去の記録では新しい実施回を開始できません。');const ex=currentSessionExercise();patientSession={...patientSession,id:uid(),started:false,saved:false};drawPatientSession(ex);const node=$('patientSession').querySelector('.session-actions');node.innerHTML=`<button data-start class="btn btn-pri" onclick="startPatientSession()">運動を始める</button><button class="btn btn-out" onclick="recordPatientSession('rest')">今日は休む</button>`;}catch(e){sessionError(e);}}
function recordPatientSession(status,supersedes=null){
  try{
    const ex=currentSessionExercise(),s=patientSession;if(s.saved&&!supersedes)return;
    if(s.history&&!supersedes)throw Error('過去の実施回は訂正だけを行えます。');
    if(!['done','partial','pain','rest','cancelled'].includes(status))return;
    if(!supersedes&&status!=='rest'&&!s.started)throw Error('先に運動を始めてください。');
    if(['done','partial'].includes(status)){const errors=patientAccessIssues(ex);if(errors.length)throw Error(errors.join('、'));}
    const value=$('session-reps')?.value,reported=value===''||value===undefined?null:Number(value);if(reported!==null&&(!Number.isFinite(reported)||reported<0))throw Error('実際の量を確認してください。');
    const log=s.history?L[s.day]:writableLog();log.events=log.events||[];
    if(!supersedes&&log.events.some(e=>e.session_id===s.id))return;
    const prior=supersedes&&log.events.find(e=>e.event_id===supersedes);
    if(supersedes&&supersedes!=='legacy'&&(!prior||prior.prescription_item_id!==ex.id||log.events.some(e=>e.supersedes_event_id===supersedes)))throw Error('訂正対象が更新されました。開き直してください。');
    if(supersedes==='legacy'&&log.events.some(e=>e.prescription_item_id===ex.id))throw Error('記録が更新されました。開き直してください。');
    // Capture a legacy self-report before adding its first correction.
    let target=supersedes;
    if(supersedes==='legacy'){target=uid();log.events.push({event_id:target,session_id:uid(),prescription_item_id:ex.id,prescription_version:s.revision,local_date:s.day,time_zone:'Asia/Tokyo',timestamp:null,timestamp_unknown:true,imported_at:new Date().toISOString(),status:log.status[ex.id]||(log.done[ex.id]?'done':'rest'),reported_reps:null,reason_optional:'旧日次記録から訂正時に保存（実施時刻不明）',supersedes_event_id:null});}
    log.events.push({event_id:uid(),session_id:prior?.session_id||(target&&log.events.find(e=>e.event_id===target)?.session_id)||s.id,prescription_item_id:ex.id,prescription_version:s.revision,local_date:s.day,time_zone:'Asia/Tokyo',timestamp:new Date().toISOString(),status,reported_reps:reported,reason_optional:$('session-reason')?.value||'',supersedes_event_id:target});
    const active=log.events.filter(e=>e.prescription_item_id===ex.id&&e.prescription_version===s.revision&&!log.events.some(n=>n.supersedes_event_id===e.event_id));
    const current=active.some(e=>e.status==='done')?'done':active.at(-1)?.status||'cancelled';log.status[ex.id]=current;log.done[ex.id]=current==='done';
    saveLogs();s.saved=true;s.started=false;renderToday();drawPatientSession(ex);if(s.history)correctPatientRecord(log.events.at(-1).event_id);
    if(status==='pain')$('session-status').textContent='中止を記録しました。運動を控え、医療者へ相談してください。緊急症状では記録より受診を優先してください。';
  }catch(e){sessionError(e);}
}
function correctPatientRecord(eventId){
  const ex=currentSessionExercise(),events=getLog(patientSession.day).events||[],target=eventId||'legacy';
  $('patientSession').querySelector('.session-actions').innerHTML=`<label for="session-correction">訂正内容</label><select id="session-correction" class="fld-inp"><option value="cancelled">記録を取り消す</option><option value="partial">一部実施</option><option value="pain">中止</option><option value="rest">休み</option><option value="done">完了（本人確認）</option></select><button class="btn btn-pri" onclick="recordPatientSession(document.getElementById('session-correction').value,'${target}')">訂正を保存</button>`;
}
function openRecordHistory(){
  if(!S)return;
  modal('recordHistory','保存した実施記録・訂正',Object.keys(L).sort().reverse().map(day=>`<section class="card"><h3>${day}</h3>${L[day].menuSnapshot?.length?L[day].menuSnapshot.map(ex=>`<p>${escapeHtml(ex.name)}：${escapeHtml(statusLabels[L[day].status?.[ex.id]]||(L[day].done?.[ex.id]?'できた':'未記録'))}</p>${L[day].status?.[ex.id]||L[day].done?.[ex.id]?`<button class="btn btn-out" onclick="openHistoricalSession('${day}','${ex.id}')">この記録を確認・訂正</button>`:''}`).join(''):'<p>当時の処方が不明な旧記録です。原記録を保持しています。</p>'}</section>`).join('')||'<p>保存した記録はありません。</p>');
}
function openHistoricalSession(day,itemId){
  if(!S||!C.validDate(day)||day>todayKey())return;
  const ex=L[day]?.menuSnapshot?.find(e=>e.id===itemId);if(!ex)return;
  patientSession={id:uid(),itemId,day,patientId:S.patientId,revision:ex.clinicalV02?.revision||'legacy',history:true,started:false,saved:true};
  drawPatientSession(ex);correctPatientRecord((L[day].events||[]).filter(e=>e.prescription_item_id===itemId&&e.prescription_version===patientSession.revision).at(-1)?.event_id||'');
  $('session-status').textContent=day+' の記録を訂正します。当時の処方を表示しています。';
}
// Keep the old callable status API for legacy integrations; new items cannot bypass sessions.
const legacySetExerciseStatus=setExerciseStatus;
setExerciseStatus=function(i,v){if(CR.isNew(patientItems()[i]||{}))return openPatientSession(i);return legacySetExerciseStatus(i,v);};
const legacyShowGuide=showGuide;
showGuide=function(ex){if(!CR.isNew(ex))return legacyShowGuide(ex);const d=CR.definition(ex);if(staffUnlocked&&d)return previewClinical(d.id);const i=patientItems().findIndex(e=>e.id===ex.id);if(i>=0)openPatientSession(i);};
async function cacheClinicalImages(){
  const output=$('clinical-cache-status');
  try{if(!navigator.serviceWorker?.controller)throw Error('オンラインで再読み込み後に試してください。');
    const paths=(S?.menu||[]).map(ex=>CR.imagePath(ex)).filter(Boolean),channel=new MessageChannel();
    if(output)output.textContent='選択された画像を保存しています…';
    const result=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('保存状況を確認できません。オンラインで再度確認してください。')),45000);channel.port1.onmessage=e=>{clearTimeout(timer);resolve(e.data);};navigator.serviceWorker.controller.postMessage({type:'cache-selected-images',paths},[channel.port2]);});
    if(output)output.textContent=`選択画像 ${result.total}件中 ${result.total-result.failed}件を保存。${result.failed?'未保存画像があります。オフラインで開始できない運動があります。':'この端末でオフライン確認してください。'}`;
  }catch(e){if(output)output.textContent=e.message;}
}
const renderTodayWithClinical=renderToday;
renderToday=function(){renderTodayWithClinical();if(S&&!storageBlocked)$('today-content').insertAdjacentHTML('beforeend','<div class="card"><button class="btn btn-out" onclick="openRecordHistory()">過去の実施記録・訂正</button><button class="btn btn-out" onclick="cacheClinicalImages()">選択された新画像をオフライン用に保存</button><p id="clinical-cache-status" role="status">画像は表示時にも保存します。端末の空き容量によっては保存できません。</p></div>');};
renderToday();
