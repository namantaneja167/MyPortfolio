/**
 * Service Worker - Portfolio Website
 * Implements Cache-First for static assets and Stale-While-Revalidate 
 * for dynamic content (RSS feed, external assets)
 */

const CACHE_NAME = 'portfolio-v2';
const STATIC_CACHE = 'portfolio-static-v2';
const DYNAMIC_CACHE = 'portfolio-dynamic-v2';

// Static assets - Cache First strategy
const STATIC_ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/StateManager.js',
    './js/ChatService.js',
    './js/data.js',
    './js/main.js',
    './images/profile.jpg',
    './assets/Naman_Resume.pdf'
];

// External assets - Stale While Revalidate strategy
const SWR_URL_PATTERNS = [
    'https://unpkg.com/boxicons',      // Boxicons CSS and fonts
    'https://unpkg.com/aos',           // AOS library
    'https://api.rss2json.com',        // Medium RSS feed
    'https://fonts.googleapis.com',    // Google Fonts CSS
    'https://fonts.gstatic.com'        // Google Fonts files
];

// Install event - cache static assets
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(function (cache) {
                console.log('SW: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(function () {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys()
            .then(function (cacheNames) {
                return Promise.all(
                    cacheNames
                        .filter(function (cacheName) {
                            return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
                        })
                        .map(function (cacheName) {
                            console.log('SW: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(function () {
                return self.clients.claim();
            })
    );
});

// Fetch event - route requests to appropriate strategy
self.addEventListener('fetch', function (event) {
    var request = event.request;
    var url = request.url;

    // Only handle GET requests
    if (request.method !== 'GET') return;

    // Check if URL matches SWR patterns
    var isSWR = SWR_URL_PATTERNS.some(function (pattern) {
        return url.includes(pattern);
    });

    if (isSWR) {
        // Stale-While-Revalidate for external assets and RSS
        event.respondWith(staleWhileRevalidate(request));
    } else {
        // Cache-First for static assets
        event.respondWith(cacheFirst(request));
    }
});

/**
 * Cache-First Strategy
 * Returns cached response immediately, falls back to network
 */
function cacheFirst(request) {
    return caches.match(request)
        .then(function (cachedResponse) {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(request)
                .then(function (networkResponse) {
                    // Cache successful responses
                    if (networkResponse && networkResponse.status === 200) {
                        var responseClone = networkResponse.clone();
                        caches.open(STATIC_CACHE)
                            .then(function (cache) {
                                cache.put(request, responseClone);
                            });
                    }
                    return networkResponse;
                })
                .catch(function (error) {
                    console.log('SW: Network error for:', request.url);
                    // Return offline fallback if available
                    return caches.match('./index.html');
                });
        });
}

/**
 * Stale-While-Revalidate Strategy
 * Returns cached response immediately while fetching update in background
 * Best for RSS feeds and external assets that should stay fresh
 */
function staleWhileRevalidate(request) {
    return caches.open(DYNAMIC_CACHE)
        .then(function (cache) {
            return cache.match(request)
                .then(function (cachedResponse) {
                    // Fetch from network in background
                    var fetchPromise = fetch(request)
                        .then(function (networkResponse) {
                            // Update cache with new response
                            if (networkResponse && networkResponse.status === 200) {
                                cache.put(request, networkResponse.clone());
                            }
                            return networkResponse;
                        })
                        .catch(function (error) {
                            console.log('SW: SWR network error for:', request.url);
                            return cachedResponse; // Return stale on network failure
                        });

                    // Return cached response immediately, or wait for network
                    return cachedResponse || fetchPromise;
                });
        });
}
