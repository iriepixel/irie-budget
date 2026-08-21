import { describe, expect, it } from "vitest"

import { toPence, toPounds } from "./money"

describe("toPence", () => {
  it("converts pounds to whole pence", () => {
    expect(toPence(12.34)).toBe(1234)
    expect(toPence(0)).toBe(0)
  })

  it("rounds rather than truncating float error", () => {
    // 19.99 * 100 is 1998.9999999999998 in binary floating point.
    expect(toPence(19.99)).toBe(1999)
    expect(toPence(0.07)).toBe(7)
  })

  it("loses a half penny downwards, as the float allows", () => {
    // 1.005 * 100 is 100.49999999999999, so this rounds down. Harmless
    // here because the forms round to two decimals before saving, and a
    // half penny cannot be entered.
    expect(toPence(1.005)).toBe(100)
  })

  it("round-trips through toPounds", () => {
    for (const amount of [0, 0.01, 19.99, 1234.56, 7809.98]) {
      expect(toPounds(toPence(amount))).toBe(amount)
    }
  })
})
