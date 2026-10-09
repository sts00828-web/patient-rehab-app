/* P41 viewing only: temporary choices/bookmarks, no saved completion or application writes. */
(function(root){
 'use strict';
 const data=root.TapingProtocol,model=root.TapingGuideModel,entry=root.TapingEntryModel;if(!data||!model||!entry||!root.document)return;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const instructionConfirmations=new Set();let confirmationContext=null;const assignments=new Map(),bookmarks=new Map(),cacheAPI=root.TapingImageCache,imageCache=cacheAPI?.create();let active=null,zoom=null;
 const state=()=>typeof S!=='undefined'?S:null;
 const staffAllowed=()=>typeof requireStaff==='function'&&requireStaff();
 const notify=message=>{if(typeof alert==='function')alert(message);};
 const signature=ex=>model.signature(data.protocol,ex,state()?.patientId||'');
 const resolve=ex=>entry.hasGuide(ex)&&data.resolve(entry.guideExercise(ex));
 const accessIssue=(ex,patientId)=>data.accessIssue(entry.guideExercise(ex),{patientId});
 function closeZoom(){const z=zoom;zoom=null;if(z){z.dialog.remove();if(document.contains(z.returnFocus))z.returnFocus.focus();}}
 function releaseRender(a){closeZoom();a.renderAbort?.abort();a.saveAbort?.abort();a.saveAbort=null;a.currentImage=null;for(const url of a.supportURLs||[])URL.revokeObjectURL(url);a.supportURLs=[];if(a.blobURL){URL.revokeObjectURL(a.blobURL);a.blobURL=null;}}
 function enlarge(){
  if(!validate()||active.loading||!active.currentImage)return;
  const a=active,source=a.currentImage;if(!source.isConnected||!source.naturalWidth)return;
  closeZoom();const d=document.createElement('dialog');d.id='taping-image-zoom';d.className='taping-image-zoom';d.setAttribute('aria-label','現在の工程図を拡大');
  d.innerHTML='<header><p>拡大した図はスクロール・ピンチで確認できます。</p><button type="button">工程に戻る</button></header><div class="taping-zoom-scroll"><img alt="'+esc(source.alt)+'"></div>';
  const img=d.querySelector('img');zoom={dialog:d,returnFocus:document.activeElement,owner:a,source};const z=zoom;
  d.addEventListener('keydown',e=>{if(e.key==='Tab')e.stopPropagation();});
  const returnToStep=()=>{closeZoom();validate();};d.addEventListener('cancel',e=>{e.preventDefault();returnToStep();});d.querySelector('button').addEventListener('click',returnToStep);
  img.addEventListener('load',()=>{if(zoom!==z)return;if(active!==a||a.currentImage!==source||!validate()){closeZoom();return;}const scroller=d.querySelector('.taping-zoom-scroll');scroller.scrollLeft=Math.max(0,(scroller.scrollWidth-scroller.clientWidth)/2);scroller.scrollTop=Math.max(0,(scroller.scrollHeight-scroller.clientHeight)/2);},{once:true});
  img.addEventListener('error',()=>{if(zoom===z){closeZoom();if(active===a&&validate())notify('拡大図を表示できませんでした。工程の図を確認してください。');}},{once:true});
  img.src=source.currentSrc||source.src;document.body.append(d);d.showModal();d.querySelector('button').focus();
 }
 function close({remember=true}={}){
  const a=active;active=null;
  if(a){releaseRender(a);if(remember&&a.session)bookmarks.set(a.bookmarkKey,{index:a.presentation==='sequence'?entry.chapters(a.session.steps)[a.chapter||0].first:a.session.index,view:a.session.viewIndex,choices:[...a.choices].sort(),presentation:a.presentation,scrollTop:document.getElementById('taping-guide')?.scrollTop||0});a.session?.dispose();}
  document.getElementById('taping-guide')?.remove();a?.returnFocus?.focus?.();
 }
 function invalidate(){instructionConfirmations.clear();confirmationContext=null;assignments.clear();bookmarks.clear();if(active){close({remember:false});notify('対象の方または処方が変わった可能性があります。元の画面から開き直してください。');}}
 function validate(){
  if(!active)return false;if(active.staff){const current=active.ex.id?state()?.menu?.find(x=>x.id===active.ex.id&&x.exerciseKey===active.ex.exerciseKey):active.ex;if(!staffAllowed()||!current||signature(current)!==active.key){clearPosition(active.key);assignments.delete(active.key);close({remember:false});return false;}return true;}
  const s=state(),ex=s?.menu?.find(x=>x.id===active.ex.id&&x.exerciseKey===active.ex.exerciseKey);
  const issue=ex?(accessIssue(ex,s.patientId)||model.patientIssue(data.protocol,ex,s.patientId)):'対象の処方を確認してください。';
  if(issue||signature(ex)!==active.key){instructionConfirmations.clear();close({remember:false});notify(issue||'対象の方または処方が変わりました。元の画面から開き直してください。');return false;}
  return true;
 }
 const sameChoices=(a,b)=>JSON.stringify([...new Set(a)].sort())===JSON.stringify([...new Set(b)].sort());
 function clearPosition(key){instructionConfirmations.delete(key);for(const role of ['staff','patient'])bookmarks.delete(key+'|'+role);}
 function resumeChoice(d){d.innerHTML=header()+'<p>同じページで前に見た位置があります。現在の貼付状態と担当者の設定を確認して選んでください。この位置は実施済みの記録ではありません。</p><button type="button" data-taping-action="resume">表示の続きから</button><button type="button" data-taping-action="restart">最初から</button>';}
 function assignOptions(ex,choices){
  if(!staffAllowed())return false;
  const issue=model.choicesIssue(data.protocol,choices);if(issue){notify(issue);return false;}
  const key=signature(ex),changed=!sameChoices(assignments.get(key)||data.protocol.defaultOptionGroups||[],choices);if(active&&active.key===key)close({remember:!changed});if(changed)clearPosition(key);assignments.set(key,[...new Set(choices)]);return true;
 }
 function mount(){
  const d=document.createElement('dialog');d.id='taping-guide';d.className='taping-guide';d.setAttribute('aria-labelledby','taping-title');document.body.append(d);
  d.addEventListener('cancel',e=>{e.preventDefault();close();});
  d.addEventListener('keydown',e=>{if(e.key==='Tab')e.stopPropagation();});
  d.addEventListener('click',e=>{
   const b=e.target.closest('[data-taping-action]');if(!b||b.disabled||!active)return;
   const action=b.dataset.tapingAction;if(action==='close')return close();if(!validate())return;
   if(action==='apply-options'){
    const choices=[...d.querySelectorAll('input[name="taping-option"]:checked')].map(x=>x.value),issue=model.choicesIssue(data.protocol,choices);
    if(issue)return notify(issue);if(!active.staff||!staffAllowed())return;
    const changed=!sameChoices(active.choices,choices);if(changed)clearPosition(active.key);assignments.set(active.key,choices);active.choices=choices;if(!changed&&bookmarks.has(active.bookmarkKey))return resumeChoice(d);return start(0);
   }
   if(action==='confirm-instruction'){if(active.staff||!d.querySelector('#taping-instruction-confirm')?.checked)return;instructionConfirmations.add(active.key);root.dispatchEvent(new Event('taping:confirmation-change'));if(bookmarks.has(active.bookmarkKey)){d.innerHTML=header()+'<p>同じページで前に閲覧した位置があります。装着状態を確認して選んでください。</p><button type="button" data-taping-action="resume">閲覧の続きから</button><button type="button" data-taping-action="restart">最初から</button>';return;}return start(0);}
   if(action==='resume'){const b=bookmarks.get(active.bookmarkKey);if(!b||!sameChoices(b.choices||[],active.choices))return start(0);if(active.staff&&d.querySelector('input[name="taping-option"]')){const selected=[...d.querySelectorAll('input[name="taping-option"]:checked')].map(x=>x.value);if(!sameChoices(selected,active.choices))return notify('任意工程が変わっています。設定して工程を開き直してください。');}start(b.index||0,b.view||0,b.presentation||'sequence');if(b.presentation==='sequence')d.scrollTop=b.scrollTop||0;return;}
   if(action==='restart')return start(0);
   if(action==='retry')return render();
   if(action==='sequence'){active.presentation='sequence';return render();}
   if(action==='chapter'){const groups=entry.chapters(active.session.steps),index=Number(b.dataset.chapter);if(!Number.isInteger(index)||index<0||index>=groups.length)return;active.chapter=index;document.getElementById('taping-guide').scrollTop=0;return render();}
   if(action==='detail'){const index=Number(b.dataset.index);if(!Number.isInteger(index)||index<0||index>=active.session.steps.length)return;return start(index,0,'step');}
   if(action==='enlarge')return enlarge();
   if(action==='save-images')return saveImages();
   if(action==='previous'&&active.session.move(-1))return render();
   if(action==='next'&&!active.loading&&active.session.move(1))return render();
   if(action==='view'&&active.session.switchView(Number(b.dataset.view)))return render();
  });
  d.addEventListener('change',e=>{if(e.target.id==='taping-instruction-confirm'&&validate()){d.querySelector('[data-taping-action=confirm-instruction]').disabled=!e.target.checked;}if(e.target.id==='taping-jump'&&active?.staff&&active.session.jump(Number(e.target.value),{staff:true}))render();});
  return d;
 }
 function showInstructionConfirmation(d){d.innerHTML=header()+'<p>準備から貼付・終了まで、番号付きの連続画像で確認します。</p><p>'+esc(data.protocol.notice)+(active.ex.exerciseKey==='v02_P27'?'<p class="taping-warning">元の足関節サポートの指示と、この右足の巻き方が同じ場合だけ復習してください。方法や対象側が異なる場合は担当者へ確認してください。</p>':'')+'<p>'+esc(data.protocol.stop)+'</p><label class="taping-option"><input id="taping-instruction-confirm" type="checkbox">担当者から、この右足の巻き方を教わりました。</label><p>これは利用者による確認です。指導が実施されたことの証明や臨床承認ではありません。まだ教わっていない場合は開始せず、担当者へ確認してください。</p><button type="button" data-taping-action="confirm-instruction" disabled>確認して番号付きの貼り方を見る</button>';}
 const header=()=>'<header><h2 id="taping-title">'+esc(data.protocol.title)+'</h2><button type="button" data-taping-action="close">閉じる</button></header>';
 function open(ex,{staff=false}={}){
  const permitted=!!staff&&staffAllowed(),p=data.protocol;
  if(!resolve(ex)){notify('対象の工程ガイドがありません。');return false;}
  const issue=permitted?'':(accessIssue(ex,state()?.patientId||'')||model.patientIssue(p,ex,state()?.patientId||''));if(issue){notify(issue);return false;}
  close();const key=signature(ex);if(confirmationContext!==key){instructionConfirmations.clear();confirmationContext=key;}active={ex,key,bookmarkKey:key+(permitted?'|staff':'|patient'),staff:permitted,returnFocus:document.activeElement,choices:assignments.get(key)||p.defaultOptionGroups||[],session:null,loading:true};
  const d=mount();if(!validate())return false;
  const gs=model.groups(p);
  if(permitted&&gs.length){
   d.innerHTML=header()+'<p>準備から貼付・終了まで、1動作ずつ番号付きの画像で確認します。</p><button type="button" data-taping-action="apply-options">① 貼り方を1から見る</button><details><summary>担当者向け：任意工程を変更</summary><p>設定はこのページを開いている間だけです。再読込後は既定の工程へ戻ります。</p><fieldset><legend>任意工程</legend>'+gs.map(g=>'<label class="taping-option"><input type="checkbox" name="taping-option" value="'+esc(g.id)+'" '+(active.choices.includes(g.id)?'checked':'')+'>'+esc(g.label)+'</label>').join('')+'</fieldset></details>'+(bookmarks.has(active.bookmarkKey)?'<button type="button" data-taping-action="resume">表示の続きから</button><button type="button" data-taping-action="restart">最初から</button>':'');
  }else if(!permitted&&p.requiresInstructionConfirmation&&!instructionConfirmations.has(active.key)){showInstructionConfirmation(d);
  }else if(bookmarks.has(active.bookmarkKey)){
   d.innerHTML=header()+'<p>同じページで前に閲覧した位置があります。テープの装着状態を確認して選んでください。閲覧位置は装着完了の記録ではありません。</p><button type="button" data-taping-action="resume">閲覧の続きから</button><button type="button" data-taping-action="restart">最初から</button>';
  }else start(0);
  if(!active)return false;d.showModal();d.querySelector('[data-taping-action="close"]').focus();return true;
 }
 function start(index,view=0,presentation='sequence'){
  if(!validate())return;if(!active.staff&&data.protocol.requiresInstructionConfirmation&&!instructionConfirmations.has(active.key)){showInstructionConfirmation(document.getElementById('taping-guide'));return;}
  const issue=model.choicesIssue(data.protocol,active.choices);if(issue){close({remember:false});notify(issue);return;}
  active.session?.dispose();
  if(!active.staff&&model.selectedSteps(data.protocol,active.choices).some(s=>s.variantMissing)){close({remember:false});notify('この任意工程の選択に対応する累積図が未確認です。');return;}
  try{active.session=model.createSession(data.protocol,active.choices,{index});}catch(e){close({remember:false});notify(e.message);return;}
  active.presentation=presentation;active.chapter=entry.chapters(active.session.steps).findIndex(g=>g.steps.some(x=>x.index===index));
  if(view)active.session.switchView(view);
  render();
 }
 async function saveImages(){
  if(!validate()||!imageCache||!active.session)return;
  const a=active,d=document.getElementById('taping-guide'),status=d.querySelector('.taping-offline-status'),button=d.querySelector('[data-taping-action="save-images"]');
  let assets;try{assets=cacheAPI.assetsFor(data.protocol,a.choices,model);}catch(e){status.textContent=e.message;return;}
  a.saveAbort?.abort();const controller=new AbortController();a.saveAbort=controller;button.disabled=true;status.textContent='工程図を保存しています。';
  const current=()=>active===a&&a.saveAbort===controller&&!controller.signal.aborted&&d.contains(status);
  try{await imageCache.save(assets,{signal:controller.signal,onProgress:r=>{if(current()&&validate())status.textContent='保存・照合中 '+r.present+' / '+r.total;}});if(current()&&validate())status.textContent='選択中の工程図をすべて保存・照合しました。';}
  catch(e){if(current()&&validate())status.textContent='保存は完了していません。通信・端末の空き容量を確認してやり直してください。'+e.message;}
  finally{if(current())button.disabled=false;}
 }
 function sourceReference(s){return (Array.isArray(s.sourceSections)?s.sourceSections:[s.sourceSection]).filter(x=>typeof x==='string'&&x.trim()).join(' / ')||'参照情報未設定';}
 function priorStageLabels(s){
 const strip=s.logicalStripId||'none',check=s.kind==='check'||/^check-/.test(s.id||'');
 if(strip==='none')return {current:check?'今：貼付後全体の確認':'今：現在の確認工程',prior:check?'済：現在の貼付状態':'準備中の状態',support:'同じ貼付状態',supportText:'足を動かさず、同じ貼付状態を別の方向から確認します。'};
 if(/^PAD(?:[-_]|$)/.test(strip))return {current:'今：保護パッド',prior:'済：これまでに置いた保護材',support:'同じ保護パッド',supportText:'同じ保護パッドを別の方向から確認します。'};
 if(strip==='UW')return {current:'今：薄い下巻き',prior:'済：これまでの保護材・下巻き',support:'同じ下巻き状態',supportText:'足を動かさず、同じ下巻き状態を別の方向から確認します。'};
 if(/^(AS[123]|AF|S[123]|H[123]|F[12]|L[12]|M[12]|CS[0-5]|CF[12])$/.test(strip))return {current:'今 '+strip+'：今回確認するテープ。貼付中の経路は青で示します。',prior:'済：これまでのテープ・保護材の貼付状態',support:'同じ一本 '+strip,supportText:'新しい一本ではありません。足を動かさず、同じ一本を別の方向から確認します。'};
 return {current:'今：現在確認する貼付材料',prior:'済：これまでの貼付状態',support:'同じ貼付状態',supportText:'足を動かさず、同じ貼付状態を別の方向から確認します。'};
}
 function stageLabels(s){
 const strip=s.logicalStripId||'none';
 if(strip!=='none')return priorStageLabels(s);
 const ending=s.completionViews===true&&['check-gaps','check-neatness','check-support','check-comfort','check-color','check-temperature','check-sensation','check-function'].includes(s.id);
 if(ending)return {current:'現：貼付後全体の確認',prior:'済：現在の貼付状態',support:'同じ貼付状態',supportText:'足を動かさず、同じ貼付状態を別の方向から確認します。'};
 return {current:s.id==='check-skin-before'?'現：貼付前の皮膚確認':'現：現在の準備工程',prior:'準備段階の状態',support:'貼付前の同じ状態',supportText:'貼付前の同じ準備状態を確認します。'};
}
 function render(){
  if(!validate()||!active.session)return;
  if(active.presentation==='sequence')return renderSequence();
  const a=active,sess=a.session,p=data.protocol,s=sess.step(),d=document.getElementById('taping-guide'),key=sess.currentKey,asset=p.illustrations?.[key],ks=sess.viewKeys();
  if(!d)return;
  releaseRender(a);a.renderAbort=new AbortController();const controller=a.renderAbort;
  a.loading=true;const ticket=sess.ticket();
  const validAsset=asset&&typeof asset.image==='string'&&/^images\/[a-zA-Z0-9_./-]+\.webp$/.test(asset.image)&&!asset.image.split('/').includes('..');
  const reviewed=!model.reviewIssue(p)&&!s.variantMissing&&ks.every(k=>p.illustrations?.[k]?.reviewStatus==='verified');
  if(!a.staff&&!reviewed){close({remember:false});notify('この選択に対応する工程図の確認が未完了です。');return;}
  const progress=sess.index+1;
  const labels=stageLabels(s),currentLegend=labels.current,priorLegend=labels.prior;
  const supportKeys=s.completionViews?ks.filter(k=>k!==key):[];
  const closeups=validAsset&&Array.isArray(asset.closeups)?asset.closeups:[];
  const supportHTML=closeups.map((c,i)=>{const [x,y,w,h]=c.box;return '<section class="taping-support"><h4>'+esc(c.title)+'</h4><p>'+esc(c.text)+'</p><div class="taping-crop-window" style="aspect-ratio:'+w+'/'+h+'"><img data-taping-crop="'+i+'" hidden alt="'+esc(c.title)+'" style="width:'+(asset.width/w*100)+'%;left:'+(-x/w*100)+'%;top:'+(-y/h*100)+'%"></div></section>';}).join('')+supportKeys.map(k=>'<section class="taping-support"><h4>'+esc(labels.support)+' / '+esc(p.illustrations[k]?.view)+'</h4><p>'+esc(labels.supportText)+'</p><img data-taping-support="'+esc(k)+'" hidden alt="'+esc(p.illustrations[k]?.view)+'"></section>').join('');
  d.innerHTML=header()+'<div class="taping-mode-bar"><button type="button" data-taping-action="sequence">番号付きの全手順に戻る</button><p>1動作ずつ大きく確認</p></div><p class="taping-warning">'+esc(p.notice)+'</p>'+(!reviewed?'<p class="taping-warning">制作確認中：患者向けの貼付手順としては未公開です。</p>':'')+'<p class="taping-stop">'+esc(p.stop)+'</p><p>準備・安全の確認や最後の画面への到達は、担当者の指導・個別の治療指示の代わりにはなりません。</p><p>右足の例です。補助者が支え、足とすねがほぼ直角になる中間位を保ちます。図を見る方向だけが変わり、足首を動かす指示ではありません。</p><p class="taping-choice-note">任意工程は担当者の設定に従います。再読込後は既定の工程へ戻ります。</p>'+
   (a.staff?'<label for="taping-jump">制作レビューの工程移動</label><select id="taping-jump">'+sess.steps.map((x,i)=>'<option value="'+i+'" '+(i===sess.index?'selected':'')+'>'+esc((i+1)+'. '+x.phase)+'</option>').join('')+'</select>':'')+
   '<section aria-live="polite"><p class="taping-progress">'+progress+' / '+sess.steps.length+'　'+esc(s.phase)+'</p><h3 id="taping-action">'+esc(s.action)+'</h3>'+(s.instructions?.length?'<ul class="taping-instructions">'+s.instructions.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':s.detail?'<p>'+esc(s.detail)+'</p>':'')+(s.continuityCue?'<p>'+esc(s.continuityCue)+'</p>':'')+(s.materialCue?'<p>'+esc(s.materialCue)+'</p>':'')+
   (ks.length>1?'<div class="taping-views" aria-label="同じ工程の別の視点">'+ks.map((k,i)=>'<button type="button" data-taping-action="view" data-view="'+i+'" aria-pressed="'+(i===sess.viewIndex)+'">'+esc(p.illustrations?.[k]?.view||'未作成の視点')+'</button>').join('')+'</div><p class="taping-view-note">この工程の各視点を確認してから次へ進んでください。</p>':'')+
   '<div class="taping-legend"><p>'+esc(currentLegend)+'</p><p>'+esc(priorLegend)+'</p></div><figure>'+(validAsset?'<img hidden alt="'+esc(s.phase+'。'+asset.view+'。'+s.action)+'" width="'+(asset.width||1200)+'" height="'+(asset.height||1200)+'">':'')+'<figcaption>'+esc(asset?.view||'図は未作成です。本文から経路を推測しないでください。')+'</figcaption></figure><p class="taping-image-status" role="status">図を読み込んでいます。</p><button type="button" data-taping-action="enlarge" disabled>図を大きく見る</button><div class="taping-image-error" role="alert" hidden>図を読み込めません。この工程を推測して貼らず、担当者へ確認してください。<button type="button" data-taping-action="retry">図を再読込</button></div><p class="taping-legend">'+esc(p.legend)+'</p>'+supportHTML+'</section>'+
   '<section class="taping-offline"><button type="button" data-taping-action="save-images" '+(!reviewed||!imageCache?.supported()?'disabled':'')+'>工程図を端末に保存</button><p class="taping-offline-status" role="status">'+(reviewed?'この選択で必要な工程図の保存状況を確認しています。':'未確認の工程図は保存できません。')+'</p><p>保存するのは工程図だけです。画面と工程図の保存は別です。オフラインで開き直した後、必要な図が表示されることを確認してください。再読込すると任意工程は既定の選択へ戻ります。端末が保存図を削除した場合は再保存が必要です。</p></section>'+
   '<nav aria-label="工程の移動"><button type="button" data-taping-action="previous" '+(sess.index===0?'disabled':'')+'>前の工程</button><button type="button" data-taping-action="next" disabled>次の工程</button></nav>'+
   (sess.index===sess.steps.length-1?'<p class="taping-end">説明はここまでです。装着成功や競技への参加許可を判定したものではありません。実施記録は元の画面で行ってください。</p>':'')+
   '<details><summary>この工程の参照</summary><p>'+esc(sourceReference(s))+'／'+esc(p.version)+'</p><a href="'+esc(p.source?.url||'https://at.uwa.edu/CurrHome/ah410/anklater.asp')+'" target="_blank" rel="noopener noreferrer">'+esc(p.source?.title||'UWA Ankle Taping')+'</a></details>';
  const img=d.querySelector('img'),next=d.querySelector('[data-taping-action="next"]');
  next.disabled=true;
  const current=()=>active===a&&active.session===sess&&!controller.signal.aborted&&document.getElementById('taping-guide')===d&&(!img||d.contains(img));
  function finish(ok){
   if(!current()||!validate()||!sess.accept(ticket,ok))return;
   a.loading=false;const error=d.querySelector('.taping-image-error'),status=d.querySelector('.taping-image-status');
   error.hidden=ok;status.textContent=ok?(sess.ready()?'この工程の図を表示しました。':'別の視点も確認してください。'):'';
   if(img)img.hidden=!ok;a.currentImage=ok?img:null;d.querySelector('[data-taping-action="enlarge"]').disabled=!ok;next.disabled=!ok||!sess.ready()||sess.index===sess.steps.length-1;
  }
  if(reviewed&&imageCache?.supported()){
   const status=d.querySelector('.taping-offline-status');
   Promise.resolve().then(()=>imageCache.status(cacheAPI.assetsFor(p,a.choices,model),{signal:controller.signal})).then(r=>{if(current()&&validate()&&!a.saveAbort)status.textContent=r.complete?'この選択で必要な工程図はすべて端末に保存されています。':'この選択で必要な工程図の保存は未完了です（'+r.present+' / '+r.total+'）。';}).catch(()=>{if(current()&&validate()&&!a.saveAbort)status.textContent='工程図の保存を確認できません。保存は未完了として扱います。';});
  }else if(reviewed)d.querySelector('.taping-offline-status').textContent='この端末では工程図の保存を利用できません。';
  if(!img){finish(false);return;}
  async function loadSupports(){
   const loads=[...d.querySelectorAll('[data-taping-crop],[data-taping-support]')].map(async other=>{
    const otherKey=other.dataset.tapingSupport;let url=img.currentSrc||img.src;
    if(otherKey){const supporting=p.illustrations[otherKey];if(!supporting?.image)throw Error('完成の別視点がありません。');const blob=reviewed&&imageCache?await imageCache.cached(supporting,{signal:controller.signal}):null;if(!current()||!validate())throw Error('stale');if(blob){url=URL.createObjectURL(blob);a.supportURLs.push(url);}else{if(root.navigator?.onLine===false)throw Error('必要な別視点が保存されていません。');url=supporting.image;}}
    await new Promise((resolve,reject)=>{other.onload=async()=>{try{if(other.decode)await other.decode();if(!other.naturalWidth)throw Error('empty');resolve();}catch(e){reject(e);}};other.onerror=reject;other.src=url;});
    if(!current()||!validate())throw Error('stale');other.hidden=false;if(otherKey&&!sess.acceptVisible(ticket,otherKey,true))throw Error('stale');
   });await Promise.all(loads);
  }
  img.addEventListener('load',async()=>{try{if(img.decode)await img.decode();await loadSupports();finish(img.naturalWidth>0);}catch{finish(false);}},{once:true});img.addEventListener('error',()=>finish(false),{once:true});
  (async()=>{try{const blob=reviewed&&imageCache?await imageCache.cached(asset,{signal:controller.signal}):null;if(!current()||!validate())return;if(blob){a.blobURL=URL.createObjectURL(blob);img.src=a.blobURL;}else{if(root.navigator?.onLine===false)throw Error('必要な図が端末に保存されていません。');img.src=asset.image;}}catch{finish(false);}})();
 }

 function renderSequence(){
  const a=active,sess=a.session,p=data.protocol,d=document.getElementById('taping-guide');if(!d)return;
  const scroll=d.scrollTop;releaseRender(a);a.renderAbort=new AbortController();const controller=a.renderAbort;a.loading=false;
  const groups=entry.chapters(sess.steps),gi=Math.max(0,Math.min(a.chapter||0,groups.length-1)),g=groups[gi],endpoints=entry.endpoints(g);a.chapter=gi;
  const image=key=>{const asset=p.illustrations[key];return '<figure><img data-sequence-image="'+esc(key)+'" hidden width="'+(asset.width||1200)+'" height="'+(asset.height||1200)+'" alt="'+esc(asset.view)+'"><figcaption>'+esc(asset.view)+'</figcaption><p class="sequence-image-status" role="status">図を読み込みます</p></figure>';};
  const chapterButton=(index,label)=>'<button type="button" data-taping-action="chapter" data-chapter="'+index+'">'+esc(label)+'</button>';
  d.innerHTML=header()+'<div class="taping-sequence-lead"><strong>'+esc(g.phase)+'：1動作ずつ順番に確認</strong><p>この章は図'+(g.first+1)+'〜'+(g.first+g.steps.length)+'です。下へスクロールして、番号順に画像を見ます。章の最後から次の章へ進めます。</p><p>担当者から指導を受けた右足の巻き方の復習です。閲覧は実施記録になりません。</p></div><details class="taping-safety"><summary>皮膚・循環・中止の注意を確認</summary><p>'+esc(p.notice)+'</p><p>'+esc(p.stop)+'</p></details><div class="taping-chapter-position">'+(gi+1)+' / '+groups.length+'章</div><details class="taping-chapter-index"><summary>章を選ぶ</summary><label for="taping-sequence-chapter">工程のまとまり</label><select id="taping-sequence-chapter">'+groups.map((x,i)=>'<option value="'+i+'" '+(i===gi?'selected':'')+'>'+(i+1)+'. '+esc(x.phase)+'（図'+(x.first+1)+'から）</option>').join('')+'</select></details>'+
   '<div class="taping-sequence"><section id="taping-chapter-'+gi+'" class="taping-sequence-group"><h3>'+esc(g.phase)+'</h3>'+(endpoints?'<dl class="taping-route"><dt>この章の最初の動作・貼り始め</dt><dd>'+esc(endpoints.start)+'</dd><dt>この章の最後の動作・到達位置</dt><dd>'+esc(endpoints.end)+'</dd></dl>':'')+'<details class="taping-image-legend"><summary>画像の色・見る方向の説明</summary><p>'+esc(p.legend)+'</p></details><ol>'+g.steps.map(({step:s,index,number})=>{const keys=model.keys(s),other=keys.slice(1),labels=stageLabels(s);return '<li id="taping-sequence-'+index+'" class="taping-sequence-card" data-sequence-step="'+esc(s.id)+'"><h4><span class="taping-step-number">'+number+'</span>'+esc(s.action)+'</h4>'+image(keys[0])+'<details class="taping-image-legend"><summary>この画像の色・表示対象を確認</summary><p>'+esc(labels.current)+'</p><p>'+esc(labels.prior)+'</p></details>'+(s.instructions?.length?'<ul>'+s.instructions.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':'')+(s.materialCue?'<p>使用するもの：'+esc(s.materialCue)+'</p>':'')+(s.continuityCue?'<p class="taping-continuity">'+esc(s.continuityCue)+'</p>':'')+(other.length?(s.completionViews?'<div class="sequence-views"><p>同じ状態を各方向から確認します。</p>'+other.map(k=>image(k)).join('')+'</div>':'<details class="sequence-views"><summary>この動作を別の方向から確認（'+other.length+'視点）</summary>'+other.map(k=>image(k)).join('')+'</details>'):'')+'<button type="button" data-taping-action="detail" data-index="'+index+'">図'+number+'の拡大・細部を確認</button></li>';}).join('')+'</ol></section></div><nav class="taping-chapter-nav" aria-label="章の移動">'+(gi>0?chapterButton(gi-1,'前の章：'+groups[gi-1].phase):'')+(gi<groups.length-1?chapterButton(gi+1,'次の章：'+groups[gi+1].phase+'（図'+(groups[gi+1].first+1)+'から）'):'<p>最後の章です。実施記録は元の画面で行ってください。</p>')+'</nav><section class="taping-offline"><button type="button" data-taping-action="save-images" '+(!imageCache?.supported()?'disabled':'')+'>選択中の全ての章の図を端末に保存</button><p class="taping-offline-status" role="status">保存は工程図だけです。実施記録は変わりません。</p><p>オフライン用の図は、事前に保存してから表示を確認してください。</p></section>';
  d.scrollTop=scroll;d.querySelector('#taping-sequence-chapter').addEventListener('change',e=>{a.chapter=Number(e.target.value);d.scrollTop=0;render();});
  const current=img=>active===a&&!controller.signal.aborted&&d.contains(img)&&validate();
  async function load(img){if(img.dataset.loading)return;img.dataset.loading='true';const asset=p.illustrations[img.dataset.sequenceImage],status=img.closest('figure').querySelector('.sequence-image-status');
   img.onload=()=>{if(!current(img))return;img.hidden=false;status.textContent='図を表示しました';};img.onerror=()=>{if(!current(img))return;img.hidden=true;status.textContent='図を読み込めません。この動作を推測して貼らず担当者へ確認してください。';};
   try{const blob=imageCache?await imageCache.cached(asset,{signal:controller.signal}):null;if(!current(img))return;if(blob){const url=URL.createObjectURL(blob);a.supportURLs.push(url);img.src=url;}else{if(root.navigator?.onLine===false)throw Error('offline');img.src=asset.image;}}catch{if(current(img))img.onerror();}
  }
  const images=[...d.querySelectorAll('[data-sequence-image]')];
  if(typeof IntersectionObserver==='function'){const allocated=new IntersectionObserver(rows=>{for(const r of rows)if(r.isIntersecting){allocated.unobserve(r.target);load(r.target.querySelector('img'));}},{root:d,rootMargin:'200px'});images.forEach(img=>allocated.observe(img.closest('figure')));controller.signal.addEventListener('abort',()=>allocated.disconnect(),{once:true});
  }else images.forEach(load);
 }
 function entryHTML(ex,staff=false){
  if(!entry.isTaping(ex))return '';
  if(!resolve(ex))return '<section class="taping-entry taping-reference"><strong>完成位置の参考図</strong><p>この種目には、貼り始めから終わりまでの連続図解がまだありません。下の1枚だけで貼り方を判断せず、担当者にこの種目の手順を確認してください。</p></section>';
  const eligible=staff||ex.clinicalV02?.side==='right';
  const first=model.selectedSteps(data.protocol,data.protocol.defaultOptionGroups||[])[0],asset=data.protocol.illustrations[model.keys(first)[0]],firstPreview='<figure class="taping-entry-first"><img src="'+esc(asset.image)+'" alt="'+esc(first.action)+'"><figcaption><span class="taping-step-number">1</span>'+esc(first.action)+'</figcaption></figure>';
  return '<section class="taping-entry"><strong>番号付きの連続画像で貼り方を確認</strong><p>準備 → 貼り始める位置 → 通す方向 → 貼り終える位置。1図につき1動作です。</p>'+(eligible?button(ex,staff)+firstPreview:'<p>この連続図解は右足専用です。現在の指定側へ読み替えず、担当者に手順を確認してください。</p>')+(ex.exerciseKey==='v02_P27'?'<p class="taping-entry-note">元の足関節サポートと、この右足の巻き方が同じ場合に使います。処方や過去の記録は変更しません。</p>':'')+'<p class="taping-entry-note">初回は専門家の指導下で。下の1枚は準備・完成位置の参考です。</p></section>';
 }

 function button(ex,staff){return resolve(ex)?'<button type="button" class="btn btn-pri taping-open" data-taping-open="'+(staff?'staff':'patient')+'">① 貼り方を1から見る（連続画像）</button>':'';}
 function bind(container,ex,staff){container?.querySelectorAll('[data-taping-open]').forEach(b=>b.addEventListener('click',()=>open(ex,{staff})));}
 root.addEventListener?.('storage',invalidate);
 root.addEventListener?.('taping:patient-change',invalidate);
 root.addEventListener?.('focus',()=>{if(active)validate();});
 document.addEventListener?.('visibilitychange',()=>{if(!document.hidden&&active)validate();});
 const preview=typeof previewClinical==='function'?previewClinical:null;
 if(preview)previewClinical=function(id){const result=preview.apply(this,arguments),ex={exerciseKey:'v02_'+id};if(entry.isTaping(ex)){const node=document.getElementById('clinicalPreview');node?.querySelector('.t-hd')?.insertAdjacentHTML('afterend',entryHTML(ex,true));bind(node,ex,true);}return result;};
 const session=typeof drawPatientSession==='function'?drawPatientSession:null;
 if(session)drawPatientSession=function(ex){if(active&&!active.staff)validate();const result=session.apply(this,arguments);if(entry.isTaping(ex)){const node=document.getElementById('patientSession');node?.querySelector('#session-status')?.insertAdjacentHTML('afterend',entryHTML(ex,false));bind(node,ex,false);}return result;};
 const today=typeof renderToday==='function'?renderToday:null;
 if(today)renderToday=function(){const result=today.apply(this,arguments),ex=typeof patientItems==='function'?patientItems()[todayExerciseIndex]:null;if(ex&&entry.isTaping(ex)){const node=document.getElementById('today-exercise-view');node?.classList.add('today-taping-exercise');node?.querySelector('h1')?.insertAdjacentHTML('afterend',entryHTML(ex,false));node?.querySelector('.home-prescription>summary')?.insertAdjacentHTML('afterend',entryHTML(ex,false));bind(node,ex,false);const start=document.getElementById('today-start');if(start&&!start.textContent.includes('記録を確認'))start.textContent='貼り方を確認して実施を記録';}return result;};
 const move=typeof moveTodayExercise==='function'?moveTodayExercise:null;
 if(move)moveTodayExercise=function(){const result=move.apply(this,arguments),ex=typeof patientItems==='function'?patientItems()[todayExerciseIndex]:null;if(ex&&entry.isTaping(ex))document.getElementById('today-exercise-view')?.scrollIntoView({block:'start',behavior:'instant'});return result;};
 function patientAccessIssue(ex){const patientId=state()?.patientId||'',key=signature(ex);if(confirmationContext!==key){instructionConfirmations.clear();confirmationContext=key;}const issue=accessIssue(ex,patientId)||model.patientIssue(data.protocol,ex,patientId);if(issue)return issue;if(data.protocol.requiresInstructionConfirmation&&!instructionConfirmations.has(key))return '工程ガイドを開き、担当者から右足の巻き方を教わったことを確認してください。';return '';}
 root.TapingGuide={open,close,button,bind,entryHTML,assignOptions,invalidate,patientAccessIssue};
 if(today&&state())renderToday();
})(globalThis);
