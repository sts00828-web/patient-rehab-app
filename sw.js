// Cache only this application's public assets, never settings URLs or other apps.
importScripts('./exercises.js');
importScripts('./clinical-catalog.js');
const PREFIX = 'patient-rehab-' + encodeURIComponent(self.registration.scope) + '-';
const PROTOCOL_FILE = './taping-protocol.66ccd3791669d8a5c99dbc6ae8cf150b98734507b40139f11643a80a551b2b87.js';
const PROTOCOL_SHA256 = '66ccd3791669d8a5c99dbc6ae8cf150b98734507b40139f11643a80a551b2b87';
const PROTOCOL_CACHE_PREFIX = PREFIX + 'public-protocol-';
const CACHE = PREFIX + 'v87' + '-taping-ui3-' + PROTOCOL_SHA256;
const IMAGE_CACHE = PREFIX + 'clinical-images-v2';
const IMAGE_URLS = new Set(Object.values(ClinicalCatalog.definitions).filter(d=>d.image).map(d=>new URL(d.image,self.registration.scope).href));
const REFRESHED_IMAGE_URLS = ['./images/P20.webp','./images/P23.webp','./images/E08.webp','./images/N12.webp','./images/P08.webp','./images/T20.webp','./images/P15.webp','./images/P26.webp','./images/P35.webp','./images/P37.webp','./images/P38.webp','./images/P39.webp'].map(path=>new URL(path,self.registration.scope).href);
const FILES = [PROTOCOL_FILE,'./taping-guide-model.js','./taping-image-cache.js','./taping-guide.js','./taping-guide.css','./','./index.html','./manifest.json','./clinical-catalog.js','./clinical-rules.js','./clinical-ui.js','./clinical-review.html','./core.js','./exercises.js','./prescription-defaults.js','./disease-library.js','./exercise-selection.js','./ui.js','./app-v2.js','./bug-report.js','./exercise-print.js','./exercise-video.js','./patient-video.js','./clinical-evidence.js','./exercise-evidence.js','./app-v2.css',
  './icon-180.png','./icon-192.png','./icon-512.png',
  './vendor/lz-string.min.js','./vendor/qrcode.min.js','./vendor/html5-qrcode.min.js',
  ...Object.values(EXERCISE_LIBRARY).map(e=>'./assets/exercises/'+e.image)];
const ALLOWED = new Set(FILES.map(f=>new URL(f,self.registration.scope).href));

async function verifiedProtocol(response,digest){if(!response||!response.ok)throw Error('Protocol response unavailable');const bytes=await response.clone().arrayBuffer(),actual=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');if(actual!==digest)throw Error('Protocol digest mismatch');return response;}
async function protocolHTMLMatches(response){if(!response?.ok)return false;const text=await response.clone().text(),tags=text.match(/<script\b[^>]*\bsrc=["']taping-protocol\.[a-f0-9]{64}\.js["'][^>]*>/gi)||[],integrity='sha256-'+btoa(String.fromCharCode(...PROTOCOL_SHA256.match(/../g).map(x=>parseInt(x,16))));return tags.length===1&&tags[0].includes('src="'+PROTOCOL_FILE.slice(2)+'"')&&tags[0].includes('integrity="'+integrity+'"');}
async function installProtocol(){const name=PROTOCOL_CACHE_PREFIX+PROTOCOL_SHA256,existed=await caches.has(name);try{const response=await verifiedProtocol(await fetch(PROTOCOL_FILE,{cache:'force-cache'}),PROTOCOL_SHA256);await(await caches.open(name)).put(new URL(PROTOCOL_FILE,self.registration.scope).href,response);}catch(e){if(!existed)await caches.delete(name);throw e;}}
function protocolDigest(url){const m=url.pathname.match(/\/taping-protocol\.([a-f0-9]{64})\.js$/);return m&&!url.search&&!url.hash&&url.href===new URL('./taping-protocol.'+m[1]+'.js',self.registration.scope).href?m[1]:null;}
async function protocolResponse(request,digest){const name=PROTOCOL_CACHE_PREFIX+digest;try{if(await caches.has(name)){const cache=await caches.open(name),stored=await cache.match(request.url);if(stored){try{return await verifiedProtocol(stored,digest);}catch{await cache.delete(request.url);}}}const response=await verifiedProtocol(await fetch(request,{cache:'reload'}),digest);if(digest===PROTOCOL_SHA256)await(await caches.open(name)).put(request.url,response.clone());return response;}catch{return new Response('工程データを確認できません。オンラインで更新を確認してください。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}}

self.addEventListener('install',e=>e.waitUntil((async()=>{
  const protocolExisted=await caches.has(PROTOCOL_CACHE_PREFIX+PROTOCOL_SHA256);
  try{
    await installProtocol();await (await caches.open(CACHE)).addAll(FILES.filter(f=>f!==PROTOCOL_FILE));for(const file of ['./','./index.html'])if(!await protocolHTMLMatches(await(await caches.open(CACHE)).match(new URL(file,self.registration.scope).href)))throw Error('HTML/protocol version mismatch');
    const images=await caches.open(IMAGE_CACHE);
    for(const url of REFRESHED_IMAGE_URLS){const response=await fetch(url,{cache:'reload'});if(!response.ok)throw Error('更新画像を取得できません');await images.put(url,response);}
    await self.skipWaiting();
  }catch(e){await caches.delete(CACHE);if(!protocolExisted)await caches.delete(PROTOCOL_CACHE_PREFIX+PROTOCOL_SHA256);throw e;}
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE&&k!==IMAGE_CACHE&&!k.startsWith(PROTOCOL_CACHE_PREFIX)).map(k=>caches.delete(k)));
  // Earlier releases cached settings URLs. Remove only this app's entries.
  for(const key of keys.filter(k=>/^rehab-v\d+$/.test(k))){
    const old=await caches.open(key);
    for(const request of await old.keys())if(request.url.startsWith(self.registration.scope))await old.delete(request);
  }
  await self.clients.claim();
})()));
self.addEventListener('message',e=>{
  if(e.data==='skipWaiting')self.skipWaiting();
  if(e.data?.type==='cache-selected-images')e.waitUntil((async()=>{
    const cache=await caches.open(IMAGE_CACHE),failed=[];
    const urls=[...new Set((e.data.paths||[]).slice(0,60).map(p=>new URL(p,self.registration.scope).href))].filter(u=>IMAGE_URLS.has(u));
    for(const url of urls){try{if(!await cache.match(url)){const response=await fetch(url);if(!response.ok)throw Error();await cache.put(url,response);}}catch{failed.push(url);}}
    e.ports[0]?.postMessage({total:urls.length,failed:failed.length});
  })());
});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(e.request.method!=='GET'||url.origin!==self.location.origin)return;
  const digest=protocolDigest(url);if(digest){e.respondWith(protocolResponse(e.request,digest));return;}if(/\/taping-protocol\.[a-f0-9]{64}\.js$/.test(url.pathname))return;url.search='';url.hash='';if(!ALLOWED.has(url.href)&&!IMAGE_URLS.has(url.href))return;
  e.respondWith((async()=>{
    const cache=await caches.open(IMAGE_URLS.has(url.href)?IMAGE_CACHE:CACHE);
    if(IMAGE_URLS.has(url.href)){const stored=await cache.match(url.href);if(stored)return stored;}
    try{
      const response=await fetch(e.request);
      const isHTML=url.href===new URL('./',self.registration.scope).href||url.href===new URL('./index.html',self.registration.scope).href;
      if(response.ok && !new URL(e.request.url).search&&(!isHTML||await protocolHTMLMatches(response))){try{await cache.put(url.href,response.clone());}catch{/* Capacity failure must not discard a successful response. */}}
      return response;
    }catch{
      return await cache.match(url.href) || new Response('オフライン用データがありません。オンラインで一度開いてください。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});
