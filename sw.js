// کارکردِ بی‌اینترنت: همه‌چیز در حافظه‌ی گوشی می‌ماند
// هر بار فایلی را عوض کردی، این شماره را یکی بالا ببر
const VERSION = 'fanoos-v6';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'js/app.js', 'js/bus.js', 'js/calendar.js', 'js/care.js', 'js/copy.js', 'js/gift.js', 'js/glyphs.js', 'js/ics.js', 'js/mascot.js',
  'js/jalali.js', 'js/settings.js', 'js/store.js', 'js/swaps.js', 'js/today.js', 'js/ui.js',
  'fonts/DanaFaNum-Regular.woff2', 'fonts/DanaFaNum-Medium.woff2', 'fonts/DanaFaNum-DemiBold.woff2',
  'fonts/DanaFaNum-Bold.woff2', 'fonts/DanaFaNum-ExtraBold.woff2',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// اول از حافظه، و در پس‌زمینه نسخه‌ی تازه را بگیر
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const hit = await cache.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((cs) => (cs[0] ? cs[0].focus() : self.clients.openWindow('./'))));
});
