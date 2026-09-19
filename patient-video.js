/* Videos stay in IndexedDB on this origin. Never part of settings, QR or JSON backups. */
const PatientVideo = (() => {
  const database='patient-rehab-local-videos';
  function open(){return new Promise((resolve,reject)=>{
    const request=indexedDB.open(database,1);
    request.onupgradeneeded=()=>request.result.createObjectStore('videos',{keyPath:'key'}).createIndex('patient','patient');
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(Error('別の画面を閉じて再度お試しください。'));
  });}
  async function transaction(mode,action){
    const db=await open();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('videos',mode);let result;
      tx.oncomplete=()=>{db.close();resolve(result);};
      tx.onabort=()=>{db.close();reject(tx.error||Error('保存できませんでした。'));};
      tx.onerror=()=>{};
      try{action(tx.objectStore('videos'),value=>result=value);}catch(e){tx.abort();}
    });
  }
  const key=(patient,ex)=>JSON.stringify([patient,ex.id,ex.exerciseKey||'',ex.exerciseKey?'':ex.name]);
  const get=k=>transaction('readonly',(store,done)=>{const r=store.get(k);r.onsuccess=()=>done(r.result);});
  const put=row=>transaction('readwrite',store=>store.put(row));
  const remove=k=>transaction('readwrite',store=>store.delete(k));
  const removePatient=patient=>transaction('readwrite',store=>{const r=store.index('patient').openCursor(IDBKeyRange.only(patient));r.onsuccess=()=>{const cursor=r.result;if(cursor){cursor.delete();cursor.continue();}};});
  const valid=file=>file&&file.size>0&&file.size<=100*1024*1024&&(file.type.startsWith('video/')||(!file.type&&/\.(mp4|mov|m4v|webm|3gp)$/i.test(file.name)));
  function mount(ex){
    const host=document.getElementById('patient-video');
    if(!host||!S?.patientId||!ex.id)return;
    const patient=S.patientId,k=key(patient,ex),dose=JSON.stringify(ex.prescription||{});
    host.innerHTML=`<h3>自分の動画</h3><p class="hint">このスマホだけに保存します。PT・他の端末へは送信されません。元動画も写真アプリに残してください。サイトデータの削除などで消える場合があります。QR・バックアップ・印刷には含まれません。</p>
      <button type="button" class="btn btn-out" id="pv-choose">自分の動画を追加・差し替え</button><button type="button" class="btn btn-out" id="pv-capture">このスマホで撮影</button>
      <input id="pv-file" type="file" accept="video/*" hidden><input id="pv-camera" type="file" accept="video/*" capture="environment" hidden>
      <p class="hint">100MB以下。撮影画面は端末によって異なります。</p><p id="pv-status" role="status">保存動画を確認しています…</p>
      <video id="pv-player" controls playsinline preload="metadata" hidden style="width:100%;max-height:360px"></video>
      <button type="button" class="btn btn-pri" id="pv-save" hidden>この運動の動画として保存</button>
      <a class="btn btn-out" id="pv-download" hidden>元動画を端末に保存</a>
      <button type="button" class="btn btn-out" id="pv-delete" hidden>この運動の保存動画を削除</button>
      <details><summary>動画の保存について・整理</summary><p class="hint">同じ種目IDの回数変更では動画を保持します。運動を削除して追加し直した場合は、新しい運動として動画を選び直してください。撮影時と左右や負荷が違う場合は現在の指示を優先し、PTに確認してください。</p><button type="button" class="btn btn-out" id="pv-delete-all">この患者の保存動画をすべて削除</button></details>`;
    const q=id=>host.querySelector('#'+id),player=q('pv-player');
    let url=null,file=null,saved=null,busy=true,revision=0;
    const alive=()=>host.isConnected&&S?.patientId===patient&&!storageBlocked;
    const message=text=>{if(alive())q('pv-status').textContent=text;};
    const lock=value=>{busy=value;for(const id of ['pv-choose','pv-capture','pv-save','pv-delete','pv-delete-all'])q(id).disabled=value;};
    const release=()=>{player.pause();player.removeAttribute('src');player.load();if(url)URL.revokeObjectURL(url);url=null;};
    const show=(blob,name)=>{release();file=blob;url=URL.createObjectURL(blob);player.src=url;player.hidden=false;q('pv-download').href=url;q('pv-download').download=name||'exercise-video.mp4';q('pv-download').hidden=false;};
    const observer=new MutationObserver(()=>{if(!alive()){revision++;observer.disconnect();release();}});
    observer.observe(document.body,{childList:true,subtree:true});
    async function load(){
      lock(true);const rev=++revision;
      try{const row=await get(k);if(!alive()||rev!==revision)return;saved=row||null;
        q('pv-save').hidden=true;q('pv-delete').hidden=!saved;
        if(saved){show(saved.blob,saved.name);message(saved.dose!==dose?'保存動画があります。撮影時から指示が変更されています。現在の左右・回数・負荷を確認してください。':'このスマホに保存済みです。');}
        else{release();file=null;player.hidden=true;q('pv-download').hidden=true;message('動画はまだ登録されていません。');}
      }catch{message('動画保存を利用できません。ブラウザの設定・空き容量を確認してください。');}
      finally{if(alive()&&rev===revision)lock(false);}
    }
    const pick=event=>{
      const selected=event.target.files?.[0];event.target.value='';if(!selected||busy||!alive())return;
      if(!valid(selected)){message('100MB以下の動画ファイルを選んでください。');return;}
      revision++;show(selected,selected.name);q('pv-save').hidden=false;q('pv-save').disabled=true;
      message('再生できるか確認しています。まだ保存していません。');
    };
    player.onloadedmetadata=()=>{if(alive()&&!q('pv-save').hidden){q('pv-save').disabled=false;message('動画を確認し、よければ保存を押してください。');}};
    player.onerror=()=>{if(alive()){q('pv-save').disabled=true;message('この動画は再生できません。MP4など別の形式を選んでください。元動画は変更していません。');}};
    q('pv-file').onchange=pick;q('pv-camera').onchange=pick;
    q('pv-choose').onclick=()=>{if(alive()&&!busy)q('pv-file').click();};
    q('pv-capture').onclick=()=>{if(alive()&&!busy)q('pv-camera').click();};
    q('pv-save').onclick=async()=>{
      if(!alive()||busy||!file||q('pv-save').disabled)return;
      lock(true);const row={key:k,patient,blob:file,name:file.name||'exercise-video.mp4',dose,createdAt:new Date().toISOString()};
      try{await put(row);if(!alive())return;saved=row;q('pv-save').hidden=true;q('pv-delete').hidden=false;message('このスマホに保存しました。');}
      catch{message('保存できませんでした。空き容量やブラウザ設定を確認してください。以前の保存動画は残しています。');}
      finally{if(alive())lock(false);}
    };
    q('pv-delete').onclick=async()=>{
      if(!alive()||busy||!confirm('この運動の保存動画を削除しますか？ 写真アプリの元動画は削除しません。'))return;
      lock(true);try{await remove(k);if(alive())await load();}catch{message('削除できませんでした。もう一度お試しください。');}finally{if(alive())lock(false);}
    };
    q('pv-delete-all').onclick=async()=>{
      if(!alive()||busy||!confirm('削除済みの運動も含め、この患者のアプリ内動画をすべて削除しますか？ 元動画は削除しません。'))return;
      lock(true);try{await removePatient(patient);if(alive())await load();}catch{message('削除できませんでした。もう一度お試しください。');}finally{if(alive())lock(false);}
    };
    load();
  }
  return {mount,key,get,put,remove,removePatient,valid};
})();
