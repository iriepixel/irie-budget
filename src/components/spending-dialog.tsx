"use client"

import { Fragment, useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CATEGORY_GROUPS,
  currentDay,
  KIND_LABELS,
  DAYS,
  formatDay,
  type Category,
  type Spending,
  type SpendingKind,
} from "@/lib/spendings"

type Values = Omit<Spending, "id" | "kind" | "owner">

const KIND_DESCRIPTIONS: Record<SpendingKind, (name: string) => string> = {
  recurring: (name) => `A cost of ${name}'s that repeats every month.`,
  oneOff: (name) =>
    `A one-off cost of ${name}'s, counted towards this month only.`,
  food: (name) => `A food cost, counted towards ${name}'s food budget.`,
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing an existing spending. */
  spending: Spending | null
  /** Deletes the spending being edited. On a phone the rows have no
      buttons of their own, so this is the only route to delete. */
  onDelete: (id: string) => void
  /** Which list the spending belongs to, shown in the dialog copy. */
  kind: SpendingKind
  /** Whose spending it is. */
  name: string
  onSubmit: (values: Values) => void
}

export function SpendingDialog({
  open,
  onOpenChange,
  spending,
  kind,
  name,
  onDelete,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* The content unmounts on close, so the form resets on every open. */}
        <SpendingForm
          spending={spending}
          kind={kind}
          name={name}
          onDelete={
            spending
              ? () => {
                  onDelete(spending.id)
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

function SpendingForm({
  spending,
  kind,
  name,
  onDelete,
  onSubmit,
  onCancel,
}: {
  spending: Spending | null
  kind: SpendingKind
  name: string
  onDelete?: () => void
  onSubmit: (values: Values) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(spending?.title ?? "")
  const [amount, setAmount] = useState(
    spending ? String(spending.amount) : ""
  )
  const [day, setDay] = useState(String(spending?.day ?? currentDay()))
  const [category, setCategory] = useState<Category>(
    spending?.category ?? (kind === "food" ? "Food" : "Other")
  )
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const trimmed = title.trim()
    const parsedAmount = Number(amount)

    if (!trimmed) return setError("Give the spending a title.")
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0)
      return setError("Amount has to be a number greater than 0.")

    onSubmit({
      title: trimmed,
      amount: Math.round(parsedAmount * 100) / 100,
      day: Number(day),
      category,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <DialogHeader>
        <DialogTitle>
          {spending ? "Edit" : "Add"} {KIND_LABELS[kind].toLowerCase()} spending
        </DialogTitle>
        <DialogDescription>
          {KIND_DESCRIPTIONS[kind](name)}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-3">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Groceries"
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
            <Label htmlFor="day">Day of month</Label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger id="day" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {formatDay(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="category">Category</Label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value as Category)}
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_GROUPS.map((group, index) => (
                <Fragment key={group.label}>
                  {index > 0 ? <SelectSeparator /> : null}
                  <SelectGroup>
                    <SelectLabel className="pt-2 text-[11px] font-semibold tracking-widest text-foreground/70 uppercase">
                      {group.label}
                    </SelectLabel>
                    {group.categories.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </Fragment>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <DialogFooter className="gap-y-2">
        {spending && onDelete ? (
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
                <AlertDialogTitle>Delete {spending.title}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{spending ? "Save changes" : "Add spending"}</Button>
      </DialogFooter>
    </form>
  )
}
