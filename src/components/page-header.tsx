import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

/** Back to the budget plus the theme toggle, for the standalone pages. */
export function PageHeader() {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/">
          <ArrowLeft />
          Budget
        </Link>
      </Button>
      <ThemeToggle />
    </div>
  )
}
