"use client"

import { useOptimistic, useState, useTransition } from "react"
import Link from "next/link"
import { ArrowLeft, Pencil, PiggyBank } from "lucide-react"

import { PotDialog } from "@/components/pot-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
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
      <div className="mb-8 flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft />
            Budget
          </Link>
        </Button>
        <ThemeToggle />
      </div>

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
            await setPot({ amount })
          })
        }
      />
    </main>
  )
}
