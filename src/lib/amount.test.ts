import { describe, expect, it } from "vitest"

import { cleanAmountInput } from "./amount"

describe("cleanAmountInput", () => {
  it("keeps digits and a single decimal point", () => {
    expect(cleanAmountInput("12.34")).toBe("12.34")
    expect(cleanAmountInput("0")).toBe("0")
  })

  it("normalises a comma typed on a European keyboard", () => {
    expect(cleanAmountInput("12,34")).toBe("12.34")
  })

  it("collapses extra separators instead of producing NaN", () => {
    expect(cleanAmountInput("1.2.3")).toBe("1.23")
    expect(cleanAmountInput("1,2.3")).toBe("1.23")
  })

  it("strips anything that is not a number", () => {
    expect(cleanAmountInput("£12.34")).toBe("12.34")
    expect(cleanAmountInput("12abc")).toBe("12")
    expect(cleanAmountInput("-5")).toBe("5")
    expect(cleanAmountInput("1e5")).toBe("15")
  })

  it("stays parseable by Number", () => {
    expect(Number(cleanAmountInput("£1,234"))).toBe(1.234)
    expect(Number(cleanAmountInput("99,99"))).toBe(99.99)
  })

  it("allows an empty value while typing", () => {
    expect(cleanAmountInput("")).toBe("")
    expect(cleanAmountInput("abc")).toBe("")
  })
})
