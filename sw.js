/* E資格 学習ナビ - Service Worker
   v0.3.2: v0.3拡張とシード移行補助を既存の index.html へ注入する。 */
const CACHE_NAME = "eshikaku-v0.3.2";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./v0.3.js",
  "./v0.3.1.js",
  "./icons/app-icon.svg",
  "./icons/icon-192.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function withV3Extensions(response) {
  let html = await response.text();
  if (!html.includes("./v0.3.js")) {
    html = html.replace("</body>", "<script src=\"./v0.3.js\"></script></body>");
  }
  if (!html.includes("./v0.3.1.js")) {
    html = html.replace("</body>", "<script src=\"./v0.3.1.js\"></script></body>");
  }
  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => withV3Extensions(response))
        .then((response) => {
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", response.clone()));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
