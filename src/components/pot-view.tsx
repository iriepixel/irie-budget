"use client"

import { useOptimistic, useState, useTransition } from "react"
import { Pencil, PiggyBank } from "lucide-react"

import { PotDialog } from "@/components/pot-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { setPot } from "@/app/actions"
import { potProgress } from "@/lib/pot-progress"
import { report } from "@/lib/report"
import { formatAmount } from "@/lib/spendings"
import { cn } from "@/lib/utils"
import type { Pot } from "@/lib/queries"

export function PotView({ pot }: { pot: Pot }) {
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const [shown, setShown] = useOptimistic(pot)

  const { percent, tone } = potProgress(shown.saved, shown.goal)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Savings pot</CardTitle>
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              <Pencil />
              Update
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <PiggyBank className="size-7 text-muted-foreground" />
          </div>

          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">Money saved</p>
            <p
              className={cn(
                "text-6xl font-semibold tracking-tight whitespace-nowrap tabular-nums sm:text-7xl",
                tone
              )}
            >
              {formatAmount(shown.saved)}
            </p>

            {percent === null ? (
              <p className="text-sm text-muted-foreground">
                No goal set yet
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                <span className={cn("font-semibold tabular-nums", tone)}>
                  {percent}%
                </span>{" "}
                of {formatAmount(shown.goal)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <PotDialog
        open={open}
        onOpenChange={setOpen}
        pot={shown}
        onSubmit={(next) =>
          startTransition(async () => {
            setShown(next)
            await report(
              () => setPot({ amount: next.saved, goal: next.goal }),
              "Could not save the pot"
            )
          })
        }
      />
    </>
  )
}
