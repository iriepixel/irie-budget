"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db, pot, salaries, spendings } from "@/lib/db"
import { POT_ID, toPence } from "@/lib/queries"
import { requireUser } from "@/lib/session"
import {
  CARD_IDS,
  CATEGORIES,
  DEFAULT_CARD,
  OWNER_IDS,
  SPENDING_KINDS,
} from "@/lib/spendings"

const spendingInput = z.object({
  title: z.string().trim().min(1).max(120),
  amount: z.number().positive().max(1_000_000),
  day: z.int().min(1).max(31),
  category: z.enum(CATEGORIES),
  kind: z.enum(SPENDING_KINDS),
  owner: z.enum(OWNER_IDS),
  // Only recurring costs are split across cards, and the legacy payload
  // predates the field entirely, so an absent card is not an error.
  card: z.enum(CARD_IDS).default(DEFAULT_CARD),
})

const salaryInput = z.object({
  owner: z.enum(OWNER_IDS),
  amount: z.number().min(0).max(1_000_000),
})

// Caps sized for the integer pence columns: int4 tops out around £21.4M,
// so a larger zod bound would let a validated input crash in Postgres.
const potInput = z.object({
  amount: z.number().min(0).max(1_000_000),
  goal: z.number().min(0).max(1_000_000),
})

export async function setPot(input: unknown) {
  await requireUser()
  const { amount, goal } = potInput.parse(input)
  const amountPence = toPence(amount)
  const goalPence = toPence(goal)

  await db
    .insert(pot)
    .values({ id: POT_ID, amountPence, goalPence })
    .onConflictDoUpdate({ target: pot.id, set: { amountPence, goalPence } })

  revalidatePath("/pot")
}

export async function addSpending(input: unknown) {
  await requireUser()
  const { title, amount, day, category, kind, owner, card } =
    spendingInput.parse(input)

  await db.insert(spendings).values({
    title,
    amountPence: toPence(amount),
    day,
    category,
    kind,
    owner,
    card,
  })

  revalidatePath("/")
  revalidatePath("/categories")
}

export async function updateSpending(id: string, input: unknown) {
  await requireUser()
  const { title, amount, day, category, card } = spendingInput
    .partial({ kind: true, owner: true })
    .parse(input)

  await db
    .update(spendings)
    .set({ title, amountPence: toPence(amount), day, category, card })
    .where(eq(spendings.id, z.uuid().parse(id)))

  revalidatePath("/")
  revalidatePath("/categories")
}

export async function deleteSpending(id: string) {
  await requireUser()

  await db.delete(spendings).where(eq(spendings.id, z.uuid().parse(id)))

  revalidatePath("/")
  revalidatePath("/categories")
}

export async function setSalary(input: unknown) {
  await requireUser()
  const { owner, amount } = salaryInput.parse(input)
  const amountPence = toPence(amount)

  await db
    .insert(salaries)
    .values({ owner, amountPence })
    .onConflictDoUpdate({ target: salaries.owner, set: { amountPence } })

  revalidatePath("/")
}

/**
 * One-time import of whatever is still sitting in a browser's localStorage
 * from before the app had a database.
 */
export async function importLegacyData(input: unknown) {
  await requireUser()

  const { spendings: rows, salaries: pay } = z
    .object({
      spendings: z.array(spendingInput).max(500),
      salaries: z.array(salaryInput).max(10),
    })
    .parse(input)

  // One atomic batch: a partial import cannot be told apart from a failed
  // one from the browser, and retrying a partial import duplicates rows.
  const statements = []

  if (rows.length > 0) {
    statements.push(
      db.insert(spendings).values(
        rows.map(({ title, amount, day, category, kind, owner, card }) => ({
          title,
          amountPence: toPence(amount),
          day,
          category,
          kind,
          owner,
          card,
        }))
      )
    )
  }

  for (const { owner, amount } of pay) {
    const amountPence = toPence(amount)
    statements.push(
      db
        .insert(salaries)
        .values({ owner, amountPence })
        .onConflictDoUpdate({ target: salaries.owner, set: { amountPence } })
    )
  }

  if (statements.length > 0) {
    await db.batch(statements as [(typeof statements)[number]])
  }

  revalidatePath("/")
  revalidatePath("/categories")
}
