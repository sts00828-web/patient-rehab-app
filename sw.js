// Cache only this application's public assets, never settings URLs or other apps.
importScripts('./exercises.js');
importScripts('./clinical-catalog.js');
const PREFIX = 'patient-rehab-' + encodeURIComponent(self.registration.scope) + '-';
const CACHE = PREFIX + 'v77';
const IMAGE_CACHE = PREFIX + 'clinical-images-v2';
const IMAGE_URLS = new Set(Object.values(ClinicalCatalog.definitions).filter(d=>d.image).map(d=>new URL(d.image,self.registration.scope).href));
const REFRESHED_IMAGE_URLS = ['./images/P20.webp','./images/P23.webp','./images/E08.webp','./images/N12.webp','./images/P08.webp','./images/T20.webp','./images/P15.webp','./images/P26.webp'].map(path=>new URL(path,self.registration.scope).href);
const FILES = ['./','./index.html','./manifest.json','./clinical-catalog.js','./clinical-rules.js','./clinical-ui.js','./clinical-review.html','./core.js','./exercises.js','./prescription-defaults.js','./disease-library.js','./exercise-selection.js','./ui.js','./app-v2.js','./bug-report.js','./exercise-print.js','./exercise-video.js','./patient-video.js','./clinical-evidence.js','./exercise-evidence.js','./app-v2.css',
  './icon-180.png','./icon-192.png','./icon-512.png',
  './vendor/lz-string.min.js','./vendor/qrcode.min.js','./vendor/html5-qrcode.min.js',
  ...Object.values(EXERCISE_LIBRARY).map(e=>'./assets/exercises/'+e.image)];
const ALLOWED = new Set(FILES.map(f=>new URL(f,self.registration.scope).href));
self.addEventListener('install',e=>e.waitUntil((async()=>{
  await (await caches.open(CACHE)).addAll(FILES);
  const images=await caches.open(IMAGE_CACHE);
  for(const url of REFRESHED_IMAGE_URLS){const response=await fetch(url,{cache:'reload'});if(!response.ok)throw Error('更新画像を取得できません');await images.put(url,response);}
  await self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE&&k!==IMAGE_CACHE).map(k=>caches.delete(k)));
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
  url.search='';url.hash='';if(!ALLOWED.has(url.href)&&!IMAGE_URLS.has(url.href))return;
  e.respondWith((async()=>{
    const cache=await caches.open(IMAGE_URLS.has(url.href)?IMAGE_CACHE:CACHE);
    if(IMAGE_URLS.has(url.href)){const stored=await cache.match(url.href);if(stored)return stored;}
    try{
      const response=await fetch(e.request);
      if(response.ok && !new URL(e.request.url).search){try{await cache.put(url.href,response.clone());}catch{/* Capacity failure must not discard a successful response. */}}
      return response;
    }catch{
      return await cache.match(url.href) || new Response('オフライン用データがありません。オンラインで一度開いてください。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});
