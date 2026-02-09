/* global clients */
// service-worker.js

const CACHE_NAME = 'kuntartib-cache-v2';
const STATIC_CACHE = 'kuntartib-static-v2';
const DYNAMIC_CACHE = 'kuntartib-dynamic-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map(name => {
            console.log('Service Worker: Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API requests (don't cache)
  if (event.request.url.includes('/api/')) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Return cached version
          return response;
        }
        
        // Fetch from network and cache dynamically
        return fetch(event.request)
          .then(fetchResponse => {
            // Check if valid response
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }
            
            // Clone response for caching
            const responseToCache = fetchResponse.clone();
            
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return fetchResponse;
          })
          .catch(() => {
            // Return offline page if available
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Push notification event
self.addEventListener('push', event => {
  console.log('Service Worker: Push received');
  
  let data = { title: 'KunTartib', body: 'Yangi bildirishnoma' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || Date.now(),
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Ochish', icon: '/icon-192.svg' },
      { action: 'close', title: 'Yopish' }
    ],
    requireInteraction: true,
    tag: data.tag || 'default'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline task creation
self.addEventListener('sync', event => {
  console.log('Service Worker: Sync event', event.tag);
  
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
  
  if (event.tag === 'sync-goals') {
    event.waitUntil(syncGoals());
  }
});

// Sync tasks with backend
async function syncTasks() {
  try {
    const pendingTasks = await getFromIndexedDB('pending-tasks');
    
    for (const task of pendingTasks) {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      await removeFromIndexedDB('pending-tasks', task.id);
    }
    
    console.log('Service Worker: Tasks synced successfully');
  } catch (error) {
    console.error('Service Worker: Task sync failed', error);
  }
}

// Sync goals with backend
async function syncGoals() {
  try {
    const pendingGoals = await getFromIndexedDB('pending-goals');
    
    for (const goal of pendingGoals) {
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });
      await removeFromIndexedDB('pending-goals', goal.id);
    }
    
    console.log('Service Worker: Goals synced successfully');
  } catch (error) {
    console.error('Service Worker: Goal sync failed', error);
  }
}

// IndexedDB helpers (simplified)
function getFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kuntartib-offline', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-tasks')) {
        db.createObjectStore('pending-tasks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending-goals')) {
        db.createObjectStore('pending-goals', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const getRequest = store.getAll();
      
      getRequest.onsuccess = () => resolve(getRequest.result || []);
      getRequest.onerror = () => reject(getRequest.error);
    };
  });
}

function removeFromIndexedDB(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kuntartib-offline', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'check-reminders') {
    event.waitUntil(checkReminders());
  }
});

// Check for due reminders
async function checkReminders() {
  try {
    const clients = await self.clients.matchAll();
    
    // Send message to all clients to check reminders
    clients.forEach(client => {
      client.postMessage({ type: 'CHECK_REMINDERS' });
    });
  } catch (error) {
    console.error('Service Worker: Reminder check failed', error);
  }
}

// Message handler
self.addEventListener('message', event => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleNotification(event.data.payload);
  }
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Schedule notification (using setTimeout in SW is limited, but works for short delays)
function scheduleNotification(payload) {
  const delay = new Date(payload.time).getTime() - Date.now();
  
  if (delay > 0 && delay < 5 * 60 * 1000) { // Max 5 minutes
    setTimeout(() => {
      self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        tag: payload.id,
        requireInteraction: true,
        vibrate: [200, 100, 200]
      });
    }, delay);
  }
}
