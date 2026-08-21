"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  formatAmount,
  KIND_LABELS,
  type SpendingKind,
} from "@/lib/spendings"

/** The three kinds wear the three validated chart colours, everywhere. */
export const KIND_COLORS: Record<SpendingKind, string> = {
  recurring: "var(--viz-1)",
  oneOff: "var(--viz-2)",
  food: "var(--viz-3)",
}

export const KINDS: SpendingKind[] = ["recurring", "oneOff", "food"]

/**
 * A meter: the salary is the track, the three kinds fill it. Spent-versus-
 * limit is a single ratio, which is the one job a meter does well.
 */
export function SpendMeter({
  salary,
  byKind,
  total,
}: {
  salary: number
  byKind: Record<SpendingKind, number>
  total: number
}) {
  if (salary <= 0) return null

  // An overspent month still has to render: the track grows to fit.
  const track = Math.max(salary, total)

  return (
    <div>
      <TooltipProvider delayDuration={100}>
        <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
          {KINDS.filter((kind) => byKind[kind] > 0).map((kind) => (
            <Tooltip key={kind}>
              <TooltipTrigger asChild>
                <div
                  className="h-full transition-opacity hover:opacity-80"
                  style={{
                    width: `${(byKind[kind] / track) * 100}%`,
                    background: KIND_COLORS[kind],
                  }}
                />
              </TooltipTrigger>
              <TooltipContent className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="size-2.5 rounded-[2px]"
                    style={{ background: KIND_COLORS[kind] }}
                  />
                  <span className="font-medium">{KIND_LABELS[kind]}</span>
                  <span className="tabular-nums">
                    {formatAmount(byKind[kind])}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {Math.round((byKind[kind] / total) * 100)}% of spending ·{" "}
                  {Math.round((byKind[kind] / salary) * 100)}% of salary
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
      <div className="mt-1.5 flex justify-between gap-2 text-xs text-muted-foreground">
        <span className="tabular-nums">{formatAmount(salary)} total</span>
        <span className="tabular-nums">{formatAmount(total)} spent</span>
        <span
          className={cn(
            "tabular-nums",
            salary - total < 0 && "text-destructive"
          )}
        >
          {formatAmount(Math.abs(salary - total))}{" "}
          {salary - total < 0 ? "over" : "left"}
        </span>
      </div>
    </div>
  )
}
