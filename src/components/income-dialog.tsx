"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { todayISO, type Income } from "@/lib/income"

type Values = Omit<Income, "id">

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing an existing entry. */
  income: Income | null
  /** Deletes the entry being edited. On a phone the rows have no buttons
      of their own, so this is the only route to delete. */
  onDelete: (id: string) => void
  onSubmit: (values: Values) => void
}

export function IncomeDialog({
  open,
  onOpenChange,
  income,
  onDelete,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* The content unmounts on close, so the form resets on every open. */}
        <IncomeForm
          income={income}
          onDelete={
            income
              ? () => {
                  onDelete(income.id)
                  onOpenChange(false)
                }
              : undefined
          }
          onSubmit={(values) => {
            onSubmit(values)
            onOpenChange(false)
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function IncomeForm({
  income,
  onDelete,
  onSubmit,
  onCancel,
}: {
  income: Income | null
  onDelete?: () => void
  onSubmit: (values: Values) => void
  onCancel: () => void
}) {
  const [source, setSource] = useState(income?.source ?? "")
  const [amount, setAmount] = useState(income ? String(income.amount) : "")
  const [date, setDate] = useState(income?.date ?? todayISO())
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const trimmed = source.trim()
    const parsedAmount = Number(amount)

    if (!trimmed) return setError("Say where the money is coming from.")
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0)
      return setError("Amount has to be a number greater than 0.")
    // An emptied native date input reports "", which the server rejects.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError("Pick a date.")

    onSubmit({
      source: trimmed,
      amount: Math.round(parsedAmount * 100) / 100,
      date,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <DialogHeader>
        <DialogTitle>{income ? "Edit" : "Add"} planned income</DialogTitle>
        <DialogDescription>
          Money expected to arrive, on the day it lands.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-3">
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Salary"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-3">
            <Label htmlFor="amount">Amount</Label>
            <AmountInput
              id="amount"
              value={amount}
              onValueChange={setAmount}
              placeholder="0.00"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="date">Date</Label>
            {/* Native, so a phone gets the system date picker. */}
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <DialogFooter className="gap-y-2">
        {income && onDelete ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive sm:mr-auto"
              >
                <Trash2 />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {income.source}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{income ? "Save changes" : "Add income"}</Button>
      </DialogFooter>
    </form>
  )
}
