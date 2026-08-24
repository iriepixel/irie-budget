/**
 * Two jobs, still deliberately small:
 *
 *  1. Paint instantly when iOS relaunches the installed app. iOS evicts
 *     the web view within minutes of backgrounding, so nearly every return
 *     is a full reload, and a cold reload waits on a Netlify cold start
 *     plus Neon waking from idle — seconds of the manifest's black splash.
 *     Serve the last good copy of the page whenever the network takes more
 *     than a moment; the app refreshes its data on focus, so a briefly
 *     stale shell heals itself.
 *
 *  2. Show the offline page instead of the browser error when there is no
 *     connection at all.
 */
const CACHE = "shell-v2"
const OFFLINE_URL = "/offline.html"
const NETWORK_TIMEOUT_MS = 2500

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return

  event.respondWith(serveNavigation(event.request))
})

async function serveNavigation(request) {
  const cache = await caches.open(CACHE)

  const network = fetch(request).then((response) => {
    // Never cache a redirect: / bouncing to /sign-in would otherwise store
    // the sign-in page under the budget's URL.
    if (response.ok && !response.redirected) {
      cache.put(request, response.clone())
    }
    return response
  })

  const cached = await cache.match(request)

  // Nothing stored yet: it is the network or the offline page.
  if (!cached) {
    return network.catch(() => caches.match(OFFLINE_URL))
  }

  // Fresh if the server is quick, the last good copy if it is cold. The
  // network fetch keeps running either way and updates the cache behind it.
  const timeout = new Promise((resolve) =>
    setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS)
  )

  return (await Promise.race([network.catch(() => null), timeout])) || cached
}
