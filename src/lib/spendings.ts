export const CATEGORIES = [
  "Food",
  "Mortgage",
  "House",
  "Insurance",
  "Car",
  "Child",
  "Transport",
  "Utilities",
  "Health",
  "Entertainment",
  "Shopping",
  "Subscription",
  "Bank",
  "Investment",
  "Savings",
  "Other",
] as const

export type Category = (typeof CATEGORIES)[number]

/** The two people the budget is split between. */
export const OWNERS = [
  { id: "jev", name: "Jev" },
  { id: "olia", name: "Olia" },
] as const

export const OWNER_IDS = ["jev", "olia"] as const

export type Owner = (typeof OWNER_IDS)[number]

/**
 * "recurring" repeats every month; "oneOff" applies to this month only;
 * "food" is the separate food budget, tracked in its own list.
 */
export const SPENDING_KINDS = ["recurring", "oneOff", "food"] as const

export type SpendingKind = (typeof SPENDING_KINDS)[number]

export type Spending = {
  id: string
  title: string
  amount: number
  /** Day of the month, 1-31. Used for ordering only. */
  day: number
  category: Category
  kind: SpendingKind
  owner: Owner
}

/** Take-home pay per person. */
export type Salaries = Record<Owner, number>

/** "1".."31" — the options offered in the day picker. */
export const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

const currency = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
})

export function formatAmount(amount: number) {
  return currency.format(amount)
}

export function formatDay(day: number) {
  return String(day).padStart(2, "0")
}

export function currentDay() {
  return new Date().getDate()
}

export function sumAmounts(spendings: Spending[]) {
  return spendings.reduce((sum, s) => sum + s.amount, 0)
}
