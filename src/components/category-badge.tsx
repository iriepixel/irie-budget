import { Badge } from "@/components/ui/badge"
import { type Category } from "@/lib/spendings"
import { cn } from "@/lib/utils"

/**
 * One pale tint per category. Written as whole class strings because
 * Tailwind only sees literals, so these cannot be built from a colour name.
 * Light mode uses a 100-level wash; dark mode a translucent tint, which sits
 * better on the near-black background than a solid dark swatch.
 */
const CATEGORY_STYLES: Record<Category, string> = {
  Food: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
  Mortgage: "bg-blue-100 text-blue-900 dark:bg-blue-500/15 dark:text-blue-200",
  House: "bg-stone-200 text-stone-900 dark:bg-stone-500/20 dark:text-stone-200",
  Insurance:
    "bg-indigo-100 text-indigo-900 dark:bg-indigo-500/15 dark:text-indigo-200",
  Car: "bg-cyan-100 text-cyan-900 dark:bg-cyan-500/15 dark:text-cyan-200",
  Child: "bg-pink-100 text-pink-900 dark:bg-pink-500/15 dark:text-pink-200",
  Transport: "bg-sky-100 text-sky-900 dark:bg-sky-500/15 dark:text-sky-200",
  Utilities: "bg-teal-100 text-teal-900 dark:bg-teal-500/15 dark:text-teal-200",
  Health: "bg-rose-100 text-rose-900 dark:bg-rose-500/15 dark:text-rose-200",
  Entertainment:
    "bg-violet-100 text-violet-900 dark:bg-violet-500/15 dark:text-violet-200",
  Shopping:
    "bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-500/15 dark:text-fuchsia-200",
  Subscription:
    "bg-purple-100 text-purple-900 dark:bg-purple-500/15 dark:text-purple-200",
  Bank: "bg-orange-100 text-orange-900 dark:bg-orange-500/15 dark:text-orange-200",
  Investment:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200",
  Savings: "bg-lime-100 text-lime-900 dark:bg-lime-500/15 dark:text-lime-200",
  Other: "bg-muted text-muted-foreground",
}

export function CategoryBadge({
  category,
  className,
}: {
  category: Category
  className?: string
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(CATEGORY_STYLES[category], className)}
    >
      {category}
    </Badge>
  )
}
