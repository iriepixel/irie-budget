"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  saved: number
  onSubmit: (saved: number) => void
}

export function PotDialog({ open, onOpenChange, saved, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {/* The content unmounts on close, so the form resets on every open. */}
        <PotForm
          saved={saved}
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
  saved,
  onSubmit,
  onCancel,
}: {
  saved: number
  onSubmit: (saved: number) => void
  onCancel: () => void
}) {
  const [amount, setAmount] = useState(saved ? String(saved) : "")
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const parsed = Number(amount)
    if (!Number.isFinite(parsed) || parsed < 0) {
      return setError("Enter a number of 0 or more.")
    }

    onSubmit(Math.round(parsed * 100) / 100)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <DialogHeader>
        <DialogTitle>Money saved</DialogTitle>
        <DialogDescription>
          The running total in the pot. Replaces the current figure.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        <Label htmlFor="saved">Amount</Label>
        <Input
          id="saved"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          autoFocus
        />
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
