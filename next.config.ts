import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    /**
     * Hold a navigated page's payload in the client router cache, so moving
     * between the budget, the pot and the categories is instant rather than
     * a fresh render and database round trip each time.
     */
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
}

export default nextConfig
