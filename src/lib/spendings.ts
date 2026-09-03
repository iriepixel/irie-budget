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

/** How the categories are grouped in the picker, so a phone shows fewer. */
export const CATEGORY_GROUPS = [
  { label: "Home", categories: ["Mortgage", "House", "Utilities", "Insurance"] },
  { label: "Living", categories: ["Food", "Transport", "Car", "Child", "Health"] },
  {
    label: "Lifestyle",
    categories: ["Entertainment", "Shopping", "Subscription"],
  },
  { label: "Money", categories: ["Bank", "Investment", "Savings"] },
  { label: "Other", categories: ["Other"] },
] as const satisfies readonly {
  label: string
  categories: readonly Category[]
}[]

type GroupedCategory = (typeof CATEGORY_GROUPS)[number]["categories"][number]
type Assert<T extends true> = T

/**
 * Adding a category without putting it in a group fails the build here,
 * rather than quietly leaving it out of the picker.
 */
export type EveryCategoryIsGrouped = Assert<
  Exclude<Category, GroupedCategory> extends never ? true : false
>

/** The two people the budget is split between. */
export const OWNERS = [
  { id: "jev", name: "Jev" },
  { id: "olia", name: "Olia" },
] as const

export const OWNER_IDS = ["jev", "olia"] as const

export type Owner = (typeof OWNER_IDS)[number]

/**
 * Jev pays the recurring costs from one of two cards. Only recurring
 * spendings are split this way; everything else sits on the default.
 */
export const CARD_IDS = ["main", "bill"] as const

export type CardId = (typeof CARD_IDS)[number]

/** The one place a card is given a human name and its one-letter mark. */
export const CARDS = [
  { id: "main", name: "Main", initial: "M" },
  { id: "bill", name: "Bill", initial: "B" },
] as const satisfies readonly { id: CardId; name: string; initial: string }[]

/** What an unmarked spending counts as, in the UI and in the column default. */
export const DEFAULT_CARD: CardId = "main"

/** The tabs above the recurring table: either card, or everything. */
export const CARD_TABS = ["all", ...CARD_IDS] as const

export type CardTab = (typeof CARD_TABS)[number]

/**
 * "recurring" repeats every month; "oneOff" applies to this month only;
 * "food" is the separate food budget, tracked in its own list.
 */
export const SPENDING_KINDS = ["recurring", "oneOff", "food"] as const

export type SpendingKind = (typeof SPENDING_KINDS)[number]

/** The one place a kind is given a human name. */
export const KIND_LABELS: Record<SpendingKind, string> = {
  recurring: "Recurring",
  oneOff: "One-off",
  food: "Food",
}

export type Spending = {
  id: string
  title: string
  amount: number
  /** Day of the month, 1-31. Used for ordering only. */
  day: number
  category: Category
  kind: SpendingKind
  owner: Owner
  /** Which card pays it. Only read for recurring spendings. */
  card: CardId
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

/** The recurring rows a card tab shows; "all" filters nothing out. */
export function filterByCard(spendings: Spending[], tab: CardTab) {
  return tab === "all" ? spendings : spendings.filter((s) => s.card === tab)
}
