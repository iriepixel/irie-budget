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
import type { Pot } from "@/lib/queries"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pot: Pot
  onSubmit: (pot: Pot) => void
}

export function PotDialog({ open, onOpenChange, pot, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {/* The content unmounts on close, so the form resets on every open. */}
        <PotForm
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
  pot,
  onSubmit,
  onCancel,
}: {
  pot: Pot
  onSubmit: (pot: Pot) => void
  onCancel: () => void
}) {
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
      goal: Math.round(parsedGoal * 100) / 100,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <DialogHeader>
        <DialogTitle>Savings pot</DialogTitle>
        <DialogDescription>
          The running total, and what you are aiming for. Both replace the
          current figures.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-3">
          <Label htmlFor="saved">Money saved</Label>
          <AmountInput
            id="saved"
            value={amount}
            onValueChange={setAmount}
            placeholder="0.00"
            autoFocus
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="goal">Goal</Label>
          <AmountInput
            id="goal"
            value={goal}
            onValueChange={setGoal}
            placeholder="Leave empty for no goal"
          />
        </div>

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
