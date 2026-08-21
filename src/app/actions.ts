"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db, salaries, spendings } from "@/lib/db"
import { toPence } from "@/lib/queries"
import { requireUser } from "@/lib/session"
import { CATEGORIES, OWNER_IDS, SPENDING_KINDS } from "@/lib/spendings"

const spendingInput = z.object({
  title: z.string().trim().min(1).max(120),
  amount: z.number().positive().max(1_000_000),
  day: z.int().min(1).max(31),
  category: z.enum(CATEGORIES),
  kind: z.enum(SPENDING_KINDS),
  owner: z.enum(OWNER_IDS),
})

const salaryInput = z.object({
  owner: z.enum(OWNER_IDS),
  amount: z.number().min(0).max(1_000_000),
})

export async function addSpending(input: unknown) {
  await requireUser()
  const { title, amount, day, category, kind, owner } =
    spendingInput.parse(input)

  await db
    .insert(spendings)
    .values({ title, amountPence: toPence(amount), day, category, kind, owner })

  revalidatePath("/")
}

export async function updateSpending(id: string, input: unknown) {
  await requireUser()
  const { title, amount, day, category } = spendingInput
    .partial({ kind: true, owner: true })
    .parse(input)

  await db
    .update(spendings)
    .set({ title, amountPence: toPence(amount), day, category })
    .where(eq(spendings.id, z.uuid().parse(id)))

  revalidatePath("/")
}

export async function deleteSpending(id: string) {
  await requireUser()

  await db.delete(spendings).where(eq(spendings.id, z.uuid().parse(id)))

  revalidatePath("/")
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

  if (rows.length > 0) {
    await db.insert(spendings).values(
      rows.map(({ title, amount, day, category, kind, owner }) => ({
        title,
        amountPence: toPence(amount),
        day,
        category,
        kind,
        owner,
      }))
    )
  }

  for (const { owner, amount } of pay) {
    const amountPence = toPence(amount)
    await db
      .insert(salaries)
      .values({ owner, amountPence })
      .onConflictDoUpdate({ target: salaries.owner, set: { amountPence } })
  }

  revalidatePath("/")
}
