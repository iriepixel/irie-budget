"use client"

import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { potProgress } from "@/lib/pot-progress"
import { formatAmount } from "@/lib/spendings"
import { cn } from "@/lib/utils"

/** A quieter running total under the headline: this figure plus something else. */
export type TotalExtra = {
  label: string
  total: number
  /** Set on the line that sums the others, to lift it out of the list. */
  emphasis?: boolean
}

type Props = {
  title: string
  /** What the big figure is, said above it. */
  label: string
  icon: React.ComponentType<{ className?: string }>
  amount: number
  /** Given only when this figure aims at something. */
  goal?: number
  /** Extra totals to show, one line each. */
  extras?: TotalExtra[]
  /** Absent when the figure is derived and so cannot be typed in. */
  onEdit?: () => void
  /** Sized to sit two-up rather than alone across the page. */
  compact?: boolean
}

export function TotalCard({
  title,
  label,
  icon: Icon,
  amount,
  goal,
  extras = [],
  onEdit,
  compact = false,
}: Props) {
  const { percent, tone } = potProgress(amount, goal ?? 0)

  return (
    <Card className={cn(compact && "h-full")}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {onEdit ? (
          <CardAction>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil />
              Update
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      {/* Heavier bottom padding: the header eats into the top gap, so
          equal padding reads as bottom-light. A compact card carries one
          line where the full one carries four, so it needs far less. */}
      <CardContent
        className={cn(
          "flex flex-col items-center",
          compact ? "gap-4 pt-2 pb-8" : "gap-6 pt-8 pb-20"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted",
            compact ? "size-11" : "size-14"
          )}
        >
          <Icon
            className={cn(
              "text-muted-foreground",
              compact ? "size-5" : "size-7"
            )}
          />
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">{label}</p>
          {/* The tone lives on the percentage; painting the whole amount
              destructive-red made a fresh, distant goal read as an error.
              A compact figure stays small enough not to overflow its
              column at the narrowest two-up width. */}
          <p
            className={cn(
              "font-semibold tracking-tight whitespace-nowrap tabular-nums",
              compact ? "text-4xl" : "text-6xl sm:text-7xl"
            )}
          >
            {formatAmount(amount)}
          </p>

          {goal === undefined ? null : percent === null ? (
            <p className="text-sm text-muted-foreground">No goal set yet</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              <span className={cn("font-semibold tabular-nums", tone)}>
                {percent}%
              </span>{" "}
              of {formatAmount(goal)}
            </p>
          )}
        </div>

        {/* Grouped, so a second line sits close under the first rather
            than a card gap away from it. */}
        {extras.length > 0 ? (
          <div className="space-y-1.5 text-center">
            {extras.map((extra) => (
              <p
                key={extra.label}
                className={cn(
                  "flex flex-wrap items-baseline justify-center gap-x-2 text-sm",
                  extra.emphasis
                    ? "pt-1 font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {extra.label}
                <span className="font-semibold whitespace-nowrap text-foreground tabular-nums">
                  {formatAmount(extra.total)}
                </span>
              </p>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
