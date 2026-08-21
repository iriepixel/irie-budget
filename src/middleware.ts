import { getSessionCookie } from "better-auth/cookies"
import { NextResponse, type NextRequest } from "next/server"

/**
 * Optimistic gate only — it checks for the presence of a session cookie, not
 * its validity. Every server action and page re-checks the real session.
 */
export function middleware(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next()

  const signIn = new URL("/sign-in", request.url)
  return NextResponse.redirect(signIn)
}

export const config = {
  matcher: ["/((?!api|sign-in|_next/static|_next/image|favicon.ico).*)"],
}
