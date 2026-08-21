import "server-only"

import { eq } from "drizzle-orm"

import { db, pot, salaries, spendings } from "@/lib/db"
import { toPence, toPounds } from "@/lib/money"
import {
  OWNER_IDS,
  type Owner,
  type Salaries,
  type Spending,
} from "@/lib/spendings"

export async function getBudget(): Promise<{
  spendings: Spending[]
  salaries: Salaries
}> {
  const [spendingRows, salaryRows] = await Promise.all([
    db.select().from(spendings),
    db.select().from(salaries),
  ])

  const amounts = Object.fromEntries(
    OWNER_IDS.map((id) => [id, 0])
  ) as Salaries

  for (const row of salaryRows) {
    if ((OWNER_IDS as readonly string[]).includes(row.owner)) {
      amounts[row.owner as Owner] = toPounds(row.amountPence)
    }
  }

  return {
    spendings: spendingRows.map((row) => ({
      id: row.id,
      title: row.title,
      amount: toPounds(row.amountPence),
      day: row.day,
      category: row.category as Spending["category"],
      kind: row.kind as Spending["kind"],
      owner: row.owner as Owner,
    })),
    salaries: amounts,
  }
}

/** The savings pot is a single running total, stored under one key. */
export const POT_ID = "household"

export type Pot = { saved: number; goal: number }

export async function getPot(): Promise<Pot> {
  const [row] = await db.select().from(pot).where(eq(pot.id, POT_ID))

  return {
    saved: row ? toPounds(row.amountPence) : 0,
    goal: row ? toPounds(row.goalPence) : 0,
  }
}

export { toPence, toPounds }

/** Only the spendings, for pages that do not need salaries. */
export async function getSpendings(): Promise<Spending[]> {
  const rows = await db.select().from(spendings)

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    amount: toPounds(row.amountPence),
    day: row.day,
    category: row.category as Spending["category"],
    kind: row.kind as Spending["kind"],
    owner: row.owner as Owner,
  }))
}
