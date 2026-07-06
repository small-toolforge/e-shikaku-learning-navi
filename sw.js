/* E資格 学習ナビ - Service Worker v0.3.4 */
const CACHE_NAME = "eshikaku-v0.3.4";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/v0.3/styles.css",
  "./assets/v0.3/app-1.js",
  "./assets/v0.3/app-2.js",
  "./assets/v0.3/app-3.js",
  "./assets/v0.3/app-4.js",
  "./assets/v0.3/app-5.js",
  "./icons/app-icon.svg",
  "./icons/icon-192.png",
  "./icons/apple-touch-icon.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
      return response;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(request).then(hit => hit || fetch(request).then(response => {
    if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
    return response;
  })));
});
