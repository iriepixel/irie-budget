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
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const salaries = pgTable("salaries", {
  owner: text("owner").primaryKey(),
  amountPence: integer("amount_pence").notNull(),
})

export type SpendingRow = typeof spendings.$inferSelect
export type SalaryRow = typeof salaries.$inferSelect
