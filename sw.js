// 앱을 수정해서 다시 올릴 때는 아래 버전 문자열을 바꿔야 폰에 새 파일이 반영됩니다.
const V = 'rk-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const own = u.origin === location.origin;
  const font = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!own && !font) return; // 번역 서비스 등 외부 요청은 그대로 통과
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(r);
    const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => null);
    return hit || (await net) || c.match('./index.html');
  }));
});
