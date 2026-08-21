import { betterAuth } from "better-auth"
import { APIError } from "better-auth/api"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"

import { isAllowed } from "@/lib/allowlist"
import { db } from "@/lib/db"
import { account, session, user, verification } from "@/lib/db/auth-schema"

export const auth = betterAuth({
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
            console.warn(`[auth] refused sign-in for ${user.email}`)
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
