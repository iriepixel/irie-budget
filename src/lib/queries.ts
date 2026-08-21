import "server-only"

import { db, salaries, spendings } from "@/lib/db"
import {
  OWNER_IDS,
  type Owner,
  type Salaries,
  type Spending,
} from "@/lib/spendings"

/** Money lives in the database as integer pence; the UI works in pounds. */
export function toPence(pounds: number) {
  return Math.round(pounds * 100)
}

export function toPounds(pence: number) {
  return pence / 100
}

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
