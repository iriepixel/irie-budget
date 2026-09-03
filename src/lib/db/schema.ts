// better-auth owns these four tables; regenerate with `npx auth@latest generate`.
export * from "./auth-schema"

import {
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

/**
 * Amounts are stored as integer pence, never floats — money and binary
 * floating point do not mix. Conversion happens at the UI boundary.
 */
export const spendings = pgTable("spendings", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  amountPence: integer("amount_pence").notNull(),
  /** Day of the month, 1-31. Used for ordering only. */
  day: smallint("day").notNull(),
  category: text("category").notNull(),
  /** "recurring" | "oneOff" | "food" */
  kind: text("kind").notNull(),
  /** "jev" | "olia" */
  owner: text("owner").notNull(),
  /** "main" | "bill" — which card pays it. Only read for recurring costs. */
  card: text("card").notNull().default("main"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const salaries = pgTable("salaries", {
  owner: text("owner").primaryKey(),
  amountPence: integer("amount_pence").notNull(),
})

/**
 * The savings pot: a single running total, so one row keyed by a constant.
 */
export const pot = pgTable("pot", {
  id: text("id").primaryKey(),
  amountPence: integer("amount_pence").notNull(),
  /** What the pot is aiming for. Zero means no goal set. */
  goalPence: integer("goal_pence").notNull().default(0),
})

export type SpendingRow = typeof spendings.$inferSelect
export type SalaryRow = typeof salaries.$inferSelect
export type PotRow = typeof pot.$inferSelect
