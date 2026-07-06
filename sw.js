/* E資格 学習ナビ - Service Worker v0.3.7
   方針: オンライン時は常にネットワーク優先。
   オフライン時だけキャッシュへ戻る。これによりHTMLと分割JSの世代混在を防ぐ。 */
const CACHE_NAME = "eshikaku-v0.3.7";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/v0.3/styles.css?v=0.3.7",
  "./assets/v0.3/app-1.js?v=0.3.7",
  "./assets/v0.3/app-2.js?v=0.3.7",
  "./assets/v0.3/app-3.js?v=0.3.7",
  "./assets/v0.3/app-4.js?v=0.3.7",
  "./assets/v0.3/app-5.js?v=0.3.7",
  "./assets/v0.3/lab-guard.js?v=0.3.7",
  "./icons/app-icon.svg",
  "./icons/icon-192.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => {
        if (request.mode === "navigate") return caches.match("./index.html");
        return caches.match(request);
      })
  );
});
