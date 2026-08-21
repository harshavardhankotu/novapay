const CACHE_NAME = "revolut-cache-v1"
const urlsToCache = ["/dashboard", "/accounts", "/cards", "/transfers", "/upi"]

self.addEventListener("install", (event: any) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)))
})

self.addEventListener("fetch", (event: any) => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request).then(res => {
      if (event.request.method === "GET") {
        const resClone = res.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone))
      }
      return res
    }))
  )
})

self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
  )
})
