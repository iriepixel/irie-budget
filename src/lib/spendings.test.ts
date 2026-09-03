import { describe, expect, it } from "vitest"

import {
  CARD_IDS,
  CARDS,
  CATEGORIES,
  CATEGORY_GROUPS,
  DAYS,
  filterByCard,
  formatAmount,
  formatDay,
  OWNER_IDS,
  OWNERS,
  SPENDING_KINDS,
  sumAmounts,
  type Spending,
} from "./spendings"

function spending(partial: Partial<Spending>): Spending {
  return {
    id: "1",
    title: "Test",
    amount: 10,
    day: 1,
    category: "Other",
    kind: "recurring",
    owner: "jev",
    card: "main",
    ...partial,
  }
}

describe("sumAmounts", () => {
  it("is zero for an empty list", () => {
    expect(sumAmounts([])).toBe(0)
  })

  it("adds every amount", () => {
    expect(
      sumAmounts([spending({ amount: 10 }), spending({ amount: 2.5 })])
    ).toBe(12.5)
  })
})

describe("formatDay", () => {
  it("pads to two digits so the column stays aligned", () => {
    expect(formatDay(1)).toBe("01")
    expect(formatDay(9)).toBe("09")
    expect(formatDay(31)).toBe("31")
  })
})

describe("formatAmount", () => {
  it("formats as sterling", () => {
    expect(formatAmount(1234.5)).toBe("£1,234.50")
    expect(formatAmount(0)).toBe("£0.00")
  })
})

describe("constants", () => {
  it("offers every day of the longest month", () => {
    expect(DAYS).toHaveLength(31)
    expect(DAYS[0]).toBe(1)
    expect(DAYS.at(-1)).toBe(31)
  })

  it("has no duplicate categories", () => {
    expect(new Set(CATEGORIES).size).toBe(CATEGORIES.length)
  })

  it("puts every category in exactly one group", () => {
    const grouped = CATEGORY_GROUPS.flatMap((group) => group.categories)

    expect(new Set(grouped).size).toBe(grouped.length)
    expect([...grouped].sort()).toEqual([...CATEGORIES].sort())
  })

  it("keeps OWNER_IDS in step with OWNERS", () => {
    expect(OWNERS.map((owner) => owner.id)).toEqual([...OWNER_IDS])
  })

  it("knows the three kinds of spending", () => {
    expect([...SPENDING_KINDS]).toEqual(["recurring", "oneOff", "food"])
  })
})

describe("filterByCard", () => {
  const rows = [
    spending({ id: "a", card: "main" }),
    spending({ id: "b", card: "bill" }),
    spending({ id: "c", card: "main" }),
  ]

  it("keeps everything on the all tab", () => {
    expect(filterByCard(rows, "all")).toEqual(rows)
  })

  it("keeps only the rows paid by the chosen card", () => {
    expect(filterByCard(rows, "bill").map((s) => s.id)).toEqual(["b"])
    expect(filterByCard(rows, "main").map((s) => s.id)).toEqual(["a", "c"])
  })

  it("adds up to the whole list across both cards", () => {
    const split = CARD_IDS.flatMap((id) => filterByCard(rows, id))
    expect(split).toHaveLength(rows.length)
  })
})

describe("CARDS", () => {
  it("names every card id exactly once", () => {
    expect(CARDS.map(({ id }) => id)).toEqual([...CARD_IDS])
  })
})
