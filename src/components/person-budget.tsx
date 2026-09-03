"use client"

import { useState } from "react"
import { Pencil, Plus } from "lucide-react"

import { SpendMeter } from "@/components/spend-meter"
import { SpendingsTable } from "@/components/spendings-table"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
  CARDS,
  filterByCard,
  formatAmount,
  sumAmounts,
  type CardTab,
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
  /** Whether this person's recurring costs are split across two cards. */
  showCards?: boolean
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
  showCards = false,
  onEditSalary,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const [cardTab, setCardTab] = useState<CardTab>("all")

  const recurring = spendings.filter((s) => s.kind === "recurring")
  const oneOff = spendings.filter((s) => s.kind === "oneOff")
  const food = spendings.filter((s) => s.kind === "food")

  const recurringTotal = sumAmounts(recurring)
  const shownRecurring = showCards ? filterByCard(recurring, cardTab) : recurring
  const shownRecurringTotal = showCards
    ? sumAmounts(shownRecurring)
    : recurringTotal
  const tabbedCard = CARDS.find(({ id }) => id === cardTab)
  const oneOffTotal = sumAmounts(oneOff)
  const foodTotal = sumAmounts(food)
  const monthTotal = sumAmounts(spendings)
  const remaining = salary - monthTotal

  const recurringTable = (
    <SpendingsTable
      spendings={shownRecurring}
      emptyMessage={
        tabbedCard
          ? `Nothing on the ${tabbedCard.name} card`
          : "No recurring spendings yet"
      }
      showCard={showCards}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )

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
          {/* £0.00 reads as "salary is zero"; an unset salary is different. */}
          {salary > 0 ? (
            <CardTitle className="text-3xl whitespace-nowrap tabular-nums sm:text-4xl">
              {formatAmount(salary)}
            </CardTitle>
          ) : (
            <CardTitle className="text-3xl text-muted-foreground sm:text-4xl">
              Not set
            </CardTitle>
          )}
          <CardAction>
            <Button variant="outline" size="sm" onClick={onEditSalary}>
              {salary ? <Pencil /> : <Plus />}
              {salary ? "Edit" : "Add"}
            </Button>
          </CardAction>
        </CardHeader>
        {salary > 0 ? (
          <CardContent>
            <SpendMeter
              salary={salary}
              byKind={{
                recurring: recurringTotal,
                oneOff: oneOffTotal,
                food: foodTotal,
              }}
              total={monthTotal}
            />
          </CardContent>
        ) : null}
      </Card>

      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="border-b py-5">
          <CardTitle>Recurring</CardTitle>
          <CardDescription>
            Repeats every month · {shownRecurring.length}{" "}
            {shownRecurring.length === 1 ? "entry" : "entries"}
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
        {showCards ? (
          <Tabs
            value={cardTab}
            onValueChange={(value) => setCardTab(value as CardTab)}
            className="gap-0"
          >
            <div className="border-b px-4 py-3">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                {CARDS.map(({ id, name: cardName }) => (
                  <TabsTrigger key={id} value={id}>
                    {cardName}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {/* One panel, always the selected tab, so the table keeps its
                sort across a switch instead of remounting per card. */}
            <TabsContent value={cardTab} className="min-w-0">
              {recurringTable}
            </TabsContent>
          </Tabs>
        ) : (
          <CardContent className="px-0">{recurringTable}</CardContent>
        )}
        <CardFooter className="justify-between border-t bg-muted/50 py-4">
          <span className="text-sm font-medium">
            {tabbedCard ? `Total ${tabbedCard.name} card` : "Total recurring"}
          </span>
          <span className="text-lg font-semibold whitespace-nowrap tabular-nums">
            {formatAmount(shownRecurringTotal)}
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
            <span className="text-lg font-semibold whitespace-nowrap tabular-nums">
              {formatAmount(foodTotal)}
            </span>
          </CardFooter>
        </Card>
      ) : null}

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
          <span className="text-lg font-semibold whitespace-nowrap tabular-nums">
            {formatAmount(oneOffTotal)}
          </span>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Where {name}&apos;s salary goes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Salary</span>
            <span className="tabular-nums">{formatAmount(salary)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Recurring</span>
            <span className="tabular-nums">−{formatAmount(recurringTotal)}</span>
          </div>
          {showFood ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Food</span>
              <span className="tabular-nums">−{formatAmount(foodTotal)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">This month only</span>
            <span className="tabular-nums">−{formatAmount(oneOffTotal)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-3 text-sm">
            <span className="font-medium">Total spendings</span>
            <span className="font-medium tabular-nums">
              {formatAmount(monthTotal)}
            </span>
          </div>
          {salary > 0 ? (
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
          ) : (
            <p className="border-t pt-3 text-sm text-muted-foreground">
              Add {name}&apos;s salary to see what is left to spend.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
