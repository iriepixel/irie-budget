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

import { CardBadge } from "@/components/card-badge"
import { CategoryBadge } from "@/components/category-badge"
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
import { formatAmount, formatDay, type Spending } from "@/lib/spendings"
import { cn } from "@/lib/utils"

type SortColumn = "day" | "title" | "category" | "amount"
type SortDirection = "asc" | "desc"

const SORT_LABELS: Record<SortColumn, string> = {
  day: "Day",
  title: "Title",
  category: "Category",
  amount: "Amount",
}

type Props = {
  spendings: Spending[]
  emptyMessage: string
  /** Whether the rows say which card pays them. Recurring costs only. */
  showCard?: boolean
  onEdit: (spending: Spending) => void
  onDelete: (id: string) => void
}

export function SpendingsTable({
  spendings,
  emptyMessage,
  showCard = false,
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
      // Same day shows the biggest amount first, whichever way days run.
      return factor * (a.day - b.day) || b.amount - a.amount
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
    <>
      {/* On a phone the table becomes a two-line list: tapping a row opens
          the edit dialog, and delete lives inside it. The columns that made
          the table overflow are folded into the second line. */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <span className="text-xs text-muted-foreground">Sort</span>
          <Select
            value={column}
            onValueChange={(value) => {
              setColumn(value as SortColumn)
              setDirection("asc")
            }}
          >
            <SelectTrigger size="sm" className="h-8 w-auto gap-1 border-none bg-transparent px-2 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as SortColumn[]).map((option) => (
                <SelectItem key={option} value={option}>
                  {SORT_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative after:absolute after:-inset-2"
            aria-label={direction === "asc" ? "Sorted ascending" : "Sorted descending"}
            onClick={() =>
              setDirection((current) => (current === "asc" ? "desc" : "asc"))
            }
          >
            {direction === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        </div>

        <ul>
          {sorted.map((spending) => (
            <li key={spending.id} className="border-b last:border-b-0">
              <button
                type="button"
                onClick={() => onEdit(spending)}
                aria-label={`Edit ${spending.title}`}
                className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors active:bg-muted"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex w-full items-baseline justify-between gap-3">
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="w-6 shrink-0 text-xs text-muted-foreground tabular-nums">
                      {formatDay(spending.day)}
                    </span>
                    <span className="truncate font-medium">
                      {spending.title}
                    </span>
                  </span>
                  <span className="whitespace-nowrap tabular-nums">
                    {formatAmount(spending.amount)}
                  </span>
                </span>
                  <span className="flex items-center gap-1.5 pl-8 text-xs text-muted-foreground">
                    {showCard ? (
                      <CardBadge card={spending.card} className="size-4.5" />
                    ) : null}
                    <CategoryBadge
                      category={spending.category}
                      className="px-1.5 py-0 text-[11px]"
                    />
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
            {showCard ? (
              <TableHead className="w-[40px]">
                <span className="sr-only">Card</span>
              </TableHead>
            ) : null}
            <TableHead>
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
              <TableCell className="font-medium">{spending.title}</TableCell>
              {showCard ? (
                <TableCell>
                  <CardBadge card={spending.card} />
                </TableCell>
              ) : null}
              <TableCell>
                <CategoryBadge category={spending.category} />
              </TableCell>
              <TableCell className="text-right whitespace-nowrap tabular-nums">
                {formatAmount(spending.amount)}
              </TableCell>
              <TableCell className="pr-4">
                <div className="flex justify-end gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => onEdit(spending)}
                    aria-label={`Edit ${spending.title}`}
                  >
                    <Pencil />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Delete ${spending.title}`}
                      >
                        <Trash2 />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete {spending.title}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {formatAmount(spending.amount)} on day{" "}
                          {formatDay(spending.day)}. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(spending.id)}
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
