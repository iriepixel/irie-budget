"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChartPie, Download, House, LogOut, PiggyBank } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/auth-client"

/** Shown until the picture loads, or when the account has none. */
function initials(name: string) {
  const letters = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")

  return letters.toUpperCase() || "?"
}

const NAV = [
  { href: "/", label: "Budget", Icon: House },
  { href: "/categories", label: "Spending by category", Icon: ChartPie },
  { href: "/pot", label: "Savings pot", Icon: PiggyBank },
]

export function AppHeader({
  user,
}: {
  user: { name: string; image: string | null }
}) {
  const router = useRouter()
  const pathname = usePathname()

  // Two people share this ledger from different devices. A server action
  // only refreshes the tab that ran it, so catch this tab up whenever it
  // regains focus. The header renders on every signed-in page.
  useEffect(() => {
    const onFocus = () => router.refresh()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [router])

  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <div className="space-y-1">
        <Link href="/" className="outline-none">
          <h1 className="text-2xl font-semibold tracking-tight">IRIE Budget</h1>
        </Link>
        <p className="text-sm text-muted-foreground">Every pound has a plan.</p>
      </div>

      <div className="flex items-center gap-1">
        <Avatar className="mr-2 size-8">
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
        {NAV.map(({ href, label, Icon }) => (
          <Button
            key={href}
            variant="ghost"
            size="icon"
            asChild
            // Marks where you are, now that three pages share one header.
            className={cn(pathname === href && "bg-muted text-foreground")}
          >
            <Link href={href} prefetch aria-label={label}>
              <Icon />
            </Link>
          </Button>
        ))}
        <ThemeToggle />
        <Button variant="ghost" size="icon" asChild>
          <a href="/api/backup" download aria-label="Download a backup">
            <Download />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          onClick={() =>
            signOut({
              fetchOptions: { onSuccess: () => router.push("/sign-in") },
            })
          }
        >
          <LogOut />
        </Button>
      </div>
    </div>
  )
}
