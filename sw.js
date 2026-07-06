/* E資格 学習ナビ - Service Worker
   =================================================
   更新ルール(README参照):
   index.html / manifest / icons を変更したら、
   下の CACHE_NAME の末尾バージョンを必ず上げること。
   例: eshikaku-v0.2.0 → eshikaku-v0.2.1
   ================================================= */
const CACHE_NAME = "eshikaku-v0.2.1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/app-icon.svg",
  "./icons/icon-192.png",
  "./icons/apple-touch-icon.png"
];

/* インストール: 一式を先読みし、待機せず即座に新版へ */
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

/* 有効化: CACHE_NAME が異なる古いキャッシュをすべて削除 */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 取得:
   - ページ本体(navigate)はネットワーク優先。オフライン時のみキャッシュ。
     → 古い index.html が残り続けることを防ぐ
   - その他の同一オリジンGETはキャッシュ優先+取得時に更新 */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
