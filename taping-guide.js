/* P41 viewing only: temporary choices/bookmarks, no saved completion or application writes. */
(function(root){
 'use strict';
 const data=root.TapingProtocol,model=root.TapingGuideModel;if(!data||!model||!root.document)return;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const instructionConfirmations=new Set();let confirmationContext=null;const assignments=new Map(),bookmarks=new Map(),cacheAPI=root.TapingImageCache,imageCache=cacheAPI?.create();let active=null,zoom=null;
 const state=()=>typeof S!=='undefined'?S:null;
 const staffAllowed=()=>typeof requireStaff==='function'&&requireStaff();
 const notify=message=>{if(typeof alert==='function')alert(message);};
 const signature=ex=>model.signature(data.protocol,ex,state()?.patientId||'');
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
  if(a){releaseRender(a);if(remember&&a.session)bookmarks.set(a.bookmarkKey,{index:a.session.index,view:a.session.viewIndex,choices:[...a.choices].sort()});a.session?.dispose();}
  document.getElementById('taping-guide')?.remove();a?.returnFocus?.focus?.();
 }
 function invalidate(){instructionConfirmations.clear();confirmationContext=null;assignments.clear();bookmarks.clear();if(active){close({remember:false});notify('対象の方または処方が変わった可能性があります。元の画面から開き直してください。');}}
 function validate(){
  if(!active)return false;if(active.staff){const current=active.ex.id?state()?.menu?.find(x=>x.id===active.ex.id&&x.exerciseKey===active.ex.exerciseKey):active.ex;if(!staffAllowed()||!current||signature(current)!==active.key){clearPosition(active.key);assignments.delete(active.key);close({remember:false});return false;}return true;}
  const s=state(),ex=s?.menu?.find(x=>x.id===active.ex.id&&x.exerciseKey===active.ex.exerciseKey);
  const issue=ex?(data.accessIssue(ex,{patientId:s.patientId})||model.patientIssue(data.protocol,ex,s.patientId)):'対象の処方を確認してください。';
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
   if(action==='resume'){const b=bookmarks.get(active.bookmarkKey);if(!b||!sameChoices(b.choices||[],active.choices))return start(0);if(active.staff&&d.querySelector('input[name="taping-option"]')){const selected=[...d.querySelectorAll('input[name="taping-option"]:checked')].map(x=>x.value);if(!sameChoices(selected,active.choices))return notify('任意工程が変わっています。設定して工程を開き直してください。');}return start(b.index||0,b.view||0);}
   if(action==='restart')return start(0);
   if(action==='retry')return render();
   if(action==='enlarge')return enlarge();
   if(action==='save-images')return saveImages();
   if(action==='previous'&&active.session.move(-1))return render();
   if(action==='next'&&!active.loading&&active.session.move(1))return render();
   if(action==='view'&&active.session.switchView(Number(b.dataset.view)))return render();
  });
  d.addEventListener('change',e=>{if(e.target.id==='taping-instruction-confirm'&&validate()){d.querySelector('[data-taping-action=confirm-instruction]').disabled=!e.target.checked;}if(e.target.id==='taping-jump'&&active?.staff&&active.session.jump(Number(e.target.value),{staff:true}))render();});
  return d;
 }
 function showInstructionConfirmation(d){d.innerHTML=header()+'<p>担当者に教わった内容を復習するためのガイドです。</p><p>'+esc(data.protocol.stop)+'</p><label class="taping-option"><input id="taping-instruction-confirm" type="checkbox">担当者から、この右足の巻き方を教わりました。</label><p>これは利用者による確認です。指導が実施されたことの証明や臨床承認ではありません。まだ教わっていない場合は開始せず、担当者へ確認してください。</p><button type="button" data-taping-action="confirm-instruction" disabled>確認して工程を見る</button>';}
 const header=()=>'<header><h2 id="taping-title">'+esc(data.protocol.title)+'</h2><button type="button" data-taping-action="close">閉じる</button></header>';
 function open(ex,{staff=false}={}){
  const permitted=!!staff&&staffAllowed(),p=data.protocol;
  if(!data.resolve(ex)){notify('対象の工程ガイドがありません。');return false;}
  const issue=permitted?'':(data.accessIssue(ex,{patientId:state()?.patientId||''})||model.patientIssue(p,ex,state()?.patientId||''));if(issue){notify(issue);return false;}
  close();const key=signature(ex);if(confirmationContext!==key){instructionConfirmations.clear();confirmationContext=key;}active={ex,key,bookmarkKey:key+(permitted?'|staff':'|patient'),staff:permitted,returnFocus:document.activeElement,choices:assignments.get(key)||p.defaultOptionGroups||[],session:null,loading:true};
  const d=mount();if(!validate())return false;
  const gs=model.groups(p);
  if(permitted&&gs.length){
   d.innerHTML=header()+'<p>担当者が必要とした工程だけを選択してください。これはこのページを開いている間だけの設定です。再読込後は既定の工程へ戻ります。</p><fieldset><legend>任意工程</legend>'+gs.map(g=>'<label class="taping-option"><input type="checkbox" name="taping-option" value="'+esc(g.id)+'" '+(active.choices.includes(g.id)?'checked':'')+'>'+esc(g.label)+'</label>').join('')+'</fieldset><button type="button" data-taping-action="apply-options">設定して工程を見る</button>'+(bookmarks.has(active.bookmarkKey)?'<button type="button" data-taping-action="resume">表示の続きから</button><button type="button" data-taping-action="restart">最初から</button>':'');
  }else if(!permitted&&p.requiresInstructionConfirmation&&!instructionConfirmations.has(active.key)){showInstructionConfirmation(d);
  }else if(bookmarks.has(active.bookmarkKey)){
   d.innerHTML=header()+'<p>同じページで前に閲覧した位置があります。テープの装着状態を確認して選んでください。閲覧位置は装着完了の記録ではありません。</p><button type="button" data-taping-action="resume">閲覧の続きから</button><button type="button" data-taping-action="restart">最初から</button>';
  }else start(0);
  if(!active)return false;d.showModal();d.querySelector('[data-taping-action="close"]').focus();return true;
 }
 function start(index,view=0){
  if(!validate())return;if(!active.staff&&data.protocol.requiresInstructionConfirmation&&!instructionConfirmations.has(active.key)){showInstructionConfirmation(document.getElementById('taping-guide'));return;}
  const issue=model.choicesIssue(data.protocol,active.choices);if(issue){close({remember:false});notify(issue);return;}
  active.session?.dispose();
  if(!active.staff&&model.selectedSteps(data.protocol,active.choices).some(s=>s.variantMissing)){close({remember:false});notify('この任意工程の選択に対応する累積図が未確認です。');return;}
  try{active.session=model.createSession(data.protocol,active.choices,{index});}catch(e){close({remember:false});notify(e.message);return;}
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
  d.innerHTML=header()+'<p class="taping-warning">'+esc(p.notice)+'</p>'+(!reviewed?'<p class="taping-warning">制作確認中：患者向けの貼付手順としては未公開です。</p>':'')+'<p class="taping-stop">'+esc(p.stop)+'</p><p>準備・安全の確認や最後の画面への到達は、担当者の指導・個別の治療指示の代わりにはなりません。</p><p>右足の例です。補助者が支え、足とすねがほぼ直角になる中間位を保ちます。図を見る方向だけが変わり、足首を動かす指示ではありません。</p><p class="taping-choice-note">任意工程は担当者の設定に従います。再読込後は既定の工程へ戻ります。</p>'+
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
 function button(ex,staff){return data.resolve(ex)?'<button type="button" class="btn btn-out taping-open" data-taping-open="'+(staff?'staff':'patient')+'">工程ごとのテーピング図を確認</button>':'';}
 function bind(container,ex,staff){container?.querySelector('[data-taping-open]')?.addEventListener('click',()=>open(ex,{staff}));}
 root.addEventListener?.('storage',invalidate);
 root.addEventListener?.('taping:patient-change',invalidate);
 root.addEventListener?.('focus',()=>{if(active)validate();});
 document.addEventListener?.('visibilitychange',()=>{if(!document.hidden&&active)validate();});
 const preview=typeof previewClinical==='function'?previewClinical:null;
 if(preview)previewClinical=function(id){const result=preview.apply(this,arguments),ex={exerciseKey:'v02_'+id};if(data.resolve(ex)){const node=document.getElementById('clinicalPreview');node?.querySelector('.t-modal')?.insertAdjacentHTML('beforeend',button(ex,true));bind(node,ex,true);}return result;};
 const session=typeof drawPatientSession==='function'?drawPatientSession:null;
 if(session)drawPatientSession=function(ex){if(active&&!active.staff)validate();const result=session.apply(this,arguments);if(data.resolve(ex)){const node=document.getElementById('patientSession');node?.querySelector('[data-patient-session]')?.insertAdjacentHTML('beforeend',button(ex,false));bind(node,ex,false);}return result;};
 function patientAccessIssue(ex){const patientId=state()?.patientId||'',key=signature(ex);if(confirmationContext!==key){instructionConfirmations.clear();confirmationContext=key;}const issue=data.accessIssue(ex,{patientId})||model.patientIssue(data.protocol,ex,patientId);if(issue)return issue;if(data.protocol.requiresInstructionConfirmation&&!instructionConfirmations.has(key))return '工程ガイドを開き、担当者から右足の巻き方を教わったことを確認してください。';return '';}
 root.TapingGuide={open,close,button,bind,assignOptions,invalidate,patientAccessIssue};
})(globalThis);
