/* v0.2 review shelf and explicit patient sessions. Legacy keys stay untouched. */
const CR=ClinicalRules, CC=ClinicalCatalog;
const legacyPrescriptionHtml=prescriptionHtml;
prescriptionHtml=function(ex){const r=ex.clinicalV02;return legacyPrescriptionHtml(ex)+(r?`${r.constraints?.trim()?`<p class="notice">個別制限：${escapeHtml(r.constraints)}</p>`:''}${r.restSeconds?`<p>セット間休息：${r.restSeconds}秒</p>`:''}${r.sportPlan?`<p class="notice">競技準備の個別計画：${escapeHtml(r.sportPlan)}</p>`:''}`:'');};
const legacyMediaFor=mediaFor;
mediaFor=function(ex){const d=CR.definition(ex);return CR.isNew(ex)?(CR.imagePath(ex)&&(!S||ex.clinicalV02?.patient?.patientId===S.patientId)?{...d,imagePath:d.image}:null):legacyMediaFor(ex);};
function exerciseImageHtml(ex,preview=false){
  const d=CR.definition(ex),m=CR.isNew(ex)?d:legacyMediaFor(ex);
  const path=CR.isNew(ex)?(preview||ex.clinicalV02?.patient?.patientId===S?.patientId?CR.imagePath(ex,preview):null):m&&!ex.mediaDisabled?'assets/exercises/'+m.image:null;
  if(!path)return `<p class="notice">${escapeHtml(d?.image? '画像・個別条件の確認が必要です':d?.assetStatus||'イラストなし')}。担当者に確認してください。</p>`;
  return `<figure><img class="guide-image" src="${escapeAttr(path)}" alt="${escapeAttr(m.name)}の姿勢" onerror="this.hidden=true;this.parentElement.querySelector('.image-failure').hidden=false;this.closest('#patientSession')?.querySelector('[data-start]')?.setAttribute('disabled','')"><p class="image-failure notice" hidden>画像を読み込めません。開始せず担当者に確認してください。</p>${CR.isNew(ex)?'<figcaption>画像は共通の動作例です。図の左右ではなく、指示された実施側で行ってください。</figcaption>':''}${m.imageCaption?`<figcaption>${escapeHtml(m.imageCaption)}</figcaption>`:''}</figure>`;
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
  return `<section id="clinical-catalog" class="t-sec"><div class="t-sec-ttl">疾患別メニューから選ぶ</div><p class="hint">利用対象${Object.values(CC.definitions).filter(d=>CR.isSelectable(d.id)).length}運動。疾患・段階ごとの候補数は実数を表示します。</p><div class="clinical-switch" role="group" aria-label="一般・競技の切替">${[['G','一般向け'],['A','競技向け']].map(([key,label])=>`<button type="button" class="btn btn-out" data-clinical-audience="${key}" aria-pressed="${state.audience===key}" onclick="setClinicalAudience('${key}')">${label}</button>`).join('')}</div><label for="clinical-search">疾患名で検索</label><input id="clinical-search" class="fld-inp" type="search" value="${escapeAttr(state.query)}" oninput="filterClinicalCategories(this.value)"><div id="clinical-categories" class="tpl-grid">${clinicalCategoryCards()}</div></section>`;
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
function previewClinical(id){const d=CC.definitions[id];if(!d||!requireStaff())return;modal('clinicalPreview',escapeHtml(id+' '+d.name),`<p class="notice">画像・本文・量の案。画像は共通の動作例です。実施側は各運動の指示をご覧ください。</p>${exerciseImageHtml({exerciseKey:d.key},true)}<p>${escapeHtml(d.steps.join(' '))}</p><p>目的：${escapeHtml(d.purpose)}</p><p>用具：${escapeHtml(d.equipment)}</p><p>量の案：${escapeHtml(d.doseProposal)} ／ ${escapeHtml(CC.presets[d.doseProposal[0]]||'')}</p><p class="notice">${escapeHtml(d.caution)}</p><p>姿勢・支持・負荷：${escapeHtml(d.pose)}</p><p>図の確認：${escapeHtml(d.assetNotes)}</p><button type="button" class="evidence-button" onclick="showClinicalEvidence('${id}')">参考文献・資料</button>`);}
const clinicalFieldLabels={reps:'1セットの量（往復は片道の歩数）',sets:'セット数',holdSeconds:'1回の保持秒（該当時）',restSeconds:'休息秒（任意）',sessionsPerDay:'1日の実施回数',daysPerWeek:'週の実施日数',load:'負荷・重さ（任意）',rom:'許可する方向・動かす範囲',support:'支持物・用具・見守り',constraints:'注意事項・個別制限（任意）',sportPlan:'競技準備の回数・速度・場所・休息・個別計画',extraReason:'6種を超えて処方する理由'};
function clinicalFieldError(message,target){return Object.assign(Error(message),{target});}
function clinicalIssueKey(issue,r,batch,ex){
  if(issue.startsWith('不正な数値：'))return issue.split('：')[1];
  if(issue.startsWith('個別値：'))return issue.split('：')[1];
  if(issue.includes('実施曜日'))return 'day-0';
  if(issue==='指定側の形式')return 'side';
  if(issue.includes('単位'))return !['回','歩','秒','分','呼吸','本'].includes(r.doseUnit)||r.amountBasis==='round_trip'?'doseUnit':'amountBasis';
  if(issue.includes('各方向の指定'))return 'doseDirections';
  if(issue.includes('量の基準')||issue.includes('往復量'))return 'amountBasis';
  if(issue==='頻度の範囲')return r.daysPerWeek>7?'daysPerWeek':'sessionsPerDay';
  if(issue.includes('整数'))return ['sets','daysPerWeek','sessionsPerDay'].find(k=>!Number.isInteger(r[k]));
  if(issue.includes('保持時間'))return 'holdSeconds';
  return 'selected';
}
function assertClinicalFields(ex,prefix,count){
  const r=CR.normalize(ex.clinicalV02);
  const mismatch=CR.isNew(ex)&&ex.scheduleMode!=='flexible'&&Number.isInteger(r.daysPerWeek)&&r.daysPerWeek>0&&r.daysPerWeek<=7&&ex.dows?.length!==r.daysPerWeek;
  const issue=(mismatch?'実施曜日の数と週の実施日数を一致させてください。':CR.issues(ex)[0]);
  if(!issue)return;
  const key=clinicalIssueKey(issue,r,prefix!=='cr-',ex);
  const message=issue.startsWith('個別値：')?(clinicalFieldLabels[key]||{side:'実施する側',doseUnit:'量の単位'}[key]||key)+'を入力してください。':issue;
  throw clinicalFieldError(ex.name+'：'+message,key.startsWith('common-')?'cb-'+key:prefix+key);
}
function clearClinicalFieldErrors(root){
  root.querySelectorAll('[data-clinical-error]').forEach(n=>n.remove());
  root.querySelectorAll('[aria-invalid]').forEach(n=>{n.removeAttribute('aria-invalid');n.removeAttribute('aria-describedby');});
}
function showClinicalFieldError(rootId,outputId,error,focus=true){
  const root=$(rootId);clearClinicalFieldErrors(root);$(outputId).textContent=error.message;root.dataset.validationAttempted='true';
  const target=$(error.target)||$(outputId);target.setAttribute('aria-invalid','true');
  const note=document.createElement('p');note.id=target.id+'-error';note.dataset.clinicalError='true';note.className='clinical-field-error';note.textContent=error.message;
  target.closest('label')?.contains(target)?target.closest('label').after(note):target.after(note);target.setAttribute('aria-describedby',note.id);
  if(!focus)return;
  const row=target.closest('[data-clinical-exercise]');if(row){clinicalBatch.query='';clinicalBatch.only=true;$('clinical-exercise-search').value='';$('clinical-selected-only').checked=true;filterClinicalBatch();row.hidden=false;}
  for(let p=target.parentElement;p&&p!==root;p=p.parentElement){if(p.tagName==='DETAILS')p.open=true;p.hidden=false;}
  if(!target.matches('input,select,button,textarea'))target.tabIndex=-1;
  target.scrollIntoView({block:'center',behavior:'instant'});target.focus({preventScroll:true});
}
function wireClinicalErrors(rootId,outputId){
  const root=$(rootId);
  for(const type of ['input','change'])root.addEventListener(type,event=>{
    if(!event.target.matches('[data-batch-key], [id^="cr-"]'))return;
    const notice=$(outputId).textContent.startsWith('内容を変更しました。')?$(outputId).textContent:'';
    clearClinicalFieldErrors(root);$(outputId).textContent=notice;
    if(rootId==='clinicalPrescription')$('cr-overview').textContent=clinicalBatchOverview({ex:readClinicalPrescription()});
    try{
      const prefix=rootId==='clinicalShelf'?'cb-'+event.target.id.split('-')[1]+'-':'cr-';
      if(root.dataset.validationAttempted){if(rootId==='clinicalShelf')prepareClinicalBatch();else assertClinicalFields(readClinicalPrescription(),'cr-',S.menu.length+(clinicalDraft.index<0?1:0));}
    }catch(e){showClinicalFieldError(rootId,outputId,e,false);}
  });
}
// One patient-local transaction. Filters only change visibility, never the draft values.
let clinicalBatch=null;
const clinicalNumberKeys=['reps','sets','holdSeconds','restSeconds','sessionsPerDay','daysPerWeek'];
const clinicalTapValues={reps:[2,3,5,8,10,20],sets:[1,2,3],holdSeconds:[2,3,5,10,20],restSeconds:[30,60,90],sessionsPerDay:[1,2],daysPerWeek:[2,3,5,7]};
function newClinicalCandidate(id,categoryId){
  if(!CR.isSelectable(id))throw Error('削除済み・未対応の運動は新規処方できません');
  const d=CC.definitions[id],existing=S.menu.find(ex=>ex.exerciseKey===d.key),saved=standardPrescription({exerciseKey:d.key});
  const initial=CR.initialDose(id,saved);
  const ex=existing?C.clone(existing):{id:uid(),name:d.name,exerciseKey:d.key,dows:[],scheduleMode:'flexible',scheduleConfirmed:false};
  const r=CR.normalize(existing?.clinicalV02||{...initial.clinicalV02,categoryId});
  if(!existing){
    // Only typed dose fields from an exact v02 key may be reused. Never borrow patient permissions.
    for(const key of ['side','load','rom','constraints','sportPlan'])r[key]='';
    r.gates={};r.postoperative=null;r.surgery=CR.normalize({}).surgery;r.clinical=CR.normalize({}).clinical;
    r.holdNotApplicable=false;r.supervised=false;
  }
  r.mode='simple';
  if(!existing){r.side=CR.initialSide(id,S.affectedSide);r.amountBasis=r.amountBasis||(r.side==='bilateral'||r.side==='none'?'total':r.side==='alternating'?'each_side':'per_side');r.patient.patientId=S.patientId;}
  ex.clinicalV02=r;
  return {ex,selected:false,base:existing?JSON.stringify(existing):null,standard:saved?.clinicianDefault?saved:null};
}
function batchInput(id,key,label,value,type='text'){
  const prefix='cb-'+id+'-';
  return `<label class="fld-lbl" for="${prefix+key}">${escapeHtml(label)}</label>${clinicalTapValues[key]?`<div class="dose-options">${clinicalTapValues[key].map(v=>`<button type="button" class="dose-choice" onclick="setClinicalBatchValue('${id}','${key}',${v})">${v}</button>`).join('')}</div>`:''}<input class="fld-inp" id="${prefix+key}" data-batch-key="${key}" type="${type}" ${type==='number'?'min="0" step="any"':''} maxlength="1000" value="${escapeAttr(String(value??''))}">`;
}
function batchSelect(id,key,label,options,value){return `<label class="fld-lbl" for="cb-${id}-${key}">${label}</label><select class="fld-inp" id="cb-${id}-${key}" data-batch-key="${key}">${Object.entries(options).map(([k,v])=>`<option value="${escapeAttr(k)}" ${k===value?'selected':''}>${escapeHtml(v)}</option>`).join('')}</select>`;}
function batchCheck(id,key,label,checked){return `<label class="pick-label"><input type="checkbox" id="cb-${id}-${key}" data-batch-key="${key}" ${checked?'checked':''}>${label}</label>`;}
function clinicalBatchOverview(item){
  const r=item.ex.clinicalV02,p=CR.prescription(r);
  return ['実施側：'+(p.side||'未選択'),p.repetitions,p.sets,p.hold,p.frequency].filter(Boolean).join(' ／ ');
}
function clinicalBatchFields(id,item){
  const ex=item.ex,r=ex.clinicalV02,d=CC.definitions[id];
  return `<p class="hint">初期値は編集案です。画像は共通の動作例です。図の左右ではなく表示された実施側で行ってください。</p><p>${escapeHtml(d.caution)}</p>
  <details><summary>実施側を個別に変更</summary>${batchSelect(id,'side','実施する側',{'':'未選択',right:'右',left:'左',bilateral:'両側',alternating:'左右交互',none:'左右指定なし'},r.side)}</details>
  ${['reps','sets','holdSeconds','sessionsPerDay','daysPerWeek'].map(k=>batchInput(id,k,clinicalFieldLabels[k],r[k],'number')).join('')}
  <p class="hint">曜日の指定は不要です。週の実施日数と休息の指示に合わせて行います。</p>
  <details><summary>量の詳細・個別指示（任意）</summary>
  ${batchSelect(id,'doseUnit','量の単位',{'':'未設定','回':'回','秒':'秒','歩':'歩','分':'分','呼吸':'呼吸','本':'本'},r.doseUnit)}
  ${batchSelect(id,'amountBasis','量の基準',{'':'未設定',per_side:'指定側につき',each_side:'左右各',total:'合計',each_direction:'各方向',round_trip:'往復（量は片道の歩数）'},r.amountBasis)}
  ${['doseDirections','doseDetail','load','rom','support','constraints','sportPlan','restSeconds'].map(k=>batchInput(id,k,clinicalFieldLabels[k]||({doseDirections:'動作の方向',doseDetail:'量の補足'})[k],r[k],k==='restSeconds'?'number':'text')).join('')}</details>
  <button type="button" class="btn btn-out" onclick="saveClinicalBatchDefault('${id}')">量・用具をこの新版種目の標準指示として保存</button>`;
}
function openClinicalShelf(categoryId='G03',level){
  if(!requireStaff())return;const state=clinicalSelectionState(),c=CC.categories[categoryId];if(!c)return;
  level=level||(state.categoryId===categoryId?state.level:'beginner');if(!c.levels[level])return;
  if(!clinicalBatch||clinicalBatch.patientId!==S.patientId)clinicalBatch={patientId:S.patientId,items:{},query:'',only:false};
  for(const id of Object.keys(clinicalBatch.items))if(!CR.isSelectable(id))delete clinicalBatch.items[id];
  Object.assign(state,{categoryId,level});
  for(const id of Object.values(c.levels).flat()){
    const item=clinicalBatch.items[id],saved=S.menu.find(ex=>ex.exerciseKey===CC.definitions[id].key);
    if(!item||(!item.selected&&(saved?JSON.stringify(saved):null)!==item.base))clinicalBatch.items[id]=newClinicalCandidate(id,categoryId);
  }
  // modal() replaces the DOM. Event handlers have already copied each edit into this draft.
  const draft=clinicalBatch;
  modal('clinicalShelf',escapeHtml(clinicalCategoryName(c)),`<p class="hint">チェックで複数選択 → 必要な指示だけ変更・確認 → 一括保存。閉じると未保存の選択を取り消します。</p><div id="clinical-level" class="clinical-switch">${Object.entries({beginner:'初級',intermediate:'中級',advanced:'上級'}).map(([key,label])=>`<button class="btn btn-out" data-clinical-level="${key}" aria-pressed="${key===level}" onclick="openClinicalShelf('${categoryId}','${key}')">${label}</button>`).join('')}</div><div class="notice"><strong>疾患の注意・処方条件</strong><p>${escapeHtml(c.notes)}</p></div><label>運動名で検索<input id="clinical-exercise-search" class="fld-inp" value="${escapeAttr(draft.query)}" oninput="clinicalBatch.query=this.value;filterClinicalBatch()"></label><label class="pick-label"><input id="clinical-selected-only" type="checkbox" ${draft.only?'checked':''} onchange="clinicalBatch.only=this.checked;filterClinicalBatch()">選択済みだけ表示（段階を横断）</label><p id="clinical-batch-count" role="status"></p>
  ${Object.entries(draft.items).map(([id,item])=>{const d=CC.definitions[id],r=item.ex.clinicalV02;return `<article class="clinical-candidate" data-clinical-exercise="${id}"><div class="clinical-candidate-heading"><label class="pick-label"><input type="checkbox" id="cb-${id}-selected" data-batch-key="selected" ${item.selected?'checked':''} ${!d.image?'disabled':''}>${escapeHtml(d.name)}</label>${d.image?`<button type="button" class="candidate-image" onclick="previewClinical('${id}')"><img src="${escapeAttr(d.image)}" alt="${escapeAttr(d.name)}の姿勢" loading="lazy"></button>`:'<span>画像保留・選択不可</span>'}</div><p class="hint">${escapeHtml(d.purpose)}${item.base?' ／ 追加済み・編集':''}</p><button type="button" class="evidence-button" onclick="showClinicalEvidence('${id}','${r.categoryId}')">参考文献・資料</button><div id="cb-${id}-selected-fields" ${!item.selected?'hidden':''}><details id="cb-${id}-details"><summary>回数・頻度を確認・変更</summary><p id="cb-${id}-overview">${escapeHtml(clinicalBatchOverview(item))}</p>${clinicalBatchFields(id,item)}</details></div></article>`;}).join('')}
  <p id="clinical-batch-errors" role="alert"></p><button class="btn btn-out" onclick="clinicalBatch.only=true;$('clinical-selected-only').checked=true;clinicalBatch.query='';$('clinical-exercise-search').value='';filterClinicalBatch()">選択分を一括確認</button><button class="btn btn-pri" onclick="saveClinicalBatch(false)">選択種目を一括保存</button><button class="btn btn-pri" onclick="saveClinicalBatch(true)">一括保存してQR</button>`);
  clinicalBatch=draft;
  for(const type of ['input','change'])$('clinicalShelf').addEventListener(type,updateClinicalBatch);
  wireClinicalErrors('clinicalShelf','clinical-batch-errors');
  filterClinicalBatch();
}
function filterClinicalBatch(){
  if(!clinicalBatch)return;const state=clinicalSelectionState(),draft=clinicalBatch;
  $('clinicalShelf').querySelectorAll('[data-clinical-exercise]').forEach(row=>{const id=row.dataset.clinicalExercise;row.hidden=draft.only?!draft.items[id].selected:!CC.categories[state.categoryId].levels[state.level].includes(id)||!(CC.definitions[id].name+' '+CC.definitions[id].purpose).toLowerCase().includes(draft.query.toLowerCase());});
  $('clinical-batch-count').textContent=`この段階 ${CC.categories[state.categoryId].levels[state.level].length}種目 ／ 表示 ${[...$('clinicalShelf').querySelectorAll('[data-clinical-exercise]')].filter(row=>!row.hidden).length}種目 ／ 選択 ${Object.values(draft.items).filter(i=>i.selected).length}種目（非表示の段階の選択も保持）`;
}
function setClinicalBatchValue(id,key,value){if(!requireStaff())return;const input=$('cb-'+id+'-'+key);input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));}
function selectClinicalEveryday(id){
  if(!requireStaff()||!clinicalBatch||clinicalBatch.patientId!==S.patientId)return;
  const frequency=$('cb-'+id+'-daysPerWeek');frequency.value=7;updateClinicalBatch({target:frequency});
  clinicalBatch.items[id].ex.scheduleConfirmed=false;
  frequency.dispatchEvent(new Event('input',{bubbles:true}));
}
function updateClinicalBatch(event){
  if(!requireStaff()||!clinicalBatch||clinicalBatch.patientId!==S.patientId)return;
  const input=event.target,key=input.dataset?.batchKey;if(!key)return;
  const id=input.id.split('-')[1],value=input.type==='checkbox'?input.checked:input.value;
  const item=clinicalBatch.items[id];if(!item)return;const r=item.ex.clinicalV02;
  if(key==='selected'){if(value&&!item.base&&!item.sideEdited){r.side=CR.initialSide(id,S.affectedSide);$('cb-'+id+'-side').value=r.side;$('cb-'+id+'-overview').textContent=clinicalBatchOverview(item);}item.selected=!!value;$('cb-'+id+'-selected-fields').hidden=!value;filterClinicalBatch();return;}
  if(key==='side')item.sideEdited=true;
  if(clinicalNumberKeys.includes(key))r[key]=value===''?null:Number(value);
  else r[key]=value;
  $('cb-'+id+'-overview').textContent=clinicalBatchOverview(item);
}
function saveClinicalBatchDefault(id){
  if(!requireStaff()||clinicalBatch?.patientId!==S.patientId)return;const item=clinicalBatch.items[id],r=item.ex.clinicalV02;
  const dose=Object.fromEntries([...clinicalNumberKeys,'doseUnit','doseDetail','doseDirections','amountBasis','support'].map(k=>[k,r[k]]));
  const key=Object.keys(T).find(k=>k.startsWith('doseDefault_')&&T[k].menu[0]?.exerciseKey===item.ex.exerciseKey)||'doseDefault_'+uid();
  T={...T,[key]:{name:'標準指示：'+item.ex.name,icon:'📋',desc:'新版の編集案',menu:[{id:'default',name:item.ex.name,exerciseKey:item.ex.exerciseKey,dows:[...item.ex.dows],clinicalV02:dose,prescription:CR.prescription(r)}]}};
  try{persist();toast('この新版IDの量・用具を保存しました');}catch(e){$('clinical-batch-errors').textContent=e.message;}
}
function prepareClinicalBatch(){
  const draft=clinicalBatch;if(!draft||draft.patientId!==S.patientId)throw Error('患者が変わりました。開き直してください。');
  const selected=Object.values(draft.items).filter(i=>i.selected);if(!selected.length)throw clinicalFieldError('種目を選んでください。','cb-'+Object.keys(draft.items).find(id=>CC.categories[clinicalSelectionState().categoryId].levels[clinicalSelectionState().level].includes(id))+'-selected');
  const next=C.clone(S.menu);
  for(const item of selected){
    const ex=C.clone(item.ex),d=CR.definition(ex),r=CR.normalize(ex.clinicalV02),index=next.findIndex(e=>e.exerciseKey===ex.exerciseKey);
    if(item.base!==null?(index<0||JSON.stringify(next[index])!==item.base):index>=0)throw Error(ex.name+'：保存済み処方が変更されました。開き直してください。');
    r.mode='simple';r.revision=uid();r.patient.patientId=S.patientId;
    Object.assign(ex,{clinicalV02:CR.normalize(r),scheduleConfirmed:true,scheduleMode:'flexible',dows:[],prescription:CR.prescription(r),params:'',note:r.constraints});
    if(index>=0)next[index]=ex;else{if(next.some(e=>e.id===ex.id))ex.id=uid();next.push(ex);}
  }
  for(const ex of next)assertClinicalFields(ex,'cb-'+CR.definition(ex)?.id+'-',next.length);
  CR.assertPrescribable(next,S.patientId);return next;
}
function saveClinicalBatch(share=false){
  if(!requireStaff())return;
  try{const next=prepareClinicalBatch();commitMenu(next);}
  catch(e){showClinicalFieldError('clinicalShelf','clinical-batch-errors',e);return;}
  // Keep failed drafts available; sharing happens only after a successful commit.
  clinicalBatch=null;closeModal('clinicalShelf');toast('選択種目を一括保存しました');if(share)showShareQR();
}
let clinicalDraft=null;
function openClinicalPrescription(id,categoryId,index=-1){
  if(!requireStaff())return;const d=CC.definitions[id];if(!d||!Object.hasOwn(CC.categories,categoryId))return;
  if(!CR.isSelectable(id)){toast('削除済みの運動です。過去の処方・記録は保持しています。');return;}
  clinicalSelectionState();
  if(index<0)index=S.menu.findIndex(ex=>ex.exerciseKey===d.key);
  if(index>=0&&S.menu[index]?.exerciseKey!==d.key)return;
  const ex=index>=0?S.menu[index]:newClinicalCandidate(id,categoryId).ex,r=CR.normalize(ex.clinicalV02);
  clinicalDraft={ex:C.clone(ex),index,patientId:S.patientId};
  modal('clinicalPrescription',escapeHtml(d.name+'：個別処方'),'<p id="cr-overview">'+escapeHtml(clinicalBatchOverview({ex:{...ex,clinicalV02:r}}))+'</p>'+clinicalBatchFields(id,{ex:{...ex,clinicalV02:r}}).replaceAll('cb-'+id+'-','cr-').replaceAll('data-batch-key=', 'data-single-key=').replace(/<button[\s\S]*?<\/button>/g,'')+`<details class="pt-details"><summary>動画（任意）</summary><p class="hint">標準は上のイラストと説明です。撮影は毎回必要ありません。</p><div id="exercise-video-tools"></div><label class="fld-lbl" for="cr-video">院内共通動画のURL（任意・HTTPS）</label><input id="cr-video" class="fld-inp" type="url" value="${escapeAttr(ex.videoUrl||'')}" placeholder="https://..."><p class="hint">院内で使い回す動画は、担当者が内容を確認したURLを登録します。この患者だけの動画は患者画面で本人の端末内に保存できます。</p></details><p id="cr-errors" role="alert"></p><button class="btn btn-pri" onclick="saveClinicalPrescription()">処方を保存</button>`);
  wireClinicalErrors('clinicalPrescription','cr-errors');
  if(typeof ExerciseVideo!=='undefined')ExerciseVideo.mount();
}
function readClinicalPrescription(){
  const ex=C.clone(clinicalDraft.ex),r=CR.normalize(ex.clinicalV02);
  for(const key of [...clinicalNumberKeys,'side','doseUnit','amountBasis','doseDirections','doseDetail','load','rom','support','constraints','sportPlan']){
    const el=$('cr-'+key);
    r[key]=clinicalNumberKeys.includes(key)?(el.value===''?null:Number(el.value)):el.value;
  }
  r.mode='simple';r.revision=uid();r.patient.patientId=S.patientId;
  const rawVideo=$('cr-video')?.value.trim()||'';
  if(rawVideo&&!C.videoUrl(rawVideo))throw clinicalFieldError('動画URLはhttps://で入力してください。','cr-video');
  ex.clinicalV02=r;ex.dows=[];ex.scheduleMode='flexible';ex.scheduleConfirmed=true;ex.prescription=CR.prescription(r);ex.note=r.constraints;ex.params='';ex.videoUrl=C.videoUrl(rawVideo);
  return ex;
}
function saveClinicalPrescription(){
  if(!requireStaff()||!clinicalDraft||clinicalDraft.patientId!==S.patientId)return;
  const {ex,index}=clinicalDraft,d=CR.definition(ex),next=readClinicalPrescription(),r=next.clinicalV02;
  try{assertClinicalFields(next,'cr-',S.menu.length+(index<0?1:0));const menu=C.clone(S.menu),existing=menu.findIndex(item=>item.exerciseKey===d.key);if(index>=0){if(menu[index]?.id!==ex.id)throw Error('処方が変更されました。候補から開き直してください。');menu[index]=next;}else if(existing>=0)throw Error('追加済みです。候補の「追加済み・編集」から開き直してください。');else menu.push(next);next.prescription=CR.prescription(r);CR.assertPrescribable(menu,S.patientId);commitMenu(menu);closeModal('clinicalPrescription');clinicalDraft=null;const state=clinicalSelectionState();if(state.categoryId)openClinicalShelf(state.categoryId,state.level);toast('個別処方を保存しました');}catch(e){showClinicalFieldError('clinicalPrescription','cr-errors',e);}
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
function sessionDoseHtml(ex){
  const p=ex.prescription||{};
  const hold=p.hold&&!['該当なし','保持設定なし','保持なし（PT確認）'].includes(p.hold)?`保持・動作の時間：${p.hold}`:'';
  return `<p class="session-dose"><strong>実施側：${escapeHtml(p.side||'担当者に確認')}</strong><br>${escapeHtml([p.repetitions,p.sets,hold,ex.params].filter(Boolean).join(' ／ ')||'量は担当者に確認してください')}</p>`;
}
function sessionEssentialInstructions(ex){
  const r=ex.clinicalV02||{},p=ex.prescription||{};
  const instructions=[['運動の注意',(CR.definition(ex)||legacyMediaFor(ex))?.caution],['負荷・範囲',p.load],['支え・見守り',p.support],['個別制限',r.constraints],['競技の個別計画',r.sportPlan],['あなたへの注意',ex.note],['疾患の注意',ex.diseaseNote],['再開の指示',S?.restartInstructions]];
  const seen=new Set();
  const rows=instructions.filter(([,v])=>v?.trim()&&!['該当なし','支え不要'].includes(v)&&!seen.has(v)&&seen.add(v));
  return `<div class="session-essential">${p.frequency?`<p><strong>ペース：</strong>${escapeHtml(p.frequency)}${ex.scheduleMode==='flexible'?'（曜日指定なし）':''}</p>`:''}${r.restSeconds?`<p><strong>セット間の休息：</strong>${r.restSeconds}秒</p>`:''}${rows.map(([k,v])=>`<p><strong>${k}：</strong>${escapeHtml(v)}</p>`).join('')}</div>`;
}
function nextPatientSessionIndex(){
  const items=patientItems(),s=patientSession,log=getLog(s.day),at=items.findIndex(ex=>ex.id===s.itemId);
  if(s.history)return -1;
  for(let offset=1;offset<items.length;offset++){const i=(at+offset)%items.length;if(!log.status?.[items[i].id]&&!log.done?.[items[i].id])return i;}
  return -1;
}
function nextPatientSession(){
  try{currentSessionExercise();const i=nextPatientSessionIndex();if(i>=0){patientSession=null;openPatientSession(i);}}catch(e){sessionError(e);}
}
function drawPatientSession(ex){
  const s=patientSession,m=CR.isNew(ex)?CR.definition(ex):legacyMediaFor(ex),problems=patientAccessIssues(ex),log=getLog(s.day),events=(log.events||[]).filter(e=>e.prescription_item_id===ex.id&&e.prescription_version===s.revision),last=events.at(-1),status=log.status?.[ex.id]||(log.done?.[ex.id]?'done':'');
  const recorded=s.saved||status&&!s.started&&!s.fresh,next=nextPatientSessionIndex();
  const individual=!!(ex.note||ex.diseaseNote||ex.clinicalV02?.constraints||ex.clinicalV02?.sportPlan||ex.prescription?.load||ex.prescription?.support||S?.restartInstructions);
  modal('patientSession',escapeHtml(ex.name),`<div data-patient-session>
    <p role="status" id="session-status">${recorded?'記録済み：'+(statusLabels[status]||status):s.started?'実施中（完了は未記録）':'未開始'}</p>
    ${sessionDoseHtml(ex)}
    ${sessionEssentialInstructions(ex)}
    ${problems.length?`<p class="notice">開始できません：${escapeHtml(problems.join('、'))}</p>`:''}
    ${exerciseImageHtml(ex)}
    <ol class="session-steps">${(CR.patientSteps(ex,m).length?CR.patientSteps(ex,m):['院内で説明された手順を確認してください。']).map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol>
    <p class="session-stop">痛み・しびれが増したら中止してください。</p>
    <details class="session-instructions"><summary>${individual?'個別の注意あり・':' '}処方の詳細</summary>${exerciseNotices(ex,m)}${prescriptionHtml(ex)}${S?.restartInstructions?`<p>あなたへの対応指示：${escapeHtml(S.restartInstructions)}</p>`:''}</details>
    <details><summary>困ったとき・相談先</summary><p>いつもと違う強い痛み、しびれ・力の入りにくさが出たら中止してください。</p><p>胸痛・強い息苦しさ・失神・急な麻痺は119など緊急対応を優先してください。新しい排尿困難・失禁、会陰部の感覚異常、急な強い両脚症状は速やかに救急受診してください。</p>${consultationHtml()}</details>
    ${m?`<details><summary>目的・用具</summary><p>${escapeHtml(m.purpose)}／${escapeHtml(m.equipment)}</p></details>`:''}
    <details class="session-inputs"><summary>実際の量・メモを入力（任意）</summary><label for="session-reps">実際の量（空欄は回数不明）</label><input id="session-reps" class="fld-inp" type="number" min="0" step="any"><label for="session-reason">理由・メモ</label><input id="session-reason" class="fld-inp" maxlength="500"></details>
    ${events.length?`<details><summary>実施回・訂正履歴 ${events.length}件</summary>${events.map(e=>`<p>${escapeHtml(e.timestamp_unknown?e.local_date+' 実施時刻不明（旧日次記録）':e.timestamp)}：${statusLabels[e.status]}／${e.reported_reps===null?'回数不明':e.reported_reps} ${e.supersedes_event_id?'（訂正）':''}</p>${!events.some(n=>n.supersedes_event_id===e.event_id)?`<button class="btn btn-out" onclick="correctPatientRecord('${e.event_id}')">この実施回を訂正</button>`:''}`).join('')}</details>`:''}
    <details class="session-video"><summary>動画を見る・保存する</summary><section id="patient-video"></section>${C.videoUrl(ex.videoUrl)?`<a class="btn btn-out" href="${escapeAttr(C.videoUrl(ex.videoUrl))}" target="_blank" rel="noopener noreferrer">担当者の動画を見る</a>`:''}</details>
    <p id="session-error" role="alert"></p>
    </div><div class="session-actions">
    ${recorded?`${next>=0?'<button class="btn btn-pri" onclick="nextPatientSession()">次の運動へ</button>':''}<button class="btn btn-out" onclick="newPatientSession()">別の回を始める</button><button class="btn btn-out" onclick="correctPatientRecord('${last?.event_id||''}')">記録を訂正</button>`:s.started?`<button class="btn btn-pri" onclick="recordPatientSession('done')">できた</button><button class="btn btn-out" onclick="recordPatientSession('partial')">途中まで</button><button class="btn btn-out" onclick="recordPatientSession('pain')">痛みで中止</button>`:`<button data-start class="btn btn-pri" ${problems.length?'disabled':''} onclick="startPatientSession()">始める</button><button class="btn btn-out" onclick="recordPatientSession('rest')">今日は休む</button>`}
    </div>`);
  if(typeof PatientVideo!=='undefined')PatientVideo.mount(ex);
}
const drawPatientSessionContent=drawPatientSession;
function currentSessionExercise(){const s=patientSession;if(!s||(!s.history&&s.day!==todayKey())||s.day>todayKey()||s.patientId!==S?.patientId)throw Error('日付または患者が変わりました。今日の画面から開き直してください。');const ex=(s.history?getLog(s.day).menuSnapshot||[]:patientItems()).find(e=>e.id===s.itemId);if(!ex||(ex.clinicalV02?.revision||'legacy')!==s.revision)throw Error('処方が変わりました。開き直してください。');return ex;}
function sessionError(e){const node=$('session-error');if(node)node.textContent=e.message;else toast(e.message);}
function startPatientSession(){try{if(patientSession?.history)throw Error('過去の記録から運動は開始できません。今日の画面へ戻ってください。');const ex=currentSessionExercise(),issues=patientAccessIssues(ex);if(issues.length)throw Error(issues.join('、'));const img=$('patientSession').querySelector('img');if((CR.isNew(ex)||legacyMediaFor(ex))&&!ex.mediaDisabled&&(!img?.complete||!img.naturalWidth))throw Error('画像が確認できません。読み込み後に開始してください。');const reps=$('session-reps')?.value||'',reason=$('session-reason')?.value||'';patientSession.started=true;drawPatientSession(ex);$('session-reps').value=reps;$('session-reason').value=reason;}catch(e){sessionError(e);}}
function newPatientSession(){try{if(patientSession?.history)throw Error('過去の記録では新しい実施回を開始できません。');const ex=currentSessionExercise();patientSession={...patientSession,id:uid(),started:false,saved:false,fresh:true};drawPatientSession(ex);}catch(e){sessionError(e);}}
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
renderToday=function(){renderTodayWithClinical();if(S&&!storageBlocked)$('today-content').insertAdjacentHTML('beforeend','<details class="card"><summary>記録の訂正・オフラインの準備</summary><button class="btn btn-out" onclick="openRecordHistory()">過去の実施記録・訂正</button><button class="btn btn-out" onclick="cacheClinicalImages()">選択された新画像をオフライン用に保存</button><p id="clinical-cache-status" role="status">画像は表示時にも保存します。端末の空き容量によっては保存できません。</p></details>');};
renderToday();
