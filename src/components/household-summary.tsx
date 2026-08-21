"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatAmount,
  OWNERS,
  sumAmounts,
  type Salaries,
  type Spending,
} from "@/lib/spendings"
import { cn } from "@/lib/utils"

type Props = {
  salaries: Salaries
  /** Every spending, both people's. */
  spendings: Spending[]
}

export function HouseholdSummary({ salaries, spendings }: Props) {
  const salary = OWNERS.reduce((sum, { id }) => sum + salaries[id], 0)
  const recurring = sumAmounts(spendings.filter((s) => s.kind === "recurring"))
  const oneOff = sumAmounts(spendings.filter((s) => s.kind === "oneOff"))
  const food = sumAmounts(spendings.filter((s) => s.kind === "food"))
  const total = sumAmounts(spendings)
  const remaining = salary - total

  return (
    <Card>
      <CardHeader>
        <CardTitle>Household</CardTitle>
        <CardDescription>
          {OWNERS.map(({ name }) => name).join(" and ")} combined
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6 sm:grid-cols-3">
        <Stat label="Combined salary" value={formatAmount(salary)} />
        <Stat
          label="Total spendings"
          value={formatAmount(total)}
          hint={`${formatAmount(recurring)} recurring · ${formatAmount(oneOff)} one-off · ${formatAmount(food)} food`}
        />
        <Stat
          label={remaining < 0 ? "Over budget by" : "Left to spend"}
          value={formatAmount(Math.abs(remaining))}
          className={
            remaining < 0
              ? "text-destructive"
              : "text-emerald-600 dark:text-emerald-500"
          }
        />
      </CardContent>

      <CardFooter className="grid gap-3 border-t pt-6 sm:grid-cols-2">
        {OWNERS.map(({ id, name }) => {
          const spent = sumAmounts(spendings.filter((s) => s.owner === id))
          const left = salaries[id] - spent

          return (
            <div key={id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {name} {left < 0 ? "over by" : "has left"}
              </span>
              <span
                className={cn(
                  "font-medium tabular-nums",
                  left < 0 && "text-destructive"
                )}
              >
                {formatAmount(Math.abs(left))}
              </span>
            </div>
          )
        })}
      </CardFooter>
    </Card>
  )
}

function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string
  value: string
  hint?: string
  className?: string
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("text-3xl font-semibold tabular-nums", className)}>
        {value}
      </p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
