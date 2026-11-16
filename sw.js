const scope = new URL(self.registration.scope);
const cacheName = "hengji-pages:" + scope.pathname + ":820e902fd299";
const assets = new Set(["./","index.html","manifest.webmanifest","icon.svg","apple-touch-icon.png","icon-192.png","icon-512.png","index-B2Ph6r6z.css","index-piQHGebx.js"].map((file) => new URL(file, scope).href));

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    try {
      await cache.addAll([...assets].map((url) => new Request(url, { cache: "reload" })));
    } catch (error) {
      await caches.delete(cacheName);
      throw error;
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const prefix = "hengji-pages:" + scope.pathname + ":";
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(prefix) && key !== cacheName).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== scope.origin) return;

  if (request.mode === "navigate" && (url.pathname === scope.pathname || url.pathname === scope.pathname + "index.html")) {
    event.respondWith((async () => {
      const cache = await caches.open(cacheName);
      return (await cache.match(scope.href)) || fetch(request);
    })());
  } else if (assets.has(url.href)) {
    event.respondWith((async () => {
      const cache = await caches.open(cacheName);
      return (await cache.match(request)) || fetch(request);
    })());
  }
});
