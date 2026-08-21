import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { isAllowed } from "@/lib/allowlist"
import { auth } from "@/lib/auth"

/**
 * The real session check. Middleware only sees whether a cookie exists, so
 * every page and every server action goes through this.
 */
export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user || !isAllowed(session.user.email)) {
    redirect("/sign-in")
  }

  return session.user
}
