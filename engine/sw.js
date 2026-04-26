// ============================================================
//  LONA OS — Service Worker (PWA)
//  Cache-first strategija za offline delovanje
// ============================================================

const CACHE = "lona-os-v1";
const ASSETS = [
  "./login.html",
  "./hub.html",
  "./index.html",
  "./library.html",
  "./profile.html",
  "./style.css",
  "./library.css",
  "./config.js",
  "./engine.js",
  "./engine/gatekeeper.js",
  "./engine/xp.js",
  "./engine/cooldown.js",
  "./engine/joker.js",
  "./engine/actionPrompt.js",
  "./engine/mastery.js",
  "./engine/scholar.js",
  "./engine/season.js",
  "./engine/equipment.js",
  "./engine/season.js",
];

// Namesti — shrani vse v cache
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Aktiviraj — pobriši stare cache
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first, potem network
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
    }).catch(() => caches.match("./index.html"))
  );
});
