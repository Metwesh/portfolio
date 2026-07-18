// Minimal runtime-caching service worker (hand-rolled — no Workbox/vite-plugin-pwa).
// Strategy: network-first for navigations (never serve a stale index.html
// indefinitely after a deploy), stale-while-revalidate for same-origin static
// assets (Vite content-hashes JS/CSS/most assets, so caching them is safe —
// a new deploy always produces new filenames). Cross-origin requests (fonts,
// analytics) are left untouched.

const VERSION = "v1";
const RUNTIME_CACHE = `portfolio-runtime-${VERSION}`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(RUNTIME_CACHE)
      .then((cache) => cache.add(self.registration.scope).catch(() => {})),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const shellUrl = self.registration.scope;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(shellUrl, copy));
          return response;
        })
        .catch(async () => {
          const cachedShell = await caches.match(shellUrl);
          return cachedShell || caches.match(request);
        }),
    );
    return;
  }

  event.respondWith(
    caches.open(RUNTIME_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    }),
  );
});
