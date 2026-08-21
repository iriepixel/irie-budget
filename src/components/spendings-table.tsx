"use client"

import { useMemo, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Pencil,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatAmount, formatDay, type Spending } from "@/lib/spendings"
import { cn } from "@/lib/utils"

type SortColumn = "day" | "title" | "category" | "amount"
type SortDirection = "asc" | "desc"

type Props = {
  spendings: Spending[]
  emptyMessage: string
  onEdit: (spending: Spending) => void
  onDelete: (id: string) => void
}

export function SpendingsTable({
  spendings,
  emptyMessage,
  onEdit,
  onDelete,
}: Props) {
  const [column, setColumn] = useState<SortColumn>("day")
  const [direction, setDirection] = useState<SortDirection>("asc")

  const sorted = useMemo(() => {
    const factor = direction === "asc" ? 1 : -1

    return [...spendings].sort((a, b) => {
      if (column === "title") return factor * a.title.localeCompare(b.title)
      if (column === "category") {
        // Same category keeps the entries in day order rather than at random.
        return factor * a.category.localeCompare(b.category) || a.day - b.day
      }
      if (column === "amount") return factor * (a.amount - b.amount)
      return factor * (a.day - b.day)
    })
  }, [spendings, column, direction])

  function toggle(next: SortColumn) {
    if (next === column) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"))
    } else {
      setColumn(next)
      setDirection("asc")
    }
  }

  if (spendings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 px-6 py-12 text-center">
        <p className="text-sm font-medium">{emptyMessage}</p>
        <p className="text-sm text-muted-foreground">
          Use the button above to add one.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[64px] pl-4">
              <SortButton
                label="Day"
                active={column === "day"}
                direction={direction}
                onClick={() => toggle("day")}
              />
            </TableHead>
            <TableHead>
              <SortButton
                label="Title"
                active={column === "title"}
                direction={direction}
                onClick={() => toggle("title")}
              />
            </TableHead>
            {/* Category is the least essential column, so it folds under the
                title on a phone rather than forcing a sideways scroll. */}
            <TableHead className="hidden sm:table-cell">
              <SortButton
                label="Category"
                active={column === "category"}
                direction={direction}
                onClick={() => toggle("category")}
              />
            </TableHead>
            <TableHead className="text-right">
              <SortButton
                label="Amount"
                active={column === "amount"}
                direction={direction}
                onClick={() => toggle("amount")}
                className="-mr-2 ml-auto"
              />
            </TableHead>
            <TableHead className="w-[80px] pr-4 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((spending) => (
            <TableRow
              key={spending.id}
              className="group even:bg-muted/50 hover:bg-muted"
            >
              <TableCell className="pl-4 text-muted-foreground tabular-nums">
                {formatDay(spending.day)}
              </TableCell>
              <TableCell className="font-medium">
                {spending.title}
                <span className="mt-1 block sm:hidden">
                  <Badge variant="secondary">{spending.category}</Badge>
                </span>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="secondary">{spending.category}</Badge>
              </TableCell>
              <TableCell className="text-right whitespace-nowrap tabular-nums">
                {formatAmount(spending.amount)}
              </TableCell>
              <TableCell className="pr-4">
                {/* Touch devices never hover, so the actions stay visible
                    below sm instead of being unreachable. */}
                <div className="flex justify-end gap-1 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => onEdit(spending)}
                    aria-label={`Edit ${spending.title}`}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(spending.id)}
                    aria-label={`Delete ${spending.title}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SortButton({
  label,
  active,
  direction,
  onClick,
  className,
}: {
  label: string
  active: boolean
  direction: SortDirection
  onClick: () => void
  className?: string
}) {
  const Icon = !active
    ? ChevronsUpDown
    : direction === "asc"
      ? ArrowUp
      : ArrowDown

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn("-ml-2 h-8 px-2 text-muted-foreground", className)}
      aria-label={`Sort by ${label.toLowerCase()}`}
    >
      {label}
      <Icon className={cn(!active && "opacity-50")} />
    </Button>
  )
}
