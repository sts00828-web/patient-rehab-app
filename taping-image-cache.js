/* Public image bytes only. No patient identity, branch, bookmark, or record is persisted. */
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;else root.TapingImageCache=api;})(globalThis,function(root){
 'use strict';
 const CACHE_NAME='p41-public-images-v1';
 function assetIssue(a){
  if(!a||a.reviewStatus!=='verified'||typeof a.image!=='string'||!/^images\/[a-zA-Z0-9_./-]+\.webp$/.test(a.image)||a.image.split('/').some(x=>x==='..'||x==='.'||x===''))return '確認済みの公開工程図だけを保存できます。';
  if(a.sha256!==undefined&&!/^[a-fA-F0-9]{64}$/.test(a.sha256))return '工程図の照合情報が不正です。';
  return '';
 }
 function assetsFor(p,choices,model){
  const issue=model.reviewIssue(p)||model.choicesIssue(p,choices);if(issue)throw Error(issue);
  const assets=new Map();
  for(const s of model.selectedSteps(p,choices)){
   if(s.variantMissing)throw Error('この選択に対応する累積図がありません。');
   for(const key of model.keys(s)){
    const a=p.illustrations[key],bad=assetIssue(a);if(bad)throw Error(bad);
    const prev=assets.get(a.image);if(prev&&String(prev.sha256||'').toLowerCase()!==String(a.sha256||'').toLowerCase())throw Error('同じ工程図の照合情報が一致しません。');
    assets.set(a.image,{image:a.image,reviewStatus:a.reviewStatus,...(a.sha256===undefined?{}:{sha256:a.sha256.toLowerCase()})});
   }
  }
  if(!assets.size)throw Error('保存する工程図がありません。');return [...assets.values()];
 }
 const aborted=signal=>{if(signal?.aborted)throw new DOMException('中断しました。','AbortError');};
 async function decodeBrowser(blob){
  if(root.createImageBitmap){const bitmap=await root.createImageBitmap(blob);try{if(!bitmap.width||!bitmap.height)throw Error('空の工程図です。');}finally{bitmap.close();}return;}
  const url=root.URL.createObjectURL(blob);try{const img=new root.Image();img.src=url;await img.decode();if(!img.naturalWidth)throw Error('空の工程図です。');}finally{root.URL.revokeObjectURL(url);}
 }
 function create(options={}){
  const storage=options.storage||root.caches,fetcher=options.fetch||root.fetch?.bind(root),crypto=options.crypto||root.crypto,decode=options.decode||decodeBrowser,base=options.baseURL||root.location?.href;
  const supported=()=>!!storage&&!!fetcher&&!!base;
  function urlFor(a){const bad=assetIssue(a);if(bad)throw Error(bad);const url=new URL(a.image,base);if(url.origin!==new URL(base).origin||!/^https?:$/.test(url.protocol))throw Error('同じサイトの公開画像だけを保存できます。');return url.href;}
  async function verify(response,a,signal){
   aborted(signal);if(!response?.ok||response.type==='opaque')throw Error('工程図を取得できません。');
   const bytes=await response.arrayBuffer();aborted(signal);const b=new Uint8Array(bytes);
   if(b.length<12||b.length>50*1024*1024||String.fromCharCode(...b.slice(0,4))!=='RIFF'||String.fromCharCode(...b.slice(8,12))!=='WEBP')throw Error('工程図の形式が不正です。');
   if(a.sha256){if(!crypto?.subtle)throw Error('工程図の照合を実行できません。');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');if(hash!==a.sha256.toLowerCase())throw Error('工程図の照合が一致しません。');}
   const blob=new Blob([bytes],{type:'image/webp'});await decode(blob);aborted(signal);return blob;
  }
  async function cache(){if(!supported())throw Error('この端末では工程図を保存できません。');return storage.open(CACHE_NAME);}
  async function cached(a,{signal}={}){
   const url=urlFor(a);if(!supported())return null;const c=await cache();aborted(signal);const response=await c.match(url);if(!response)return null;
   try{return await verify(response,a,signal);}catch(e){if(e.name!=='AbortError')await c.delete(url);throw e;}
  }
  async function status(assets,{signal}={}){
   let present=0;for(const a of assets){aborted(signal);if(await cached(a,{signal}))present++;}
   return {complete:assets.length>0&&present===assets.length,present,total:assets.length};
  }
  async function save(assets,{signal,onProgress}={}){
   if(!Array.isArray(assets)||!assets.length)throw Error('保存する工程図がありません。');
   // Validate the entire set before the first write. Entries never contain application state.
   for(const a of assets)urlFor(a);const c=await cache();let count=0;
   for(const a of assets){
    aborted(signal);let blob=await cached(a,{signal});
    if(!blob){const response=await fetcher(urlFor(a),{credentials:'omit',mode:'same-origin',redirect:'error',cache:'no-store',signal});blob=await verify(response,a,signal);aborted(signal);await c.put(urlFor(a),new Response(blob,{headers:{'Content-Type':'image/webp'}}));}
    aborted(signal);onProgress?.({present:++count,total:assets.length});
   }
   const result=await status(assets,{signal});aborted(signal);if(!result.complete)throw Error('一部の工程図が保存されていません。');return result;
  }
  return {supported,cached,status,save};
 }
 return {CACHE_NAME,assetIssue,assetsFor,create};
});
