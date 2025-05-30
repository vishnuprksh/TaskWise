const CACHE_NAME = 'taskwise-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192x192.svg',
    '/icons/icon-512x512.svg'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch events
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
    console.log('SW: Notification clicked:', event.notification.tag, event.action);
    
    event.notification.close();
    
    const notificationData = event.notification.data || {};
    const action = event.action;
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if the app is already open
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    
                    // Send message to handle the notification action
                    client.postMessage({
                        type: 'NOTIFICATION_CLICK',
                        action: action,
                        notificationData: notificationData
                    });
                    
                    return;
                }
            }
            
            // If no window is open, open a new one
            if (clients.openWindow) {
                let url = '/';
                
                // Add specific parameters based on action
                if (action === 'view' || notificationData.type === 'top-priority') {
                    url = '/#tasks';
                }
                
                return clients.openWindow(url).then((client) => {
                    if (client) {
                        // Wait a bit for the page to load, then send the message
                        setTimeout(() => {
                            client.postMessage({
                                type: 'NOTIFICATION_CLICK',
                                action: action,
                                notificationData: notificationData
                            });
                        }, 1000);
                    }
                });
            }
        })
    );
});

// Handle notification action events (for browsers that support them)
self.addEventListener('notificationclose', (event) => {
    console.log('SW: Notification closed:', event.notification.tag);
});

// Handle push events (for future push notification support)
self.addEventListener('push', (event) => {
    console.log('SW: Push event received');
    
    if (event.data) {
        const data = event.data.json();
        console.log('SW: Push data:', data);
        
        const options = {
            body: data.body || 'You have a new task reminder',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            tag: data.tag || 'taskwise-push',
            data: data.data || {}
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'TaskWise', options)
        );
    }
});
