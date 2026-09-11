import "server-only"

import { inArray } from "drizzle-orm"

import { db, incomes, pot, salaries, spendings } from "@/lib/db"
import { toPence, toPounds } from "@/lib/money"
import type { Income } from "@/lib/income"
import type { RowColor } from "@/lib/row-color"
import { POT_IDS, type PotId, type Pots } from "@/lib/pots"
import {
  OWNER_IDS,
  type CardId,
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
      card: row.card as CardId,
      color: row.color as RowColor,
    })),
    salaries: amounts,
  }
}

/**
 * Every pot, whether or not it has a row yet: a pot nobody has put money
 * in is zero, not missing.
 */
export async function getPots(): Promise<Pots> {
  const rows = await db
    .select()
    .from(pot)
    .where(inArray(pot.id, [...POT_IDS]))

  const empty = { saved: 0, goal: 0 }
  const pots = Object.fromEntries(POT_IDS.map((id) => [id, empty])) as Pots

  for (const row of rows) {
    if ((POT_IDS as readonly string[]).includes(row.id)) {
      pots[row.id as PotId] = {
        saved: toPounds(row.amountPence),
        goal: toPounds(row.goalPence),
      }
    }
  }

  return pots
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
    card: row.card as CardId,
    color: row.color as RowColor,
  }))
}

/** Planned income, listed under the savings pot. */
export async function getIncomes(): Promise<Income[]> {
  const rows = await db.select().from(incomes)

  return rows.map((row) => ({
    id: row.id,
    source: row.source,
    amount: toPounds(row.amountPence),
    date: row.date,
    color: row.color as RowColor,
  }))
}
