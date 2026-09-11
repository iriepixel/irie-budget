"use client"

import { useId } from "react"

import { Label } from "@/components/ui/label"
import {
  ROW_CLASS,
  ROW_COLOR_LABELS,
  ROW_COLORS,
  SWATCH_CLASS,
  type RowColor,
} from "@/lib/row-color"
import { cn } from "@/lib/utils"

type Props = {
  value: RowColor
  onChange: (color: RowColor) => void
  /** What the row keeps when no colour is picked, said in the preview. */
  noneHint?: string
}

export function RowColorPicker({
  value,
  onChange,
  noneHint = "No colour — the row keeps the table's own shading",
}: Props) {
  const labelId = useId()

  return (
    <div className="grid gap-3">
      <Label id={labelId}>Row colour</Label>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="flex flex-wrap items-center gap-2"
      >
        {ROW_COLORS.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={value === option}
            aria-label={ROW_COLOR_LABELS[option]}
            title={ROW_COLOR_LABELS[option]}
            onClick={() => onChange(option)}
            className={cn(
              "size-9 rounded-md border outline-none",
              SWATCH_CLASS[option],
              value === option &&
                "ring-2 ring-ring ring-offset-2 ring-offset-background"
            )}
          />
        ))}
      </div>
      {/* A swatch alone does not say what it will look like in the list,
          so show the row as it will read. */}
      <p
        className={cn(
          "rounded-md px-3 py-2 text-sm text-muted-foreground",
          value === "none" ? "bg-muted/50" : ROW_CLASS[value]
        )}
      >
        {value === "none" ? noneHint : `${ROW_COLOR_LABELS[value]} row`}
      </p>
    </div>
  )
}
