import { CategoryBadge } from "@/components/category-badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatAmount, type Category, type Spending } from "@/lib/spendings"

export function CategoryBreakdown({ spendings }: { spendings: Spending[] }) {
  const totals = new Map<Category, number>()

  for (const spending of spendings) {
    totals.set(
      spending.category,
      (totals.get(spending.category) ?? 0) + spending.amount
    )
  }

  const rows = [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)

  if (rows.length === 0) return null

  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0)
  const largest = rows[0].total

  return (
    <Card>
      <CardHeader>
        <CardTitle>By category</CardTitle>
        <CardDescription>
          Where the {formatAmount(grandTotal)} goes, both people combined
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map(({ category, total }) => (
          <div key={category} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <CategoryBadge category={category} />
              <span className="text-sm whitespace-nowrap tabular-nums">
                {formatAmount(total)}
                <span className="ml-2 text-muted-foreground">
                  {Math.round((total / grandTotal) * 100)}%
                </span>
              </span>
            </div>
            {/* Bars are scaled to the biggest category, so the smallest
                slices stay visible rather than collapsing to a sliver. */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/60"
                style={{ width: `${(total / largest) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
