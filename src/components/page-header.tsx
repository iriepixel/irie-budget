import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

/** Back to the budget plus the theme toggle, for the standalone pages. */
export function PageHeader() {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/" prefetch>
          <ArrowLeft />
          Budget
        </Link>
      </Button>
      <ThemeToggle />
    </div>
  )
}

/** Matches PageHeader's height so the loading state does not jump. */
export function PageHeaderSkeleton() {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-9 w-9" />
    </div>
  )
}
