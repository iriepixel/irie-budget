/**
 * A tint picked by hand for one row of any table, for marking entries out
 * by whatever the list is being read for that week. "none" leaves the row
 * to whatever shading the table does on its own.
 */
export const ROW_COLORS = ["none", "red", "yellow", "green", "blue"] as const

export type RowColor = (typeof ROW_COLORS)[number]

export const ROW_COLOR_LABELS: Record<RowColor, string> = {
  none: "No colour",
  red: "Red",
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
}

/**
 * Written as whole class strings because Tailwind only sees literals, so
 * these cannot be built from a colour name. Pale enough to read text over,
 * with a darker step on hover so a coloured row still answers the pointer,
 * and a translucent tint in dark mode, which sits better on the near-black
 * background than a solid dark swatch.
 */
export const ROW_CLASS: Record<RowColor, string> = {
  none: "",
  red: "bg-red-100/70 hover:bg-red-100 dark:bg-red-500/15 dark:hover:bg-red-500/25",
  yellow:
    "bg-yellow-100/70 hover:bg-yellow-100 dark:bg-yellow-500/15 dark:hover:bg-yellow-500/25",
  green:
    "bg-emerald-100/70 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25",
  blue: "bg-blue-100/70 hover:bg-blue-100 dark:bg-blue-500/15 dark:hover:bg-blue-500/25",
}

/** The same palette as a solid swatch, for the picker in a dialog. */
export const SWATCH_CLASS: Record<RowColor, string> = {
  none: "border-dashed bg-background",
  red: "bg-red-200 dark:bg-red-500/40",
  yellow: "bg-yellow-200 dark:bg-yellow-500/40",
  green: "bg-emerald-200 dark:bg-emerald-500/40",
  blue: "bg-blue-200 dark:bg-blue-500/40",
}

/**
 * The class for one row: a hand-picked colour wins outright, since the
 * point of picking one is that the row stands out. Left to itself the row
 * takes whatever shading the table passes in.
 */
export function rowClass(color: RowColor, fallback?: string | false) {
  if (color !== "none") return ROW_CLASS[color]

  return fallback || undefined
}
