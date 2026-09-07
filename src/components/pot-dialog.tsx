"use client"

import { useState } from "react"

import { AmountInput } from "@/components/amount-input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { potMeta, type PotId } from "@/lib/pots"
import type { Pot } from "@/lib/pots"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Which pot is being updated, which decides the copy and the fields. */
  id: PotId
  pot: Pot
  onSubmit: (pot: Pot) => void
}

export function PotDialog({ open, onOpenChange, id, pot, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {/* The content unmounts on close, so the form resets on every open. */}
        <PotForm
          id={id}
          pot={pot}
          onSubmit={(value) => {
            onSubmit(value)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function PotForm({
  id,
  pot,
  onSubmit,
  onCancel,
}: {
  id: PotId
  pot: Pot
  onSubmit: (pot: Pot) => void
  onCancel: () => void
}) {
  const { title, label, hasGoal } = potMeta(id)
  const [amount, setAmount] = useState(pot.saved ? String(pot.saved) : "")
  const [goal, setGoal] = useState(pot.goal ? String(pot.goal) : "")
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const parsedAmount = Number(amount)
    const parsedGoal = goal === "" ? 0 : Number(goal)

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return setError("Enter an amount of 0 or more.")
    }
    if (!Number.isFinite(parsedGoal) || parsedGoal < 0) {
      return setError("Enter a goal of 0 or more, or leave it empty.")
    }

    onSubmit({
      saved: Math.round(parsedAmount * 100) / 100,
      // A pot with no goal keeps whatever it had, which is zero.
      goal: hasGoal ? Math.round(parsedGoal * 100) / 100 : pot.goal,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          {hasGoal
            ? "The running total, and what you are aiming for. Both replace the current figures."
            : "The running total. This replaces the current figure."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-3">
          <Label htmlFor="saved">{label}</Label>
          <AmountInput
            id="saved"
            value={amount}
            onValueChange={setAmount}
            placeholder="0.00"
            autoFocus
          />
        </div>

        {hasGoal ? (
          <div className="grid gap-3">
            <Label htmlFor="goal">Goal</Label>
            <AmountInput
              id="goal"
              value={goal}
              onValueChange={setGoal}
              placeholder="Leave empty for no goal"
            />
          </div>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  )
}
