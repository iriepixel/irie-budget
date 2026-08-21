import { describe, expect, it } from "vitest"

import {
  byCategoryAndPerson,
  byKind,
  cumulativeByDay,
  formatTick,
  topCategories,
} from "./chart-data"
import type { Spending } from "./spendings"

function s(partial: Partial<Spending>): Spending {
  return {
    id: Math.random().toString(),
    title: "Test",
    amount: 10,
    day: 1,
    category: "Other",
    kind: "recurring",
    owner: "jev",
    ...partial,
  }
}

describe("byKind", () => {
  it("drops kinds with nothing in them", () => {
    const rows = byKind([s({ kind: "recurring", amount: 5 })])

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ kind: "recurring", total: 5 })
  })
})

describe("topCategories", () => {
  it("keeps the five biggest and pools the rest into Other", () => {
    const spendings = [
      s({ category: "Mortgage", amount: 60 }),
      s({ category: "Food", amount: 50 }),
      s({ category: "Car", amount: 40 }),
      s({ category: "Health", amount: 30 }),
      s({ category: "Bank", amount: 20 }),
      s({ category: "Shopping", amount: 7 }),
      s({ category: "Child", amount: 3 }),
    ]

    const slices = topCategories(spendings)

    // Six segments is the readable limit for a part-to-whole chart.
    expect(slices).toHaveLength(6)
    expect(slices.map((slice) => slice.label)).toEqual([
      "Mortgage",
      "Food",
      "Car",
      "Health",
      "Bank",
      "Other",
    ])
    expect(slices.at(-1)?.total).toBe(10)
  })

  it("adds no Other slice when everything already fits", () => {
    const slices = topCategories([s({ category: "Food", amount: 1 })])

    expect(slices.map((slice) => slice.label)).toEqual(["Food"])
  })
})

describe("byCategoryAndPerson", () => {
  it("splits each category between the two people", () => {
    const [row] = byCategoryAndPerson([
      s({ category: "Food", owner: "jev", amount: 30 }),
      s({ category: "Food", owner: "olia", amount: 20 }),
    ])

    expect(row).toMatchObject({ category: "Food", jev: 30, olia: 20, total: 50 })
  })
})

describe("cumulativeByDay", () => {
  it("covers every day of the longest month", () => {
    expect(cumulativeByDay([])).toHaveLength(31)
  })

  it("carries the running total forward across empty days", () => {
    const rows = cumulativeByDay([
      s({ day: 2, amount: 10 }),
      s({ day: 5, amount: 5 }),
    ])

    expect(rows[0].total).toBe(0)
    expect(rows[1].total).toBe(10)
    expect(rows[3].total).toBe(10)
    expect(rows.at(-1)?.total).toBe(15)
  })
})

describe("formatTick", () => {
  it("shortens thousands so the axis stays narrow", () => {
    expect(formatTick(950)).toBe("£950")
    expect(formatTick(12_400)).toBe("£12k")
  })

  it("keeps a decimal below ten thousand, so £2,500 is not called £3k", () => {
    expect(formatTick(2500)).toBe("£2.5k")
    expect(formatTick(2000)).toBe("£2k")
  })
})
