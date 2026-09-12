import type { Plugin } from "vite";

/** Generate a precache from the actual output filenames, including hashed assets. */
export function offlinePlugin(): Plugin {
  return {
    name: "car-sound-offline",
    apply: "build",
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle).filter((name) => !name.endsWith(".map"));
      const version = files.join("|");
      const assets = ["./", "./manifest.webmanifest", "./icons/icon.svg", ...files.map((file) => `./${file}`)];
      this.emitFile({ type: "asset", fileName: "service-worker.js", source: `
const CACHE = 'car-sound-' + ${JSON.stringify(version)};
const ASSETS = ${JSON.stringify(assets)};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) if (key.startsWith('car-sound-') && key !== CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request);
    if (cached) return cached;
    try { return await fetch(event.request); }
    catch (error) { if (event.request.mode === 'navigate') return await cache.match('./'); throw error; }
  })());
});` });
    },
  };
}
