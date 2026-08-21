"use client"

import { useEffect } from "react"

/** Registers the offline fallback. Skipped in dev, where it fights HMR. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // A failed registration just means no offline page; not worth surfacing.
    })
  }, [])

  return null
}
