// FindJob Now V.118 PWA service worker.
// Caches the app shell and PDF.js for best-effort offline loading. Live job searches need internet.
const V = "fj-v218";
// Works at the domain root (Cloudflare) and in a sub-folder (GitHub Pages: /findjobnow/)
const BASE = new URL("./", self.location).pathname;
const SHELL = [BASE, BASE + "index.html", BASE + "manifest.webmanifest", BASE + "icon-192.png", BASE + "icon-512.png", BASE + "apple-touch-icon.png"];
const PDF = [
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
];
const CDN_HOSTS = new Set(["cdnjs.cloudflare.com", "cdn.jsdelivr.net"]);

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(V);
    await Promise.all(SHELL.map(async path => {
      try { const response = await fetch(path, { cache: "reload" }); if (response.ok) await cache.put(path, response); } catch (_) {}
    }));
    await Promise.all(PDF.map(async url => {
      try { const response = await fetch(url, { mode: "no-cors" }); await cache.put(url, response); } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
  event.waitUntil((async () => {
    // Delete only this app's old caches; do not clear unrelated apps on the same origin.
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("fj-") && key !== V).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const isNavigation = request.mode === "navigate";

  if (url.origin === self.location.origin) {
    // Do not intercept API or non-GET actions.
    if (url.pathname.startsWith(BASE + "api/")) return;
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(V);
          if (isNavigation) await cache.put(BASE, response.clone());
          else if (SHELL.includes(url.pathname)) await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        const cache = await caches.open(V);
        if (isNavigation) return (await cache.match(BASE)) || (await cache.match(BASE + "index.html")) || Response.error();
        return (await cache.match(request)) || Response.error();
      }
    })());
    return;
  }

  if (CDN_HOSTS.has(url.hostname)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response && (response.ok || response.type === "opaque")) {
        const cache = await caches.open(V);
        await cache.put(request, response.clone());
      }
      return response;
    })());
  }
});
