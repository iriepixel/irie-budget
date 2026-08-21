import { betterAuth } from "better-auth"
import { APIError } from "better-auth/api"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"

import { isAllowed } from "@/lib/allowlist"
import { db } from "@/lib/db"
import { account, session, user, verification } from "@/lib/db/auth-schema"

/**
 * Hosts know their own deployment URL, so prefer it over BETTER_AUTH_URL in
 * production: a value copied from .env.local still says localhost, which
 * makes better-auth reject the request as a bad origin.
 */
function resolveBaseURL() {
  // Netlify exposes the site's primary URL as URL.
  if (process.env.URL?.startsWith("https://")) return process.env.URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return process.env.BETTER_AUTH_URL
}

const baseURL = resolveBaseURL()

/**
 * Every origin the app is legitimately served from. Setting this explicitly
 * replaces better-auth's default, so anything missing here is rejected with
 * INVALID_ORIGIN — deploy previews and unique deploy URLs included.
 */
function resolveTrustedOrigins() {
  const origins = [
    baseURL,
    process.env.URL, // Netlify production
    process.env.DEPLOY_PRIME_URL, // Netlify branch deploys and previews
    process.env.DEPLOY_URL, // Netlify per-deploy URL
  ]

  if (process.env.NODE_ENV !== "production") {
    origins.push("http://localhost:3000", "http://localhost:8888")
  }

  return [...new Set(origins.filter((origin): origin is string => !!origin))]
}

export const auth = betterAuth({
  baseURL,
  trustedOrigins: resolveTrustedOrigins(),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  session: {
    // Every page and every action verifies the session, which was a Neon
    // round trip each time. The signed cookie snapshot removes it.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  // Send auth failures back to the sign-in page instead of better-auth's
  // own error route, so the reason can be shown in the UI.
  onAPIError: { errorURL: "/sign-in" },
  databaseHooks: {
    user: {
      create: {
        // Throwing aborts creation, so a stranger who completes a Google
        // sign-in still never gets an account. Throwing rather than
        // returning false keeps the reason attached to the redirect.
        before: async (user) => {
          if (!isAllowed(user.email)) {
            const [local = "", domain = ""] = (user.email ?? "").split("@")
            console.warn(
              `[auth] refused sign-in for ${local.slice(0, 2)}…@${domain}`
            )
            throw new APIError("FORBIDDEN", {
              code: "EMAIL_NOT_ALLOWED",
              message: "That account is not allowed to use this app.",
            })
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
})
