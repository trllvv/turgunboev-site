// Turgunboev site: works on slow internet and offline.
// Pages: fresh from the network, saved copy if the network is slow or gone.
// Photos, fonts, scripts: served instantly from the saved copy; each deploy starts a fresh copy.
const V='tb-__BUILD__',CORE=['/','/offline','/js/lenis.min.js','/img/hero.webp',
'/fonts/anton-latin-400-normal.woff2','/fonts/inter-latin-300-normal.woff2','/fonts/inter-latin-400-normal.woff2',
'/fonts/inter-latin-500-normal.woff2','/fonts/inter-latin-600-normal.woff2','/apple-touch-icon.png','/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const timeout=(p,ms)=>new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('slow')),ms);p.then(v=>{clearTimeout(t);res(v)},e=>{clearTimeout(t);rej(e)});});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(r.mode==='navigate'){
    const home=u.pathname==='/'||u.pathname==='/index.html';
    const net=fetch(r).then(res=>{if(res.ok&&home){const cp=res.clone();caches.open(V).then(c=>c.put('/',cp));}return res;});
    e.respondWith(timeout(net,4500).catch(()=>(home?caches.match('/'):Promise.resolve()).then(m=>m||net).catch(()=>caches.match('/offline'))));
    e.waitUntil(net.catch(()=>{}));return;
  }
  if(/^\/(img|fonts|js)\//.test(u.pathname)||/\.(png|webp|jpg|woff2)$/.test(u.pathname)){
    e.respondWith(caches.open(V).then(c=>c.match(r).then(hit=>{
      if(hit)return hit;
      return fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res;});
    })));
  }
});
