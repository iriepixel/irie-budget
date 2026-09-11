/**
 * Each pot is a single running total, so the table holds one row per pot
 * keyed by name rather than a row per deposit.
 */
export const POT_IDS = ["household", "flex", "sergej"] as const

export type PotId = (typeof POT_IDS)[number]

export type Pot = { saved: number; goal: number }

export type Pots = Record<PotId, Pot>

/**
 * The one place a pot is titled and labelled. Only the household pot aims
 * at a goal; Flex is a plain running total.
 */
export const POTS = [
  {
    id: "household",
    title: "Savings pot",
    label: "Money saved",
    hasGoal: true,
  },
  { id: "flex", title: "Flex", label: "Saved in Flex", hasGoal: false },
  { id: "sergej", title: "Sergej", label: "Saved for Sergej", hasGoal: false },
] as const satisfies readonly {
  id: PotId
  title: string
  label: string
  hasGoal: boolean
}[]

export function potMeta(id: PotId) {
  return POTS.find((meta) => meta.id === id) ?? POTS[0]
}
