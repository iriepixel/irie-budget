import { describe, expect, it } from "vitest"

import { potProgress } from "./pot-progress"

describe("potProgress", () => {
  it("has nothing to report without a goal", () => {
    expect(potProgress(500, 0)).toEqual({ percent: null, tone: "" })
  })

  it("is red below 30 per cent", () => {
    expect(potProgress(0, 1000).tone).toContain("destructive")
    expect(potProgress(294, 1000).tone).toContain("destructive")
  })

  it("is amber from 30 up to 70 per cent", () => {
    expect(potProgress(300, 1000).tone).toContain("amber")
    expect(potProgress(694, 1000).tone).toContain("amber")
  })

  it("is green from 70 per cent up", () => {
    expect(potProgress(700, 1000).tone).toContain("emerald")
    expect(potProgress(2000, 1000).tone).toContain("emerald")
  })

  it("colours by the percentage shown, not the exact fraction", () => {
    // 29.9% displays as 30%, so coloring it red would contradict the label.
    const almost = potProgress(299, 1000)
    expect(almost.percent).toBe(30)
    expect(almost.tone).toContain("amber")
  })

  it("rounds the percentage", () => {
    expect(potProgress(1046.51, 5000).percent).toBe(21)
    expect(potProgress(1000, 1000).percent).toBe(100)
  })
})
