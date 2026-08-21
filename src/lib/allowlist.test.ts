import { describe, expect, it } from "vitest"

import { ALLOWED_EMAILS, isAllowed } from "./allowlist"

describe("isAllowed", () => {
  it("admits every listed address", () => {
    for (const email of ALLOWED_EMAILS) {
      expect(isAllowed(email)).toBe(true)
    }
  })

  it("ignores case and surrounding whitespace", () => {
    expect(isAllowed("  JEV@smolnikov.me ")).toBe(true)
  })

  it("refuses anyone else", () => {
    expect(isAllowed("stranger@example.com")).toBe(false)
    expect(isAllowed("jev@smolnikov.me.evil.com")).toBe(false)
  })

  it("refuses a missing address rather than throwing", () => {
    expect(isAllowed(null)).toBe(false)
    expect(isAllowed(undefined)).toBe(false)
    expect(isAllowed("")).toBe(false)
  })

  it("keeps every entry lowercase, since comparison lowercases the input", () => {
    for (const email of ALLOWED_EMAILS) {
      expect(email).toBe(email.toLowerCase())
    }
  })
})
