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
  KIND_LABELS,
  OWNERS,
  sumAmounts,
  type Salaries,
  type Spending,
  type SpendingKind,
} from "@/lib/spendings"
import { KIND_COLORS, KINDS, SpendMeter } from "@/components/spend-meter"
import { cn } from "@/lib/utils"

type Props = {
  salaries: Salaries
  /** Every spending, both people's. */
  spendings: Spending[]
}

export function HouseholdSummary({ salaries, spendings }: Props) {
  const salary = OWNERS.reduce((sum, { id }) => sum + salaries[id], 0)
  const byKind = Object.fromEntries(
    KINDS.map((kind) => [
      kind,
      sumAmounts(spendings.filter((s) => s.kind === kind)),
    ])
  ) as Record<SpendingKind, number>
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

      {/* Phone: the answer first, then a compact ledger. */}
      <CardContent className="space-y-6 sm:hidden">
        <Hero salary={salary} remaining={remaining} />
        <SpendMeter salary={salary} byKind={byKind} total={total} />
        <Ledger salary={salary} byKind={byKind} total={total} />
      </CardContent>

      {/* Desktop: the same answer-first shape, hero beside the ledger. */}
      <CardContent className="hidden gap-8 sm:grid sm:grid-cols-[2fr_3fr]">
        <Hero salary={salary} remaining={remaining} large />
        <div className="flex flex-col justify-center gap-5">
          <SpendMeter salary={salary} byKind={byKind} total={total} />
          <Ledger salary={salary} byKind={byKind} total={total} />
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-2 divide-x border-t pt-6">
        {OWNERS.map(({ id, name }) => {
          const spent = sumAmounts(spendings.filter((s) => s.owner === id))
          const left = salaries[id] - spent

          if (salaries[id] <= 0) {
            return (
              <div
                key={id}
                className="space-y-1 px-4 first:pl-0 last:pr-0 sm:px-6"
              >
                <p className="text-sm text-muted-foreground">{name}</p>
                <p className="text-sm text-muted-foreground">No salary set</p>
              </div>
            )
          }

          const share = Math.min(spent / salaries[id], 1)

          return (
            <div
              key={id}
              className="space-y-2 px-4 first:pl-0 last:pr-0 sm:px-6"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  {name} {left < 0 ? "is over by" : "has left"}
                </p>
                <p
                  className={cn(
                    "text-lg font-semibold whitespace-nowrap tabular-nums",
                    left < 0 && "text-destructive"
                  )}
                >
                  {formatAmount(Math.abs(left))}
                </p>
              </div>
              {/* How much of their salary is gone, at a glance. */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    left < 0 ? "bg-destructive" : "bg-foreground/50"
                  )}
                  style={{ width: `${share * 100}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardFooter>
    </Card>
  )
}

function Hero({
  salary,
  remaining,
  large = false,
}: {
  salary: number
  remaining: number
  large?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg bg-muted/50 px-4 py-5 text-center",
        large && "py-8"
      )}
    >
      {salary > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            {remaining < 0 ? "Over budget by" : "Left to spend"}
          </p>
          <p
            className={cn(
              "mt-1 font-semibold tracking-tight whitespace-nowrap tabular-nums",
              large ? "text-5xl" : "text-4xl",
              remaining < 0
                ? "text-destructive"
                : "text-emerald-600 dark:text-emerald-500"
            )}
          >
            {formatAmount(Math.abs(remaining))}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            of {formatAmount(salary)} salary
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Add salaries to see what is left to spend.
        </p>
      )}
    </div>
  )
}

function Ledger({
  salary,
  byKind,
  total,
}: {
  salary: number
  byKind: Record<SpendingKind, number>
  total: number
}) {
  return (
    <div className="space-y-3">
      <Row label="Salary" value={formatAmount(salary)} />
      {KINDS.map((kind) => (
        <Row
          key={kind}
          label={KIND_LABELS[kind]}
          value={`−${formatAmount(byKind[kind])}`}
          chip={KIND_COLORS[kind]}
          muted
        />
      ))}
      <div className="flex items-center justify-between border-t pt-3 text-sm">
        <span className="font-medium">Total spendings</span>
        <span className="font-medium tabular-nums">{formatAmount(total)}</span>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  chip,
  muted = false,
}: {
  label: string
  value: string
  chip?: string
  muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        {chip ? (
          <span
            aria-hidden
            className="size-2.5 rounded-[2px]"
            style={{ background: chip }}
          />
        ) : null}
        {label}
      </span>
      <span className={cn("tabular-nums", muted && "text-muted-foreground")}>
        {value}
      </span>
    </div>
  )
}
