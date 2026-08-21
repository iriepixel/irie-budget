import {
  formatAmount,
  KIND_LABELS,
  OWNERS,
  SPENDING_KINDS,
  sumAmounts,
  type Category,
  type Owner,
  type Spending,
} from "@/lib/spendings"

/** Part-to-whole reads at a glance only, so cap the slices and fold the rest. */
export const TOP_SLICES = 5

export function byKind(spendings: Spending[]) {
  return SPENDING_KINDS.map((kind) => ({
    kind,
    label: KIND_LABELS[kind],
    total: sumAmounts(spendings.filter((s) => s.kind === kind)),
  })).filter((row) => row.total > 0)
}

export function byCategory(spendings: Spending[]) {
  const totals = new Map<Category, number>()

  for (const spending of spendings) {
    totals.set(
      spending.category,
      (totals.get(spending.category) ?? 0) + spending.amount
    )
  }

  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

/** The biggest few by name, everything else summed into one "Other" slice. */
export function topCategories(spendings: Spending[]) {
  const rows = byCategory(spendings)
  const rest = rows.slice(TOP_SLICES)

  const slices: { label: string; total: number }[] = rows
    .slice(0, TOP_SLICES)
    .map((row) => ({ label: row.category, total: row.total }))

  if (rest.length > 0) {
    slices.push({
      label: "Other",
      total: rest.reduce((sum, row) => sum + row.total, 0),
    })
  }

  return slices
}

export function byCategoryAndPerson(spendings: Spending[]) {
  return byCategory(spendings).map(({ category, total }) => {
    const row: Record<string, string | number> = { category, total }

    for (const { id } of OWNERS) {
      row[id] = sumAmounts(
        spendings.filter((s) => s.category === category && s.owner === id)
      )
    }

    return row as { category: Category; total: number } & Record<Owner, number>
  })
}

/** Running total across the days of the month, so the shape of it shows. */
export function cumulativeByDay(spendings: Spending[]) {
  let running = 0

  return Array.from({ length: 31 }, (_, index) => {
    const day = index + 1
    running += sumAmounts(spendings.filter((s) => s.day === day))
    return { day, total: running }
  })
}

/** Axis ticks: whole pounds, then 1dp thousands so £2,500 is not "£3k". */
export const formatTick = (value: number) => {
  if (value < 1000) return `£${Math.round(value)}`
  const thousands = value / 1000
  const shown = thousands < 10 ? thousands.toFixed(1).replace(/\.0$/, "") : String(Math.round(thousands))
  return `£${shown}k`
}

export { formatAmount }
