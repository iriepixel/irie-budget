"use client"

import { useOptimistic, useState, useTransition } from "react"
import { Pencil, PiggyBank } from "lucide-react"

import { report } from "@/lib/report"

import { PageHeader } from "@/components/page-header"
import { PotDialog } from "@/components/pot-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { setPot } from "@/app/actions"
import { formatAmount } from "@/lib/spendings"

export function PotView({ saved }: { saved: number }) {
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const [shownSaved, setShownSaved] = useOptimistic(saved)

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 md:py-16">
      <PageHeader />

      <Card>
        <CardContent className="flex flex-col items-center gap-6 py-12">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <PiggyBank className="size-7 text-muted-foreground" />
          </div>

          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">Money saved</p>
            <p className="text-5xl font-semibold tracking-tight tabular-nums">
              {formatAmount(shownSaved)}
            </p>
          </div>

          <Button variant="outline" onClick={() => setOpen(true)}>
            <Pencil />
            Update
          </Button>
        </CardContent>
      </Card>

      <PotDialog
        open={open}
        onOpenChange={setOpen}
        saved={shownSaved}
        onSubmit={(amount) =>
          startTransition(async () => {
            setShownSaved(amount)
            await report(() => setPot({ amount }), "Could not save the pot")
          })
        }
      />
    </main>
  )
}
