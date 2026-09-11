import { describe, expect, it } from "vitest"

import {
  ROW_CLASS,
  ROW_COLOR_LABELS,
  ROW_COLORS,
  rowClass,
  SWATCH_CLASS,
} from "./row-color"

describe("ROW_COLORS", () => {
  it("offers no colour plus the four tints", () => {
    expect(ROW_COLORS).toEqual(["none", "red", "yellow", "green", "blue"])
  })

  it("labels and styles every colour", () => {
    for (const color of ROW_COLORS) {
      expect(ROW_COLOR_LABELS[color]).toBeTruthy()
      expect(SWATCH_CLASS[color]).toBeTruthy()
      if (color !== "none") expect(ROW_CLASS[color]).toBeTruthy()
    }
  })

  it("gives every tint a hover step, so a coloured row answers the pointer", () => {
    for (const color of ROW_COLORS) {
      if (color === "none") continue
      expect(ROW_CLASS[color]).toContain("hover:")
      expect(ROW_CLASS[color]).toContain("dark:")
    }
  })
})

describe("rowClass", () => {
  it("lets a picked colour beat whatever the table would have done", () => {
    expect(rowClass("green", "bg-muted/50")).toBe(ROW_CLASS.green)
  })

  it("falls back to the table's own shading when no colour is picked", () => {
    expect(rowClass("none", "bg-muted/50")).toBe("bg-muted/50")
  })

  it("is undefined when there is no colour and nothing to fall back to", () => {
    expect(rowClass("none")).toBeUndefined()
    expect(rowClass("none", false)).toBeUndefined()
    expect(rowClass("none", "")).toBeUndefined()
  })
})
