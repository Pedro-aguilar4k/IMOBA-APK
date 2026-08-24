const CACHE_NAME = 'imoba-shell-v1'
const STATIC_ASSETS = ['/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))))
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  const sensitive = request.method !== 'GET' || url.pathname.startsWith('/api/') || url.pathname.startsWith('/dashboard/') || url.hostname.includes('supabase') || request.headers.has('authorization')
  if (sensitive || url.origin !== self.location.origin) return
  if (!url.pathname.startsWith('/_next/static/') && !STATIC_ASSETS.includes(url.pathname)) return
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()))
    return response
  })))
})
