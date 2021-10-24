const cacheName = "app-cache";
const cacheAssets = [
  "/",
  "/_joystick/index.css",
  "/_joystick/index.client.js",
  "/_joystick/utils/process.js",
  "/_joystick/hmr/client.js",
  "/favicon.ico",
  "/apple-touch-icon-152x152.png",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      cache.addAll(cacheAssets).then(() => {
        self.skipWaiting();
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      cacheNames.map((cache) => {
        if (cache !== cacheName) {
          return caches.delete(cache);
        }
      });
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
