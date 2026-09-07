"use client"

import { useOptimistic, useState, useTransition } from "react"

import { IncomeDialog } from "@/components/income-dialog"
import { PlannedIncome } from "@/components/planned-income"
import { PotCard } from "@/components/pot-card"
import { PotDialog } from "@/components/pot-dialog"
import {
  addIncome,
  deleteIncome,
  setPot,
  updateIncome,
} from "@/app/actions"
import { report } from "@/lib/report"
import { sumAmounts } from "@/lib/spendings"
import type { Income } from "@/lib/income"
import type { Pot } from "@/lib/queries"

/** A write that has been sent but not yet confirmed by the server. */
type PendingWrite =
  | { type: "add"; income: Income }
  | { type: "update"; income: Income }
  | { type: "delete"; id: string }

function applyWrite(current: Income[], write: PendingWrite): Income[] {
  switch (write.type) {
    case "add":
      return [...current, write.income]
    case "update":
      return current.map((i) => (i.id === write.income.id ? write.income : i))
    case "delete":
      return current.filter((i) => i.id !== write.id)
  }
}

type Props = {
  pot: Pot
  incomes: Income[]
}

/**
 * Owns every write on the pot page. The planned-income list lives here
 * rather than in the card below because the pot card adds its total in:
 * two copies of that state would leave the combined figure a round-trip
 * behind the table it is summing.
 */
export function PotView({ pot, incomes }: Props) {
  const [potOpen, setPotOpen] = useState(false)
  const [incomeOpen, setIncomeOpen] = useState(false)
  const [editing, setEditing] = useState<Income | null>(null)
  const [, startTransition] = useTransition()

  // Show the result immediately; the server action revalidates behind it.
  const [shownPot, setShownPot] = useOptimistic(pot)
  const [shownIncomes, addWrite] = useOptimistic(incomes, applyWrite)

  function handleIncomeSubmit(values: Omit<Income, "id">) {
    startTransition(async () => {
      if (editing) {
        addWrite({ type: "update", income: { ...values, id: editing.id } })
        await report(
          () => updateIncome(editing.id, values),
          `Could not save ${values.source}`
        )
      } else {
        // A throwaway id, replaced when the server data arrives.
        addWrite({
          type: "add",
          income: { ...values, id: crypto.randomUUID() },
        })
        await report(() => addIncome(values), `Could not add ${values.source}`)
      }
    })
  }

  function handleIncomeDelete(id: string) {
    startTransition(async () => {
      addWrite({ type: "delete", id })
      await report(() => deleteIncome(id), "Could not delete that income")
    })
  }

  return (
    <div className="space-y-6">
      <PotCard
        pot={shownPot}
        plannedIncome={sumAmounts(shownIncomes)}
        onEdit={() => setPotOpen(true)}
      />

      <PlannedIncome
        incomes={shownIncomes}
        onAdd={() => {
          setEditing(null)
          setIncomeOpen(true)
        }}
        onEdit={(income) => {
          setEditing(income)
          setIncomeOpen(true)
        }}
        onDelete={handleIncomeDelete}
      />

      <PotDialog
        open={potOpen}
        onOpenChange={setPotOpen}
        pot={shownPot}
        onSubmit={(next) =>
          startTransition(async () => {
            setShownPot(next)
            await report(
              () => setPot({ amount: next.saved, goal: next.goal }),
              "Could not save the pot"
            )
          })
        }
      />

      <IncomeDialog
        open={incomeOpen}
        onOpenChange={setIncomeOpen}
        income={editing}
        onDelete={handleIncomeDelete}
        onSubmit={handleIncomeSubmit}
      />
    </div>
  )
}
