"use client"

import { Input } from "@/components/ui/input"
import { cleanAmountInput } from "@/lib/amount"

/**
 * type="number" is a poor fit for money: iOS pairs it with a keypad that
 * still carries a full keyboard row, a desktop scroll wheel silently edits
 * the value, and a comma typed on a European keyboard parses as NaN.
 *
 * type="text" with inputMode="decimal" gets the plain numeric keypad, and
 * filtering as you type keeps the value parseable.
 */
type Props = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "onChange"
> & {
  value: string
  onValueChange: (value: string) => void
}

export function AmountInput({ value, onValueChange, ...props }: Props) {
  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      enterKeyHint="done"
      autoComplete="off"
      value={value}
      onChange={(event) => onValueChange(cleanAmountInput(event.target.value))}
    />
  )
}
