"use client"

import { Plus } from "lucide-react"

import { IncomeTable } from "@/components/income-table"
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
import { formatAmount, sumAmounts } from "@/lib/spendings"
import type { Income } from "@/lib/income"

type Props = {
  incomes: Income[]
  onAdd: () => void
  onEdit: (income: Income) => void
  onDelete: (id: string) => void
}

export function PlannedIncome({ incomes, onAdd, onEdit, onDelete }: Props) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="border-b py-5">
        <CardTitle>Planned income</CardTitle>
        <CardDescription>
          Money expected to arrive · {incomes.length}{" "}
          {incomes.length === 1 ? "entry" : "entries"}
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus />
            Add
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <IncomeTable incomes={incomes} onEdit={onEdit} onDelete={onDelete} />
      </CardContent>
      <CardFooter className="justify-between border-t bg-muted/50 py-4">
        <span className="text-sm font-medium">Total planned income</span>
        <span className="text-lg font-semibold whitespace-nowrap tabular-nums">
          {formatAmount(sumAmounts(incomes))}
        </span>
      </CardFooter>
    </Card>
  )
}
