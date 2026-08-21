import { AppHeader } from "@/components/app-header"
import { requireUser } from "@/lib/session"

/**
 * One header and one page width for every signed-in page, so moving between
 * them does not shift the content. The sign-in page sits outside this group.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-16">
      <AppHeader
        user={{ name: user.name || user.email, image: user.image ?? null }}
      />
      {children}
    </div>
  )
}
