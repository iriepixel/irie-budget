import { describe, expect, it } from "vitest"

import {
  formatIncomeDate,
  INCOME_COLUMNS,
  INCOME_COLUMN_LABELS,
  monthBands,
  sortIncome,
  todayISO,
  type Income,
} from "./income"
import { sumAmounts } from "./spendings"

function income(partial: Partial<Income>): Income {
  return {
    id: Math.random().toString(),
    source: "Salary",
    amount: 100,
    date: "2026-09-07",
    ...partial,
  }
}

describe("formatIncomeDate", () => {
  it("reads as a British calendar date", () => {
    expect(formatIncomeDate("2026-10-02")).toBe("2 Oct 2026")
  })

  it("does not drift across a month or year boundary", () => {
    expect(formatIncomeDate("2026-01-01")).toBe("1 Jan 2026")
    expect(formatIncomeDate("2026-12-31")).toBe("31 Dec 2026")
  })

  it("gives back nonsense unchanged rather than showing Invalid Date", () => {
    expect(formatIncomeDate("not-a-date")).toBe("not-a-date")
  })
})

describe("todayISO", () => {
  it("is a zero-padded ISO date a date input accepts", () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe("sortIncome", () => {
  const rows = [
    income({ id: "oct", source: "Refund", amount: 180, date: "2026-10-02" }),
    income({ id: "sep-big", source: "Salary", amount: 2400, date: "2026-09-07" }),
    income({ id: "sep-small", source: "Gift", amount: 50, date: "2026-09-07" }),
  ]

  it("runs earliest first by date", () => {
    expect(sortIncome(rows, "date", "asc").map((i) => i.id)).toEqual([
      "sep-big",
      "sep-small",
      "oct",
    ])
  })

  it("puts the biggest amount first within the same date", () => {
    const sameDay = sortIncome(rows, "date", "desc").map((i) => i.id)
    expect(sameDay).toEqual(["oct", "sep-big", "sep-small"])
  })

  it("sorts by source and by amount", () => {
    expect(sortIncome(rows, "source", "asc").map((i) => i.source)).toEqual([
      "Gift",
      "Refund",
      "Salary",
    ])
    expect(sortIncome(rows, "amount", "asc").map((i) => i.amount)).toEqual([
      50, 180, 2400,
    ])
  })

  it("leaves the list it was given alone", () => {
    const before = rows.map((i) => i.id)
    sortIncome(rows, "amount", "desc")
    expect(rows.map((i) => i.id)).toEqual(before)
  })
})

describe("income totals", () => {
  it("adds every amount", () => {
    expect(sumAmounts([income({ amount: 2400 }), income({ amount: 450 })])).toBe(
      2850
    )
  })

  it("is zero for an empty list", () => {
    expect(sumAmounts([])).toBe(0)
  })
})

describe("INCOME_COLUMNS", () => {
  it("labels every sortable column", () => {
    for (const column of INCOME_COLUMNS) {
      expect(INCOME_COLUMN_LABELS[column]).toBeTruthy()
    }
  })
})

describe("monthBands", () => {
  function bandsFor(dates: string[]) {
    return monthBands(dates.map((date) => income({ date })))
  }

  it("gives one band to a single month", () => {
    expect(bandsFor(["2026-09-01", "2026-09-14", "2026-09-28"])).toEqual([
      0, 0, 0,
    ])
  })

  it("flips the band on every change of month", () => {
    expect(
      bandsFor(["2026-09-07", "2026-09-28", "2026-10-02", "2026-11-01"])
    ).toEqual([0, 0, 1, 0])
  })

  it("treats the same month a year apart as a change", () => {
    expect(bandsFor(["2026-12-31", "2027-12-31"])).toEqual([0, 1])
  })

  it("stays parallel to the list it was given", () => {
    const dates = ["2026-09-07", "2026-10-02", "2026-10-09"]
    expect(bandsFor(dates)).toHaveLength(dates.length)
  })

  it("has nothing to band in an empty list", () => {
    expect(monthBands([])).toEqual([])
  })
})
