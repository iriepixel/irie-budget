import { headers } from "next/headers"

import { isAllowed } from "@/lib/allowlist"
import { auth } from "@/lib/auth"
import { getBudget, getPot } from "@/lib/queries"

/**
 * Downloads the whole budget as JSON. The proxy does not gate /api, and a
 * redirect is no use to a download, so the session is checked here and a
 * refusal is a 401 rather than a login page.
 */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user || !isAllowed(session.user.email)) {
    return new Response("Unauthorized", { status: 401 })
  }

  const [{ spendings, salaries }, pot] = await Promise.all([
    getBudget(),
    getPot(),
  ])

  const backup = {
    exportedAt: new Date().toISOString(),
    exportedBy: session.user.email,
    salaries,
    pot,
    spendings,
  }

  const stamp = new Date().toISOString().slice(0, 10)

  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="irie-budget-${stamp}.json"`,
      "cache-control": "no-store",
    },
  })
}
