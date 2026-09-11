"use client"

import { useMemo, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  ChevronsUpDown,
  Pencil,
  Trash2,
} from "lucide-react"

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
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatIncomeDate,
  INCOME_COLUMNS,
  INCOME_COLUMN_LABELS,
  monthBands,
  sortIncome,
  type Income,
  type IncomeColumn,
} from "@/lib/income"
import { rowClass } from "@/lib/row-color"
import { formatAmount } from "@/lib/spendings"
import { cn } from "@/lib/utils"

type SortDirection = "asc" | "desc"

type Props = {
  incomes: Income[]
  onEdit: (income: Income) => void
  onDelete: (id: string) => void
}

/**
 * The spendings table's twin, for planned income: same sorting, same
 * tap-to-edit list on a phone, a calendar date in place of the day column
 * and no category to show.
 */
export function IncomeTable({ incomes, onEdit, onDelete }: Props) {
  const [column, setColumn] = useState<IncomeColumn>("date")
  const [direction, setDirection] = useState<SortDirection>("asc")

  const sorted = useMemo(
    () => sortIncome(incomes, column, direction),
    [incomes, column, direction]
  )

  const bands = useMemo(() => monthBands(sorted), [sorted])

  /**
   * The row tint. A colour picked by hand wins outright, since the point of
   * picking one is that the row stands out. Left to itself the row bands by
   * month in date order, so the eye can see where one month ends, and falls
   * back to plain zebra under any other sort.
   */
  function tint(income: Income, index: number) {
    const shaded = column === "date" ? bands[index] === 1 : index % 2 === 1

    return rowClass(income.color, cn("hover:bg-muted", shaded && "bg-muted/50"))
  }

  function toggle(next: IncomeColumn) {
    if (next === column) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"))
    } else {
      setColumn(next)
      setDirection("asc")
    }
  }

  if (incomes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 px-6 py-12 text-center">
        <p className="text-sm font-medium">No planned income yet</p>
        <p className="text-sm text-muted-foreground">
          Use the button above to add one.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* On a phone the table becomes a two-line list: tapping a row opens
          the edit dialog, and delete lives inside it. */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <span className="text-xs text-muted-foreground">Sort</span>
          <Select
            value={column}
            onValueChange={(value) => {
              setColumn(value as IncomeColumn)
              setDirection("asc")
            }}
          >
            <SelectTrigger
              size="sm"
              className="h-8 w-auto gap-1 border-none bg-transparent px-2 shadow-none"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCOME_COLUMNS.map((option) => (
                <SelectItem key={option} value={option}>
                  {INCOME_COLUMN_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative after:absolute after:-inset-2"
            aria-label={
              direction === "asc" ? "Sorted ascending" : "Sorted descending"
            }
            onClick={() =>
              setDirection((current) => (current === "asc" ? "desc" : "asc"))
            }
          >
            {direction === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        </div>

        <ul>
          {sorted.map((income, index) => (
            <li
              key={income.id}
              className={cn("border-b last:border-b-0", tint(income, index))}
            >
              <button
                type="button"
                onClick={() => onEdit(income)}
                aria-label={`Edit ${income.source}`}
                className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors active:bg-muted"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="flex w-full items-baseline justify-between gap-3">
                    <span className="truncate font-medium">
                      {income.source}
                    </span>
                    <span className="whitespace-nowrap tabular-nums">
                      {formatAmount(income.amount)}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatIncomeDate(income.date)}
                  </span>
                </span>
                {/* The mark that says a row opens; without it tap-to-edit
                    is invisible, and delete lives behind it. */}
                <ChevronRight
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px] pl-4">
                <SortButton
                  label="Date"
                  active={column === "date"}
                  direction={direction}
                  onClick={() => toggle("date")}
                />
              </TableHead>
              <TableHead>
                <SortButton
                  label="Source"
                  active={column === "source"}
                  direction={direction}
                  onClick={() => toggle("source")}
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
            {sorted.map((income, index) => (
              <TableRow
                key={income.id}
                className={cn("group", tint(income, index))}
              >
                <TableCell className="pl-4 whitespace-nowrap text-muted-foreground tabular-nums">
                  {formatIncomeDate(income.date)}
                </TableCell>
                <TableCell className="font-medium">{income.source}</TableCell>
                <TableCell className="text-right whitespace-nowrap tabular-nums">
                  {formatAmount(income.amount)}
                </TableCell>
                <TableCell className="pr-4">
                  <div className="flex justify-end gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onEdit(income)}
                      aria-label={`Edit ${income.source}`}
                    >
                      <Pencil />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Delete ${income.source}`}
                        >
                          <Trash2 />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete {income.source}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {formatAmount(income.amount)} on{" "}
                            {formatIncomeDate(income.date)}. This cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(income.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
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
