/* Local video preview. No upload or automatic attachment to a prescription. */
const ExerciseVideo = (() => {
  let current=null;
  function dispose(){
    if(!current)return;
    current.observer.disconnect();
    current.player.pause();current.player.removeAttribute('src');current.player.load();
    if(current.url)URL.revokeObjectURL(current.url);
    current=null;
  }
  function mount(){
    dispose();
    const host=document.getElementById('exercise-video-tools');
    if(!host)return;
    host.innerHTML=`<div class="video-actions"><button type="button" class="btn btn-out" id="video-choose">動画を選ぶ</button><button type="button" class="btn btn-out" id="video-capture">スマホで動画撮影</button></div>
      <input type="file" accept="video/*" id="video-file" hidden>
      <input type="file" accept="video/*" capture="environment" id="video-camera" hidden>
      <p class="hint">撮影画面は端末によって異なります。パソコンなどではファイル選択が開くことがあります。</p>
      <p id="video-local-status" role="status"></p>
      <div id="video-local-preview" hidden><video id="video-local-player" controls playsinline preload="metadata" style="width:100%;max-height:300px"></video><div class="video-actions"><a id="video-download" class="btn btn-out">動画を端末に保存</a><button type="button" class="btn btn-out" id="video-clear">プレビューを取り消す</button></div></div>
      <p class="hint">ここで選んだ動画はプレビューのみです。処方・患者用QRにはまだ付きません。必要な動画は端末に保存してください。患者さんのスマホで残すには、そのスマホの患者画面で「自分の動画」を追加してください。</p>`;
    const q=id=>host.querySelector('#'+id);
    const state={host,player:q('video-local-player'),url:null};current=state;
    const clear=()=>{
      state.player.pause();state.player.removeAttribute('src');state.player.load();
      if(state.url)URL.revokeObjectURL(state.url);state.url=null;
      q('video-download').removeAttribute('href');q('video-local-preview').hidden=true;
      q('video-local-status').textContent='';
    };
    const pick=event=>{
      if(!requireStaff())return;
      const file=event.target.files?.[0];event.target.value='';if(!file)return;
      if(!(file.type.startsWith('video/')||(!file.type&&/\.(mp4|mov|m4v|webm|3gp)$/i.test(file.name)))){q('video-local-status').textContent='動画ファイルを選んでください。';return;}
      if(!file.size||file.size>100*1024*1024){q('video-local-status').textContent='0バイトより大きく、100MB以下の動画を選んでください。';return;}
      clear();state.url=URL.createObjectURL(file);state.player.src=state.url;
      q('video-download').href=state.url;q('video-download').download=file.name||'exercise-video.mp4';
      q('video-local-preview').hidden=false;q('video-local-status').textContent='プレビュー：'+file.name+'（処方には未登録）';
    };
    q('video-file').onchange=pick;q('video-camera').onchange=pick;
    q('video-choose').onclick=()=>{if(requireStaff())q('video-file').click();};
    q('video-capture').onclick=()=>{if(requireStaff())q('video-camera').click();};
    q('video-clear').onclick=()=>{if(requireStaff())clear();};
    state.player.onerror=()=>{if(state.url)q('video-local-status').textContent='このブラウザで再生できない形式です。別の動画を選ぶか、端末に保存して確認してください。';};
    state.observer=new MutationObserver(()=>{if(!host.isConnected&&current===state)dispose();});
    state.observer.observe(document.body,{childList:true,subtree:true});
  }
  return {mount,dispose};
})();
