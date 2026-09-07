/**
 * Planned income: what is expected to arrive, listed under the savings pot.
 * Deliberately not a kind of spending — it must never reach a spend total.
 */
export type Income = {
  id: string
  source: string
  amount: number
  /** ISO "YYYY-MM-DD". Held as text so sorting is byte order and no
      timezone can move a date across midnight. */
  date: string
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

/**
 * "7 Sept 2026". Parsed at midday UTC so no offset can land the instant on
 * the day either side of the one that was stored.
 */
export function formatIncomeDate(date: string) {
  const parsed = new Date(`${date}T12:00:00Z`)

  return Number.isNaN(parsed.getTime()) ? date : dateFormat.format(parsed)
}

/** Today as "YYYY-MM-DD" in local time, which is what a date input wants. */
export function todayISO() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${now.getFullYear()}-${month}-${day}`
}

export const INCOME_COLUMNS = ["date", "source", "amount"] as const

export type IncomeColumn = (typeof INCOME_COLUMNS)[number]

export const INCOME_COLUMN_LABELS: Record<IncomeColumn, string> = {
  date: "Date",
  source: "Source",
  amount: "Amount",
}

/**
 * The order the table shows. Same date puts the biggest amount first,
 * whichever way the dates run, matching how the spendings table breaks a tie.
 */
export function sortIncome(
  incomes: Income[],
  column: IncomeColumn,
  direction: "asc" | "desc"
) {
  const factor = direction === "asc" ? 1 : -1

  return [...incomes].sort((a, b) => {
    if (column === "source") return factor * a.source.localeCompare(b.source)
    if (column === "amount") return factor * (a.amount - b.amount)
    return factor * a.date.localeCompare(b.date) || b.amount - a.amount
  })
}

/**
 * Which shade band each row falls in, parallel to the list given. The band
 * flips every time the month changes, so one month's run of rows shares one
 * tint and the next month's is plain. Only meaningful in date order: sorted
 * by source or amount the months interleave and a band would land at random.
 */
export function monthBands(incomes: readonly Income[]) {
  let band = 0
  let previous: string | null = null

  return incomes.map(({ date }) => {
    const month = date.slice(0, 7)

    if (previous !== null && month !== previous) band = band === 0 ? 1 : 0
    previous = month

    return band
  })
}
