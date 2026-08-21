/**
 * How far the pot has come, and the colour that says so at a glance.
 * A goal of zero means none is set, so there is nothing to be behind on.
 */
export function potProgress(saved: number, goal: number) {
  if (goal <= 0) return { percent: null, tone: "" as const }

  const percent = Math.round((saved / goal) * 100)

  const tone =
    percent < 30
      ? "text-destructive"
      : percent < 70
        ? "text-amber-600 dark:text-amber-500"
        : "text-emerald-600 dark:text-emerald-500"

  return { percent, tone }
}
