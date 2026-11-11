// FindJob Now V7.2.0 PWA service worker
const V = "fj-v7.2.0";
const BASE = new URL("./", self.location).pathname;
const SHELL = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.webmanifest",
  BASE + "styles.css",
  BASE + "storage.js",
  BASE + "i18n.js",
  BASE + "japan-data.js",
  BASE + "dna-engine.js",
  BASE + "jobs.js",
  BASE + "tools.js",
  BASE + "tracker.js",
  BASE + "app.js",
  BASE + "icon-192.png",
  BASE + "icon-512.png",
  BASE + "apple-touch-icon.png"
];
const PDF = [
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
];
const CDN_HOSTS = new Set(["cdnjs.cloudflare.com"]);

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(V);
    await Promise.all(SHELL.map(async path => {
      try {
        const response = await fetch(path, { cache: "reload" });
        if (response.ok) await cache.put(path, response);
      } catch (_) {}
    }));
    await Promise.all(PDF.map(async url => {
      try {
        const response = await fetch(url, { mode: "no-cors" });
        await cache.put(url, response);
      } catch (_) {}
    }));
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("fj-") && k !== V).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const isNavigation = request.mode === "navigate";

  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(V);
          try { await cache.put(request, response.clone()); } catch (_) {}
        }
        return response;
      } catch (_) {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (isNavigation) {
          const shell = await caches.match(BASE + "index.html") || await caches.match(BASE);
          if (shell) return shell;
        }
        throw _;
      }
    })());
    return;
  }

  if (CDN_HOSTS.has(url.hostname)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response && (response.ok || response.type === "opaque")) {
          const cache = await caches.open(V);
          try { await cache.put(request, response.clone()); } catch (_) {}
        }
        return response;
      } catch (_) {
        return cached || Response.error();
      }
    })());
  }
});
