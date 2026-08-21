"use client"

import { Pencil, Plus } from "lucide-react"

import { SpendingsTable } from "@/components/spendings-table"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatAmount,
  sumAmounts,
  type Spending,
  type SpendingKind,
} from "@/lib/spendings"
import { cn } from "@/lib/utils"

type Props = {
  name: string
  salary: number
  /** This person's spendings, already sorted by day. */
  spendings: Spending[]
  /** Whether this person keeps a separate food budget. */
  showFood?: boolean
  onEditSalary: () => void
  onAdd: (kind: SpendingKind) => void
  onEdit: (spending: Spending) => void
  onDelete: (id: string) => void
}

export function PersonBudget({
  name,
  salary,
  spendings,
  showFood = false,
  onEditSalary,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const recurring = spendings.filter((s) => s.kind === "recurring")
  const oneOff = spendings.filter((s) => s.kind === "oneOff")
  const food = spendings.filter((s) => s.kind === "food")

  const recurringTotal = sumAmounts(recurring)
  const oneOffTotal = sumAmounts(oneOff)
  const foodTotal = sumAmounts(food)
  const monthTotal = sumAmounts(spendings)
  const remaining = salary - monthTotal

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          {name}&apos;s spendings
        </h2>
        <p className="text-sm text-muted-foreground">
          {spendings.length} {spendings.length === 1 ? "entry" : "entries"} this
          month
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>Monthly salary</CardDescription>
          <CardTitle className="text-2xl tabular-nums">
            {formatAmount(salary)}
          </CardTitle>
          <CardAction>
            <Button variant="outline" size="sm" onClick={onEditSalary}>
              {salary ? <Pencil /> : <Plus />}
              {salary ? "Edit" : "Add"}
            </Button>
          </CardAction>
        </CardHeader>
      </Card>

      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="border-b py-5">
          <CardTitle>Recurring</CardTitle>
          <CardDescription>
            Repeats every month · {recurring.length}{" "}
            {recurring.length === 1 ? "entry" : "entries"}
          </CardDescription>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAdd("recurring")}
            >
              <Plus />
              Add
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          <SpendingsTable
            spendings={recurring}
            emptyMessage="No recurring spendings yet"
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </CardContent>
        <CardFooter className="justify-between border-t bg-muted/50 py-4">
          <span className="text-sm font-medium">Total recurring</span>
          <span className="text-lg font-semibold tabular-nums">
            {formatAmount(recurringTotal)}
          </span>
        </CardFooter>
      </Card>

      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="border-b py-5">
          <CardTitle>This month only</CardTitle>
          <CardDescription>
            One-off costs · {oneOff.length}{" "}
            {oneOff.length === 1 ? "entry" : "entries"}
          </CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" onClick={() => onAdd("oneOff")}>
              <Plus />
              Add
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          <SpendingsTable
            spendings={oneOff}
            emptyMessage="Nothing extra this month"
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </CardContent>
        <CardFooter className="justify-between border-t bg-muted/50 py-4">
          <span className="text-sm font-medium">Total this month only</span>
          <span className="text-lg font-semibold tabular-nums">
            {formatAmount(oneOffTotal)}
          </span>
        </CardFooter>
      </Card>

      {showFood ? (
        <Card className="gap-0 overflow-hidden py-0">
          <CardHeader className="border-b py-5">
            <CardTitle>Food</CardTitle>
            <CardDescription>
              The food budget · {food.length}{" "}
              {food.length === 1 ? "entry" : "entries"}
            </CardDescription>
            <CardAction>
              <Button variant="outline" size="sm" onClick={() => onAdd("food")}>
                <Plus />
                Add
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <SpendingsTable
              spendings={food}
              emptyMessage="No food spendings yet"
                onEdit={onEdit}
              onDelete={onDelete}
            />
          </CardContent>
          <CardFooter className="justify-between border-t bg-muted/50 py-4">
            <span className="text-sm font-medium">Total food</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatAmount(foodTotal)}
            </span>
          </CardFooter>
        </Card>
      ) : null}

      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Salary</span>
            <span className="tabular-nums">{formatAmount(salary)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Recurring</span>
            <span className="tabular-nums">−{formatAmount(recurringTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">This month only</span>
            <span className="tabular-nums">−{formatAmount(oneOffTotal)}</span>
          </div>
          {showFood ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Food</span>
              <span className="tabular-nums">−{formatAmount(foodTotal)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-t pt-3 text-sm">
            <span className="font-medium">Total spendings</span>
            <span className="font-medium tabular-nums">
              {formatAmount(monthTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="font-medium">
              {remaining < 0 ? "Over budget by" : "Left to spend"}
            </span>
            <span
              className={cn(
                "text-2xl font-semibold tabular-nums",
                remaining < 0
                  ? "text-destructive"
                  : "text-emerald-600 dark:text-emerald-500"
              )}
            >
              {formatAmount(Math.abs(remaining))}
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
