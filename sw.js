const CACHE_NAME = 'focus-arena-v2';

// The asset list to freeze into the device storage engine for offline access
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './manifest.json',
    './images/focus-icon.jpeg',
    // Include your specific audio stream assets below so they load offline:
    './audio/white-noise.wav',
    './audio/rain.wav',
    './audio/coffee-pack-textures.wav'
];

// 1. INSTALLATION PHASE: Allocate cache pool and save asset files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Focus Arena: Securely caching runtime assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. ACTIVATION PHASE: Clear away old cache layers if versioning increments
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Focus Arena: Purging deprecated cache fragments...', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. FETCH STRATEGY: Cache First, Network Fallback (Ensures instant app loading)
self.addEventListener('fetch', (event) => {
    // Guard clause: Skip cross-origin or non-GET requests (like local storage syncing)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse; // Return the fast, local cached copy instantly
                }

                return fetch(event.request).then((networkResponse) => {
                    // Check if we received a valid, cacheable response stream
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    // Clone response before saving since data streams can only be read once
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                });
            }).catch(() => {
                // Offline fallback logic if network fails and resource isn't cached
                console.log('Asset request failed. Device is currently fully disconnected.');
            })
    );
});