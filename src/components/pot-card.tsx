"use client"

import { Pencil, PiggyBank } from "lucide-react"

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
import type { Pot } from "@/lib/queries"

type Props = {
  pot: Pot
  /** Total planned income, added on as a quieter second figure. */
  plannedIncome: number
  onEdit: () => void
}

export function PotCard({ pot, plannedIncome, onEdit }: Props) {
  const { percent, tone } = potProgress(pot.saved, pot.goal)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings pot</CardTitle>
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
          <PiggyBank className="size-7 text-muted-foreground" />
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">Money saved</p>
          {/* The tone lives on the percentage; painting the whole amount
              destructive-red made a fresh, distant goal read as an error. */}
          <p className="text-6xl font-semibold tracking-tight whitespace-nowrap tabular-nums sm:text-7xl">
            {formatAmount(pot.saved)}
          </p>

          {percent === null ? (
            <p className="text-sm text-muted-foreground">No goal set yet</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              <span className={cn("font-semibold tabular-nums", tone)}>
                {percent}%
              </span>{" "}
              of {formatAmount(pot.goal)}
            </p>
          )}
        </div>

        {/* Only worth a line when there is income to add: with none, it
            would just repeat the headline figure back. */}
        {plannedIncome > 0 ? (
          <p className="flex flex-wrap items-baseline justify-center gap-x-2 text-sm text-muted-foreground">
            With planned income
            <span className="font-semibold whitespace-nowrap text-foreground tabular-nums">
              {formatAmount(pot.saved + plannedIncome)}
            </span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
