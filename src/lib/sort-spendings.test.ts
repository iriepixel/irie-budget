import { describe, expect, it } from "vitest"

import type { Spending } from "./spendings"

// The comparator as SpendingsTable applies it for the day column.
function byDay(direction: "asc" | "desc") {
  const factor = direction === "asc" ? 1 : -1
  return (a: Spending, b: Spending) =>
    factor * (a.day - b.day) || b.amount - a.amount
}

function s(day: number, amount: number, title: string): Spending {
  return {
    id: title,
    title,
    amount,
    day,
    category: "Other",
    kind: "recurring",
    owner: "jev",
  }
}

describe("day sort", () => {
  const rows = [
    s(1, 26.62, "Royal London"),
    s(1, 587.82, "Flex"),
    s(1, 125.0, "Jenny"),
    s(5, 13.5, "Netflix"),
  ]

  it("puts the biggest amount first within the same day", () => {
    const titles = [...rows].sort(byDay("asc")).map((row) => row.title)
    expect(titles).toEqual(["Flex", "Jenny", "Royal London", "Netflix"])
  })

  it("keeps biggest-first within a day when days are descending", () => {
    const titles = [...rows].sort(byDay("desc")).map((row) => row.title)
    expect(titles).toEqual(["Netflix", "Flex", "Jenny", "Royal London"])
  })
})
