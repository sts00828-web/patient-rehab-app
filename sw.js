// Cache only this application's public assets, never settings URLs or other apps.
importScripts('./exercises.js');
const PREFIX = 'patient-rehab-' + encodeURIComponent(self.registration.scope) + '-';
const CACHE = PREFIX + 'v27';
const FILES = ['./','./index.html','./manifest.json','./core.js','./exercises.js','./disease-library.js','./exercise-selection.js','./ui.js','./app-v2.js','./app-v2.css',
  './icon-180.png','./icon-192.png','./icon-512.png',
  './vendor/lz-string.min.js','./vendor/qrcode.min.js','./vendor/html5-qrcode.min.js',
  ...Object.values(EXERCISE_LIBRARY).map(e=>'./assets/exercises/'+e.image)];
const ALLOWED = new Set(FILES.map(f=>new URL(f,self.registration.scope).href));
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)));
  // Earlier releases cached settings URLs. Remove only this app's entries.
  for(const key of keys.filter(k=>/^rehab-v\d+$/.test(k))){
    const old=await caches.open(key);
    for(const request of await old.keys())if(request.url.startsWith(self.registration.scope))await old.delete(request);
  }
  await self.clients.claim();
})()));
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting();});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(e.request.method!=='GET'||url.origin!==self.location.origin)return;
  url.search='';url.hash='';if(!ALLOWED.has(url.href))return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const response=await fetch(e.request);
      if(response.ok && !new URL(e.request.url).search)await cache.put(url.href,response.clone());
      return response;
    }catch{
      return await cache.match(url.href) || new Response('オフライン用データがありません。オンラインで一度開いてください。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});
