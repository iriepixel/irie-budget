"use client"

import { Pencil, PiggyBank, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { potProgress } from "@/lib/pot-progress"
import { potMeta, type Pot, type PotId } from "@/lib/pots"
import { formatAmount } from "@/lib/spendings"
import { cn } from "@/lib/utils"

/** Two identical piggy banks stacked read as one card rendered twice. */
const ICONS: Record<PotId, typeof PiggyBank> = {
  household: PiggyBank,
  flex: Wallet,
}

/** A quieter running total under the headline: this pot plus something else. */
export type PotExtra = {
  label: string
  total: number
  /** Set on the line that sums the others, to lift it out of the list. */
  emphasis?: boolean
}

type Props = {
  id: PotId
  pot: Pot
  /** Extra totals to show, one line each. Empty for a plain pot. */
  extras?: PotExtra[]
  onEdit: () => void
}

export function PotCard({ id, pot, extras = [], onEdit }: Props) {
  const { title, label, hasGoal } = potMeta(id)
  const Icon = ICONS[id]
  const { percent, tone } = potProgress(pot.saved, pot.goal)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil />
            Update
          </Button>
        </CardAction>
      </CardHeader>
      {/* Heavier bottom padding: the header eats into the top gap, so
          equal padding reads as bottom-light. */}
      <CardContent className="flex flex-col items-center gap-6 pt-8 pb-20">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Icon className="size-7 text-muted-foreground" />
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">{label}</p>
          {/* The tone lives on the percentage; painting the whole amount
              destructive-red made a fresh, distant goal read as an error. */}
          <p className="text-6xl font-semibold tracking-tight whitespace-nowrap tabular-nums sm:text-7xl">
            {formatAmount(pot.saved)}
          </p>

          {hasGoal ? (
            percent === null ? (
              <p className="text-sm text-muted-foreground">No goal set yet</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                <span className={cn("font-semibold tabular-nums", tone)}>
                  {percent}%
                </span>{" "}
                of {formatAmount(pot.goal)}
              </p>
            )
          ) : null}
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
