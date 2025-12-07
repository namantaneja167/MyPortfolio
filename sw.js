/* ============================================
   Service Worker for Offline Support
   Naman Taneja Portfolio Website
   ============================================ */

const CACHE_NAME = 'naman-portfolio-v1';
const OFFLINE_URL = './offline.html';
const DEBUG = false; // Set to true for development logging

// Conditional logging
const log = (...args) => DEBUG && console.log(...args);

// Assets to cache on install
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/main.js',
    './images/profile.jpg',
    './assets/Naman_Resume.pdf',
    './offline.html',
    // External resources (fonts and icons)
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap',
    'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    log('[ServiceWorker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                log('[ServiceWorker] Caching core assets');
                // Cache what we can, don't fail if some resources are unavailable
                return Promise.allSettled(
                    ASSETS_TO_CACHE.map(url => 
                        cache.add(url).catch(err => {
                            log(`[ServiceWorker] Failed to cache: ${url}`, err);
                        })
                    )
                );
            })
            .then(() => {
                log('[ServiceWorker] Install complete');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    log('[ServiceWorker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => {
                            log(`[ServiceWorker] Deleting old cache: ${name}`);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                log('[ServiceWorker] Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip chrome-extension and other non-http(s) requests
    if (!event.request.url.startsWith('http')) return;
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    // Fetch fresh version in background (stale-while-revalidate)
                    fetchAndCache(event.request);
                    return cachedResponse;
                }
                
                // Not in cache, fetch from network
                return fetchAndCache(event.request)
                    .catch(() => {
                        // Network failed, return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                        // For other requests, just fail
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});

// Helper function to fetch and cache
async function fetchAndCache(request) {
    try {
        const response = await fetch(request);
        
        // Only cache successful responses
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            // Clone response since it can only be read once
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        throw error;
    }
}
