/* ============================================ */
/* FILE: service-worker.js                      */
/* PURPOSE: PWA Service Worker                  */
/* Provides offline support & push notifications */
/* AUTHOR: KachaBazar Team                      */
/* VERSION: 1.0.0                               */
/* LAST UPDATED: 2026-05-05                     */
/* ============================================ */

// ============================================
// CONSTANTS
// ============================================

/* Cache name - Change version to force update */
const CACHE_NAME = 'kachabazar-v1.0.0';

/* Offline page URL - shown when no internet */
const OFFLINE_URL = '/offline.html';

/* Assets to cache on install - Critical files */
const STATIC_CACHE_URLS = [
  '/',                           // Homepage
  '/index.html',                 // Main HTML
  '/manifest.json',              // PWA manifest
  '/css/style.css',              // Main styles
  '/css/font.css',               // Font styles
  '/js/main.js',                 // Main JS
  '/js/api.js',                  // API calls
  '/js/auth.js',                 // Authentication
  '/js/cart.js',                 // Cart logic
  '/pages/login.html',           // Login page
  '/pages/dashboard.html',       // Dashboard
  '/pages/products.html',        // Products page
  /* App Icons - Various sizes for different devices */
  '/assets/icons/icon-72x72.png',
  '/assets/icons/icon-96x96.png',
  '/assets/icons/icon-128x128.png',
  '/assets/icons/icon-144x144.png',
  '/assets/icons/icon-152x152.png',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-384x384.png',
  '/assets/icons/icon-512x512.png'
];

// ============================================
// INSTALL EVENT
// Fired when service worker is first installed
// ============================================

self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing...');
  
  /* Wait until all assets are cached */
  event.waitUntil(
    /* Open the cache */
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching static assets');
        /* Add all static assets to cache */
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[ServiceWorker] Skip waiting');
        /* Force activation - don't wait for old service worker to stop */
        return self.skipWaiting();
      })
  );
});

// ============================================
// ACTIVATE EVENT
// Fired when service worker becomes active
// ============================================

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating...');
  
  /* Clean up old caches */
  event.waitUntil(
    /* Get all cache keys */
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        /* If cache key is not current version, delete it */
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  
  /* Take control of all clients immediately */
  return self.clients.claim();
});

// ============================================
// FETCH EVENT
// Intercepts all network requests
// Serves from cache if available, else network
// ============================================

self.addEventListener('fetch', event => {
  /* Skip cross-origin requests (external APIs, images, etc.) */
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  /* Skip non-GET requests (POST, PUT, DELETE, etc.) */
  if (event.request.method !== 'GET') {
    return;
  }
  
  /* Skip API calls - let them go to network */
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  /* Handle the request */
  event.respondWith(
    /* Try to serve from cache first */
    caches.match(event.request)
      .then(cachedResponse => {
        /* If found in cache, return cached version */
        if (cachedResponse) {
          return cachedResponse;
        }
        
        /* Otherwise fetch from network */
        return fetch(event.request)
          .then(response => {
            /* Don't cache invalid responses */
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            /* Clone response - can only be consumed once */
            const responseToCache = response.clone();
            
            /* Cache the fetched resource */
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            /* If offline and request is for HTML page, show offline page */
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// ============================================
// BACKGROUND SYNC EVENT
// Syncs offline orders when connection is back
// ============================================

self.addEventListener('sync', event => {
  /* Check if sync is for orders */
  if (event.tag === 'sync-orders') {
    console.log('[ServiceWorker] Syncing offline orders');
    /* Wait until sync completes */
    event.waitUntil(syncOfflineOrders());
  }
});

// ============================================
// PUSH NOTIFICATION EVENT
// Handles incoming push notifications
// ============================================

self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push Received');
  
  /* Default notification data */
  let data = { 
    title: 'কাঁচাবাজার', 
    body: 'আপনার জন্য নতুন আপডেট', 
    icon: '/assets/icons/icon-192x192.png' 
  };
  
  /* If push has data, use it */
  if (event.data) {
    data = event.data.json();
  }
  
  /* Notification options */
  const options = {
    body: data.body,                    /* Notification message */
    icon: data.icon || '/assets/icons/icon-192x192.png',  /* Icon shown */
    badge: '/assets/icons/icon-72x72.png',                /* Badge icon */
    vibrate: [200, 100, 200],          /* Vibration pattern */
    data: {
      url: data.url || '/',             /* URL to open on click */
      orderId: data.orderId              /* Order ID if applicable */
    },
    /* Action buttons on notification */
    actions: [
      {
        action: 'view',                  /* View action */
        title: 'দেখুন'                   /* Bengali text */
      },
      {
        action: 'close',                 /* Close action */
        title: 'বন্ধ করুন'               /* Bengali text */
      }
    ]
  };
  
  /* Show the notification */
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ============================================
// NOTIFICATION CLICK EVENT
// Handles user clicking on notification
// ============================================

self.addEventListener('notificationclick', event => {
  /* Close the notification */
  event.notification.close();
  
  /* If user clicked "view" or clicked the notification itself (no action) */
  if (event.action === 'view' || !event.action) {
    /* Get URL to open */
    const urlToOpen = event.notification.data.url || '/';
    
    /* Open or focus the URL */
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(windowClients => {
          /* Check if window with same URL already exists */
          for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i];
            if (client.url === urlToOpen && 'focus' in client) {
              /* Focus existing window */
              return client.focus();
            }
          }
          /* Open new window if none exists */
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// ============================================
// MESSAGE EVENT
// Handles messages from the main thread
// ============================================

self.addEventListener('message', event => {
  /* If message is to skip waiting, activate immediately */
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Sync offline orders when connection is restored
 * @returns {Promise} Resolves when sync is complete
 */
async function syncOfflineOrders() {
  try {
    /* Get offline orders from IndexedDB */
    const offlineOrders = await getOfflineOrders();
    
    /* If there are offline orders */
    if (offlineOrders && offlineOrders.length > 0) {
      /* Try to send each order */
      for (const order of offlineOrders) {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        });
        
        /* If order sent successfully, remove from offline storage */
        if (response.ok) {
          await removeOfflineOrder(order.id);
        }
      }
      
      /* Show notification about synced orders */
      self.registration.showNotification('অর্ডার সিঙ্ক হয়েছে', {
        body: `${offlineOrders.length}টি অর্ডার সফলভাবে সিঙ্ক হয়েছে`,
        icon: '/assets/icons/icon-192x192.png'
      });
    }
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
  }
}

/**
 * Get offline orders from IndexedDB
 * @returns {Promise<Array>} Array of offline orders
 */
function getOfflineOrders() {
  /* TODO: Implement IndexedDB logic to retrieve offline orders */
  /* For now, return empty array */
  return Promise.resolve([]);
}

/**
 * Remove an order from offline storage
 * @param {string} id - Order ID to remove
 * @returns {Promise} Resolves when removed
 */
function removeOfflineOrder(id) {
  /* TODO: Implement IndexedDB logic to remove order */
  /* For now, return resolved promise */
  return Promise.resolve();
}