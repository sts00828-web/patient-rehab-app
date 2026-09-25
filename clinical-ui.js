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
// UI state is local to this patient; it is never part of a prescription or backup.
let clinicalSelection=null;
function clinicalSelectionState(){
  if(clinicalSelection?.patientId!==S.patientId){
    clinicalSelection={patientId:S.patientId,audience:'G',query:'',categoryId:null,level:'beginner'};
    clinicalDraft=null;
    clinicalBatch=null;
    for(const id of ['clinicalShelf','clinicalPrescription','clinicalPreview'])closeModal(id);
  }
  return clinicalSelection;
}
function clinicalCategoryName(c){return c.name.replace(/^(一般|競技)：/,'').replace('膝OA','膝の変形・痛み（変形性膝関節症）');}
function clinicalCategoryCards(){
  const state=clinicalSelectionState(),query=state.query.trim().toLocaleLowerCase();
  const categories=Object.values(CC.categories).filter(c=>c.id.startsWith(state.audience)&&(!query||(clinicalCategoryName(c)+' '+c.name).toLocaleLowerCase().includes(query)));
  return categories.length?categories.map(c=>`<button class="tpl-card" data-clinical-category="${c.id}" onclick="openClinicalShelf('${c.id}')">${escapeHtml(clinicalCategoryName(c))}</button>`).join(''):'<p role="status">該当する疾患がありません。検索語や一般／競技を変更してください。</p>';
}
function clinicalCatalogHtml(){
  const state=clinicalSelectionState();
  return `<section id="clinical-catalog" class="t-sec"><div class="t-sec-ttl">疾患別メニューから選ぶ</div><div class="clinical-switch" role="group" aria-label="一般・競技の切替">${[['G','一般向け'],['A','競技向け']].map(([key,label])=>`<button type="button" class="btn btn-out" data-clinical-audience="${key}" aria-pressed="${state.audience===key}" onclick="setClinicalAudience('${key}')">${label}</button>`).join('')}</div><label for="clinical-search">疾患名で検索</label><input id="clinical-search" class="fld-inp" type="search" value="${escapeAttr(state.query)}" oninput="filterClinicalCategories(this.value)"><div id="clinical-categories" class="tpl-grid">${clinicalCategoryCards()}</div></section>`;
}
function setClinicalAudience(audience){
  if(!requireStaff()||!['G','A'].includes(audience))return;
  clinicalSelectionState().audience=audience;
  document.querySelectorAll('[data-clinical-audience]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.clinicalAudience===audience)));
  $('clinical-categories').innerHTML=clinicalCategoryCards();
}
function filterClinicalCategories(query){if(!requireStaff())return;clinicalSelectionState().query=query;$('clinical-categories').innerHTML=clinicalCategoryCards();}
const legacyEditEx=editEx;
editEx=function(i){if(S?.menu[i]&&CR.isNew(S.menu[i])){const d=CR.definition(S.menu[i]);if(!d){toast('未対応の運動IDです。処方は保持しています。');return;}return openClinicalPrescription(d.id,S.menu[i].clinicalV02.categoryId,i);}return legacyEditEx(i);};
const legacyApplySelectedTemplate=applySelectedTemplate;
applySelectedTemplate=function(share=false){const previous=S?.template;try{return legacyApplySelectedTemplate(share);}catch(e){if(S)S.template=previous;alert(e.message+'\nこの運動は「疾患別メニューから選ぶ」で、この患者への処方確認を行ってください。');}};
function previewClinical(id){const d=CC.definitions[id];if(!d||!requireStaff())return;modal('clinicalPreview',escapeHtml(id+' '+d.name),`<p class="notice">臨床承認前のレビュー用。画像の採用候補は開始許可ではありません。</p>${exerciseImageHtml({exerciseKey:d.key},true)}<p>${escapeHtml(d.steps.join(' '))}</p><p>目的：${escapeHtml(d.purpose)}</p><p>用具：${escapeHtml(d.equipment)}</p><p>量の案：${escapeHtml(d.doseProposal)} ／ ${escapeHtml(CC.presets[d.doseProposal[0]]||'')}</p><p class="notice">${escapeHtml(d.caution)}</p><p>姿勢・支持・負荷：${escapeHtml(d.pose)}</p><p>図の確認：${escapeHtml(d.assetNotes)}</p>`);}
const clinicalFieldLabels={reps:'1セットの量（往復は片道の歩数）',sets:'セット数',holdSeconds:'1回の保持秒（該当時）',restSeconds:'休息秒（競技準備は必須）',sessionsPerDay:'1日の実施回数',daysPerWeek:'週の実施日数',load:'負荷・重さ（なしも明示）',rom:'許可する方向・動かす範囲',support:'支持物・用具・見守り',constraints:'個別制限（ない場合も明記）',sportPlan:'競技準備の回数・速度・場所・休息・個別計画',extraReason:'6種を超えて処方する理由'};
const surgeryLabels={name:'手術名',date:'手術日',site:'修復部位',prohibited:'禁止動作',rom:'ROM制限',weightBearing:'荷重制限',resistance:'抵抗開始の許可',confirmedDate:'確認日',instructor:'指示者（職員識別子）',protocol:'プロトコル版'};
// One patient-local transaction. Filters only change visibility, never the draft values.
let clinicalBatch=null;
const clinicalNumberKeys=['reps','sets','holdSeconds','restSeconds','sessionsPerDay','daysPerWeek'];
const clinicalTapValues={reps:[2,3,5,8,10,20],sets:[1,2,3],holdSeconds:[2,3,5,10,20],restSeconds:[30,60,90],sessionsPerDay:[1,2],daysPerWeek:[2,3,5,7]};
function newClinicalCandidate(id,categoryId){
  const d=CC.definitions[id],existing=S.menu.find(ex=>ex.exerciseKey===d.key),saved=standardPrescription({exerciseKey:d.key});
  const ex=existing?C.clone(existing):{id:uid(),name:d.name,exerciseKey:d.key,dows:[],scheduleConfirmed:false};
  const r=CR.normalize(existing?.clinicalV02||{...CR.doseDraft(id),...(saved?.clinicalV02||{}),categoryId});
  if(!existing){
    // Only typed dose fields from an exact v02 key may be reused. Never borrow patient permissions.
    for(const key of ['side','load','rom','constraints','sportPlan'])r[key]='';
    r.gates={};r.postoperative=null;r.surgery=CR.normalize({}).surgery;r.clinical=CR.normalize({}).clinical;
    r.holdNotApplicable=false;r.supervised=false;
  }
  r.patient={confirmed:false,reviewer:'',date:null,patientId:S.patientId};r.imageCompatible=false;
  ex.clinicalV02=r;
  return {ex,selected:false,base:existing?JSON.stringify(existing):null,standard:saved?.clinicianDefault?saved:null};
}
function batchInput(id,key,label,value,type='text'){
  const prefix='cb-'+id+'-';
  return `<label class="fld-lbl" for="${prefix+key}">${escapeHtml(label)}</label>${clinicalTapValues[key]?`<div class="dose-options">${clinicalTapValues[key].map(v=>`<button type="button" class="dose-choice" onclick="setClinicalBatchValue('${id}','${key}',${v})">${v}</button>`).join('')}</div>`:''}<input class="fld-inp" id="${prefix+key}" data-batch-key="${key}" type="${type}" ${type==='number'?'min="0" step="any"':''} maxlength="1000" value="${escapeAttr(value??'')}">`;
}
function batchSelect(id,key,label,options,value){return `<label class="fld-lbl" for="cb-${id}-${key}">${label}</label><select class="fld-inp" id="cb-${id}-${key}" data-batch-key="${key}">${Object.entries(options).map(([k,v])=>`<option value="${escapeAttr(k)}" ${k===value?'selected':''}>${escapeHtml(v)}</option>`).join('')}</select>`;}
function batchCheck(id,key,label,checked){return `<label class="pick-label"><input type="checkbox" id="cb-${id}-${key}" data-batch-key="${key}" ${checked?'checked':''}>${label}</label>`;}
function clinicalBatchOverview(item){
  const r=item.ex.clinicalV02,p=CR.prescription(r);
  return [p.side||'左右未確認',p.repetitions,p.sets,p.hold,p.frequency,'曜日：'+(item.ex.dows.length?item.ex.dows.map(i=>DOW_LABEL[i]).join('・'):'未確認'),r.imageCompatible?'画像適合確認済':'画像未確認',r.patient.confirmed?'患者別確認済':'患者別未確認'].filter(Boolean).join(' ／ ');
}
function clinicalBatchFields(id,item){
  const ex=item.ex,r=ex.clinicalV02,d=CC.definitions[id],sport=d.gates.includes('G7');
  return `<p class="notice">初期値は編集案です。曜日・左右・許可は別途確認してください。原案はプレビューで参照できます。処方量には下の編集値だけを用います。</p>${item.standard?`<p class="notice">同じ新版IDで保存した標準指示を優先。${escapeHtml(prescriptionSummary(C.prescription(item.standard.prescription)))}</p>`:''}<p>${escapeHtml(d.caution)}</p>
  <details><summary>回数・時間・頻度・用具の案を変更</summary>${Object.entries(clinicalFieldLabels).filter(([k])=>clinicalNumberKeys.includes(k)||k==='support').map(([k,v])=>batchInput(id,k,v,r[k],clinicalNumberKeys.includes(k)?'number':'text')).join('')}${batchSelect(id,'doseUnit','量の単位',{'':'未設定','回':'回','秒':'秒','歩':'歩','分':'分','呼吸':'呼吸','本':'本'},r.doseUnit)}${batchInput(id,'doseDirections','動作の方向（各方向の場合）',r.doseDirections)}${batchInput(id,'doseDetail','量の補足（各方向・往復・歩行と軽走の内訳など）',r.doseDetail)}</details>
  ${batchSelect(id,'side','実施する側',{'':'未設定',right:'右',left:'左（対応画像未検証）',bilateral:'両側',alternating:'左右交互',none:'左右指定なし'},r.side)}${batchSelect(id,'amountBasis','量の基準（片側・各方向・往復・合計）',{'':'未設定',per_side:'指定側につき',each_side:'左右各',total:'合計',each_direction:'各方向',round_trip:'往復（量は片道の歩数）'},r.amountBasis)}
  ${['load','rom','constraints'].map(k=>batchInput(id,k,clinicalFieldLabels[k],r[k])).join('')}
  ${batchCheck(id,'holdNotApplicable','保持時間を指定しない運動と確認（保持秒未入力時）',r.holdNotApplicable)}
  <fieldset><legend>実施曜日（週頻度案からは自動選択しません）</legend><button type="button" class="btn btn-out" id="cb-${id}-everyday" onclick="selectClinicalEveryday('${id}')">毎日を選ぶ</button>${DOW_LABEL.map((v,i)=>batchCheck(id,'day-'+i,v,ex.dows.includes(i))).join('')}</fieldset>
  ${batchSelect(id,'operative','保存療法／術後',{'':'未確認',no:'手術なし',yes:'術後'},r.postoperative===null?'':r.postoperative?'yes':'no')}
  <fieldset id="cb-${id}-surgery" ${r.postoperative!==true?'hidden':''}><legend>術後の必須指示</legend>${Object.entries(surgeryLabels).map(([k,v])=>batchInput(id,'surgery-'+k,v,r.surgery[k])).join('')}</fieldset>
  ${CR.requiredGates(ex).map(g=>`<fieldset><legend>${g} ${escapeHtml(CC.gates[g])}</legend>${batchSelect(id,'gate-'+g,'許可の確認',{pending:'未確認',allowed:'許可を確認',not_applicable:'非該当（条件付きのみ・理由必須）',denied:'不許可'},r.gates[g]?.status||'pending')}${batchInput(id,'details-'+g,'許可内容・根拠・確認日／非該当の理由',r.gates[g]?.details)}</fieldset>`).join('')}
  ${sport?batchInput(id,'sportPlan',clinicalFieldLabels.sportPlan,r.sportPlan)+batchCheck(id,'supervised','競技準備をPT監督下で確認（G7）',r.supervised):''}
  ${batchCheck(id,'imageCompatible','画像を開き、動作側・姿勢・支持・範囲の適合を実見確認した',r.imageCompatible)}
  ${batchCheck(id,'approved','臨床責任者による本文・量の案・画像の定義承認を確認した',r.clinical.approved)}
  ${batchCheck(id,'confirmed','この種目の左右・量・曜日・制限・許可を今回の患者について確認した',r.patient.confirmed)}
  <details><summary>6種を超える場合の理由</summary>${batchInput(id,'extraReason',clinicalFieldLabels.extraReason,r.extraReason)}</details>
  <button type="button" class="btn btn-out" onclick="saveClinicalBatchDefault('${id}')">量・用具をこの新版種目の標準指示として保存</button>`;
}
function openClinicalShelf(categoryId='G03',level){
  if(!requireStaff())return;const state=clinicalSelectionState(),c=CC.categories[categoryId];if(!c)return;
  level=level||(state.categoryId===categoryId?state.level:'beginner');if(!c.levels[level])return;
  if(!clinicalBatch||clinicalBatch.patientId!==S.patientId)clinicalBatch={patientId:S.patientId,items:{},query:'',only:false,common:{clinicalDate:todayKey(),patientDate:todayKey(),confirmed:false}};
  Object.assign(state,{categoryId,level});
  for(const id of Object.values(c.levels).flat()){
    const item=clinicalBatch.items[id],saved=S.menu.find(ex=>ex.exerciseKey===CC.definitions[id].key);
    if(!item||(!item.selected&&(saved?JSON.stringify(saved):null)!==item.base))clinicalBatch.items[id]=newClinicalCandidate(id,categoryId);
  }
  // modal() replaces the DOM. Event handlers have already copied each edit into this draft.
  const draft=clinicalBatch,common=draft.common;
  modal('clinicalShelf',escapeHtml(clinicalCategoryName(c)),`<p class="hint">チェックで複数選択 → 必要な指示だけ変更・確認 → 一括保存。閉じると未保存の選択を取り消します。</p><div id="clinical-level" class="clinical-switch">${Object.entries({beginner:'初級',intermediate:'中級',advanced:'上級'}).map(([key,label])=>`<button class="btn btn-out" data-clinical-level="${key}" aria-pressed="${key===level}" onclick="openClinicalShelf('${categoryId}','${key}')">${label}</button>`).join('')}</div><details><summary>疾患の注意・処方条件</summary><p>${escapeHtml(c.notes)}</p></details><label>運動名で検索<input id="clinical-exercise-search" class="fld-inp" value="${escapeAttr(draft.query)}" oninput="clinicalBatch.query=this.value;filterClinicalBatch()"></label><label class="pick-label"><input id="clinical-selected-only" type="checkbox" ${draft.only?'checked':''} onchange="clinicalBatch.only=this.checked;filterClinicalBatch()">選択済みだけ表示（段階を横断）</label><p id="clinical-batch-count" role="status"></p>
  ${Object.entries(draft.items).map(([id,item])=>{const d=CC.definitions[id],r=item.ex.clinicalV02;return `<article class="clinical-candidate" data-clinical-exercise="${id}"><div class="clinical-candidate-heading"><label class="pick-label"><input type="checkbox" id="cb-${id}-selected" data-batch-key="selected" ${item.selected?'checked':''} ${!d.image?'disabled':''}>${escapeHtml(d.name)}</label>${d.image?`<button type="button" class="candidate-image" onclick="previewClinical('${id}')"><img src="${escapeAttr(d.image)}" alt="${escapeAttr(d.name)}の姿勢" loading="lazy"></button>`:'<span>画像保留・選択不可</span>'}</div><p class="hint">${escapeHtml(d.purpose)}${item.base?' ／ 追加済み・編集':''}</p><div id="cb-${id}-selected-fields" ${!item.selected?'hidden':''}><p id="cb-${id}-overview">${escapeHtml(clinicalBatchOverview(item))}</p><details id="cb-${id}-details"><summary>この種目の指示と必要な確認</summary>${clinicalBatchFields(id,item)}</details></div></article>`;}).join('')}
  <details><summary>選択全種目に共通の担当者・確認日</summary>${batchInput('common','clinicalReviewer','定義承認者の職員識別子',common.clinicalReviewer)}${batchInput('common','clinicalDate','定義承認日',common.clinicalDate,'date')}${batchInput('common','patientReviewer','今回の担当PTの職員識別子',common.patientReviewer)}${batchInput('common','patientDate','今回の患者確認日',common.patientDate,'date')}${batchCheck('common','confirmed','上記担当者・日付が選択した全種目に適用することを確認',common.confirmed)}</details><p class="hint">共通欄を入力しても種目ごとの承認・画像適合・患者別確認はチェックされません。</p><p id="clinical-batch-errors" role="alert"></p><button class="btn btn-out" onclick="clinicalBatch.only=true;$('clinical-selected-only').checked=true;clinicalBatch.query='';$('clinical-exercise-search').value='';filterClinicalBatch()">選択分を一括確認</button><button class="btn btn-pri" onclick="saveClinicalBatch(false)">選択種目を一括保存</button><button class="btn btn-pri" onclick="saveClinicalBatch(true)">一括保存してQR</button>`);
  clinicalBatch=draft;
  for(const type of ['input','change'])$('clinicalShelf').addEventListener(type,updateClinicalBatch);
  filterClinicalBatch();
}
function filterClinicalBatch(){
  if(!clinicalBatch)return;const state=clinicalSelectionState(),draft=clinicalBatch;
  $('clinicalShelf').querySelectorAll('[data-clinical-exercise]').forEach(row=>{const id=row.dataset.clinicalExercise;row.hidden=draft.only?!draft.items[id].selected:!CC.categories[state.categoryId].levels[state.level].includes(id)||!(CC.definitions[id].name+' '+CC.definitions[id].purpose).toLowerCase().includes(draft.query.toLowerCase());});
  $('clinical-batch-count').textContent=`選択 ${Object.values(draft.items).filter(i=>i.selected).length}種目（非表示の段階の選択も保持）`;
}
function setClinicalBatchValue(id,key,value){if(!requireStaff())return;const input=$('cb-'+id+'-'+key);input.value=value;updateClinicalBatch({target:input});}
function selectClinicalEveryday(id){
  if(!requireStaff()||!clinicalBatch||clinicalBatch.patientId!==S.patientId)return;
  for(let i=0;i<7;i++)$('cb-'+id+'-day-'+i).checked=true;
  updateClinicalBatch({target:$('cb-'+id+'-day-0')});
  setClinicalBatchValue(id,'daysPerWeek',7);
  clinicalBatch.items[id].ex.scheduleConfirmed=false;
  clinicalBatch.common.confirmed=false;$('cb-common-confirmed').checked=false;
}
function updateClinicalBatch(event){
  if(!requireStaff()||!clinicalBatch||clinicalBatch.patientId!==S.patientId)return;
  const input=event.target,key=input.dataset?.batchKey;if(!key)return;
  const id=input.id.split('-')[1],value=input.type==='checkbox'?input.checked:input.value;
  if(id==='common'){clinicalBatch.common[key]=value;if(key!=='confirmed'){clinicalBatch.common.confirmed=false;$('cb-common-confirmed').checked=false;}return;}
  const item=clinicalBatch.items[id];if(!item)return;const r=item.ex.clinicalV02;
  if(key==='selected'){item.selected=!!value;$('cb-'+id+'-selected-fields').hidden=!value;clinicalBatch.common.confirmed=false;$('cb-common-confirmed').checked=false;filterClinicalBatch();return;}
  if(clinicalNumberKeys.includes(key))r[key]=value===''?null:Number(value);
  else if(key==='operative'){r.postoperative=value===''?null:value==='yes';$('cb-'+id+'-surgery').hidden=value!=='yes';}
  else if(key.startsWith('surgery-'))r.surgery[key.slice(8)]=value;
  else if(key.startsWith('day-'))item.ex.dows=DOW_LABEL.map((_,i)=>i).filter(i=>$('cb-'+id+'-day-'+i).checked);
  else if(key.startsWith('gate-')||key.startsWith('details-')){const g=key.split('-')[1];r.gates[g]={status:$('cb-'+id+'-gate-'+g).value,details:$('cb-'+id+'-details-'+g).value};}
  else if(key==='approved')r.clinical.approved=!!value;
  else if(key==='confirmed')r.patient.confirmed=!!value;
  else r[key]=value;
  if(!['approved','confirmed','imageCompatible'].includes(key)){r.imageCompatible=false;r.patient.confirmed=false;$('cb-'+id+'-imageCompatible').checked=false;$('cb-'+id+'-confirmed').checked=false;}
  $('cb-'+id+'-overview').textContent=clinicalBatchOverview(item);
}
function saveClinicalBatchDefault(id){
  if(!requireStaff()||clinicalBatch?.patientId!==S.patientId)return;const item=clinicalBatch.items[id],r=item.ex.clinicalV02;
  const dose=Object.fromEntries([...clinicalNumberKeys,'doseUnit','doseDetail','doseDirections','amountBasis','support'].map(k=>[k,r[k]]));
  const key=Object.keys(T).find(k=>k.startsWith('doseDefault_')&&T[k].menu[0]?.exerciseKey===item.ex.exerciseKey)||'doseDefault_'+uid();
  T={...T,[key]:{name:'標準指示：'+item.ex.name,icon:'📋',desc:'新版の編集案',menu:[{id:'default',name:item.ex.name,exerciseKey:item.ex.exerciseKey,dows:[],clinicalV02:dose,prescription:CR.prescription(r)}]}};
  try{persist();toast('この新版IDの量・用具を保存しました');}catch(e){$('clinical-batch-errors').textContent=e.message;}
}
function prepareClinicalBatch(){
  const draft=clinicalBatch;if(!draft||draft.patientId!==S.patientId)throw Error('患者が変わりました。開き直してください。');
  const selected=Object.values(draft.items).filter(i=>i.selected),common=draft.common;if(!selected.length)throw Error('種目を選んでください。');
  if(!common.confirmed)throw Error('選択全種目に共通の担当者・確認日を明示確認してください。');
  const next=C.clone(S.menu);
  for(const item of selected){
    const ex=C.clone(item.ex),d=CR.definition(ex),r=CR.normalize(ex.clinicalV02),index=next.findIndex(e=>e.exerciseKey===ex.exerciseKey);
    if(item.base!==null?(index<0||JSON.stringify(next[index])!==item.base):index>=0)throw Error(ex.name+'：保存済み処方が変更されました。開き直してください。');
    r.revision=uid();r.clinical={approved:r.clinical.approved,reviewer:common.clinicalReviewer,date:common.clinicalDate};
    r.patient={confirmed:r.patient.confirmed,reviewer:common.patientReviewer,date:common.patientDate,patientId:S.patientId};r.imageId=d.image||'';r.imageSha256=d.sha256||'';
    Object.assign(ex,{clinicalV02:CR.normalize(r),scheduleConfirmed:ex.dows.length>0&&r.patient.confirmed,prescription:CR.prescription(r),params:'',note:r.constraints});
    if(index>=0)next[index]=ex;else{if(next.some(e=>e.id===ex.id))ex.id=uid();next.push(ex);}
  }
  CR.assertPrescribable(next,S.patientId);return next;
}
function saveClinicalBatch(share=false){
  if(!requireStaff())return;
  try{const next=prepareClinicalBatch();commitMenu(next);}
  catch(e){$('clinical-batch-errors').textContent=e.message;return;}
  // Keep failed drafts available; sharing happens only after a successful commit.
  clinicalBatch=null;closeModal('clinicalShelf');toast('選択種目を一括保存しました');if(share)showShareQR();
}
let clinicalDraft=null;
function openClinicalPrescription(id,categoryId,index=-1){
  if(!requireStaff())return;const d=CC.definitions[id];if(!d||!Object.hasOwn(CC.categories,categoryId))return;
  clinicalSelectionState();
  if(index<0)index=S.menu.findIndex(ex=>ex.exerciseKey===d.key);
  if(index>=0&&S.menu[index]?.exerciseKey!==d.key)return;
  const ex=index>=0?S.menu[index]:{id:uid(),name:d.name,exerciseKey:d.key,dows:[],clinicalV02:{categoryId}},r=CR.normalize(ex.clinicalV02);
  clinicalDraft={ex:C.clone(ex),index,patientId:S.patientId};
  r.patient.confirmed=false;r.imageCompatible=false;
  const input=(key,label,value,type='text')=>`<label class="fld-lbl" for="cr-${key}">${label}</label><input class="fld-inp" id="cr-${key}" type="${type}" ${type==='number'?'min="0" step="any"':''} value="${escapeAttr(value??'')}" maxlength="1000">`;
  modal('clinicalPrescription',escapeHtml(d.id+' '+d.name+'：個別処方'),`<p class="notice">${escapeHtml(CC.categories[categoryId].notes)}。量の案を個別処方として自動確定しません。</p><button class="btn btn-out" onclick="previewClinical('${id}')">画像・本文・量の案を確認</button><p>${escapeHtml(d.steps[0])}</p><p>量の案：${escapeHtml(d.doseProposal)} ／ ${escapeHtml(CC.presets[d.doseProposal[0]]||'')}</p><p class="notice">${escapeHtml(d.caution)}</p><label for="cr-side">指定側（画像は反転しません）</label><select class="fld-inp" id="cr-side">${Object.entries({'':'未設定',right:'右',left:'左（対応画像未検証）',bilateral:'両側',alternating:'左右交互',none:'左右指定なし'}).map(([k,v])=>`<option value="${k}" ${r.side===k?'selected':''}>${v}</option>`).join('')}</select><label for="cr-doseUnit">量の単位</label><select class="fld-inp" id="cr-doseUnit">${['','回','歩','秒','分','呼吸','本'].map(v=>`<option ${v===r.doseUnit?'selected':''}>${v}</option>`).join('')}</select><label for="cr-amountBasis">量の基準（片側・各方向・往復・合計）</label><select class="fld-inp" id="cr-amountBasis">${Object.entries({'':'未設定',per_side:'指定側につき',each_side:'左右各',total:'合計',each_direction:'各方向',round_trip:'往復（量は片道の歩数）'}).map(([k,v])=>`<option value="${k}" ${r.amountBasis===k?'selected':''}>${v}</option>`).join('')}</select>${input('doseDirections','動作の方向（各方向の場合）',r.doseDirections)}${Object.entries(clinicalFieldLabels).map(([k,v])=>input(k,v,r[k],['reps','sets','holdSeconds','restSeconds','sessionsPerDay','daysPerWeek'].includes(k)?'number':'text')).join('')}<label class="pick-label"><input type="checkbox" id="cr-hold-na" ${r.holdNotApplicable?'checked':''}>保持時間を指定しない運動であることを確認した（保持秒未入力時は必須）</label><fieldset><legend>実施曜日（毎日も明示選択）</legend>${DOW_LABEL.map((v,i)=>`<label class="pick-label"><input type="checkbox" id="cr-day-${i}" ${ex.dows.includes(i)?'checked':''}>${v}</label>`).join('')}</fieldset><label for="cr-operative">保存療法／術後</label><select class="fld-inp" id="cr-operative" onchange="document.getElementById('cr-surgery').hidden=this.value!=='yes'"><option value="">未確認</option><option value="no" ${r.postoperative===false?'selected':''}>手術なし</option><option value="yes" ${r.postoperative===true?'selected':''}>術後</option></select><fieldset id="cr-surgery" ${r.postoperative!==true?'hidden':''}><legend>術後の必須指示</legend>${Object.entries(surgeryLabels).map(([k,v])=>input('surgery-'+k,v,r.surgery[k])).join('')}</fieldset><fieldset><legend>必要な許可（未設定は開始不可）</legend>${CR.requiredGates(ex).map(g=>`<label for="cr-gate-${g}">${g} ${escapeHtml(CC.gates[g])}</label><select class="fld-inp" id="cr-gate-${g}">${Object.entries({pending:'未確認',allowed:'許可を確認',not_applicable:'該当しない（条件付きのみ・理由必須）',denied:'不許可'}).map(([k,v])=>`<option value="${k}" ${r.gates[g]?.status===k?'selected':''}>${v}</option>`).join('')}</select>${input('details-'+g,'許可内容・根拠・確認日／非該当の理由',r.gates[g]?.details)}`).join('')}</fieldset><label class="pick-label"><input type="checkbox" id="cr-image" ${r.imageCompatible?'checked':''}>この画像の動作側・姿勢・支持・範囲が今回の指示と一致することを実見確認した</label><label class="pick-label"><input type="checkbox" id="cr-supervised" ${r.supervised?'checked':''}>競技準備をPT監督下で確認した（G7）</label><fieldset><legend>臨床責任者：本文・量の案・画像の承認</legend>${input('clinical-reviewer','承認者の職員識別子（患者氏名は入力しない）',r.clinical.reviewer)}${input('clinical-date','承認日',r.clinical.date,'date')}<label class="pick-label"><input type="checkbox" id="cr-approved" ${r.clinical.approved?'checked':''}>実際の臨床承認を確認した</label></fieldset><fieldset><legend>担当PT：今回の患者への処方確認</legend>${input('patient-reviewer','担当PTの職員識別子',r.patient.reviewer)}${input('patient-date','確認日',r.patient.date,'date')}<label class="pick-label"><input type="checkbox" id="cr-confirmed" ${r.patient.confirmed?'checked':''}>左右・量・曜日・制限・開始許可を確認した</label></fieldset><p id="cr-errors" role="alert"></p><button class="btn btn-pri" onclick="saveClinicalPrescription()">確認した処方を保存</button><p>この画面は端末内の確認記録です。本人認証や電子署名ではありません。</p>`);
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
  r.doseDirections=val('doseDirections');r.side=val('side');r.doseUnit=val('doseUnit');r.amountBasis=val('amountBasis');r.revision=uid();r.postoperative=val('operative')===''?null:val('operative')==='yes';
  for(const k of Object.keys(surgeryLabels))r.surgery[k]=val('surgery-'+k);
  for(const g of CR.requiredGates(ex))r.gates[g]={status:val('gate-'+g),details:val('details-'+g)};
  r.imageCompatible=$('cr-image').checked;r.imageId=d.image||'';r.imageSha256=d.sha256||'';r.supervised=$('cr-supervised').checked;
  r.clinical={approved:$('cr-approved').checked,reviewer:val('clinical-reviewer'),date:val('clinical-date')};
  r.patient={confirmed:$('cr-confirmed').checked,reviewer:val('patient-reviewer'),date:val('patient-date'),patientId:S.patientId};
  const dows=DOW_LABEL.map((_,i)=>i).filter(i=>$('cr-day-'+i).checked);
  const next={...ex,clinicalV02:CR.normalize(r),dows,scheduleConfirmed:true,note:r.constraints,params:'',prescription:{side:({right:'右',left:'左',bilateral:'両側',alternating:'左右交互',none:'左右指定なし'})[r.side]||'',repetitions:r.reps?`${r.reps}${r.doseUnit}（指定側につき／交互は左右各）`:'',sets:r.sets?`${r.sets}セット`:'',hold:r.holdSeconds?`${r.holdSeconds}秒`:'該当なし',frequency:r.sessionsPerDay?`1日${r.sessionsPerDay}回・週${r.daysPerWeek}日`:'',load:r.load+'／'+r.rom,support:r.support}};
  try{if(!dows.length||dows.length!==r.daysPerWeek)throw Error('実施曜日の数と週の実施日数を一致させてください。');const menu=C.clone(S.menu),existing=menu.findIndex(item=>item.exerciseKey===d.key);if(index>=0){if(menu[index]?.id!==ex.id)throw Error('処方が変更されました。候補から開き直してください。');menu[index]=next;}else if(existing>=0)throw Error('追加済みです。候補の「追加済み・編集」から開き直してください。');else menu.push(next);next.prescription=CR.prescription(r);CR.assertPrescribable(menu);commitMenu(menu);closeModal('clinicalPrescription');clinicalDraft=null;const state=clinicalSelectionState();if(state.categoryId)openClinicalShelf(state.categoryId,state.level);toast('個別処方を保存しました');}catch(e){$('cr-errors').textContent=e.message;}
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
