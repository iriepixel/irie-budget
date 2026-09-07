"use client"

import { useOptimistic, useState, useTransition } from "react"

import { IncomeDialog } from "@/components/income-dialog"
import { PlannedIncome } from "@/components/planned-income"
import { PotCard, type PotExtra } from "@/components/pot-card"
import { PotDialog } from "@/components/pot-dialog"
import { addIncome, deleteIncome, setPot, updateIncome } from "@/app/actions"
import { report } from "@/lib/report"
import { sumAmounts } from "@/lib/spendings"
import { POTS, type Pot, type PotId, type Pots } from "@/lib/pots"
import type { Income } from "@/lib/income"

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
  pots: Pots
  incomes: Income[]
}

/**
 * Owns every write on the pot page, the way BudgetView does for the main
 * page: the cards and the table below are presentation only.
 */
export function PotView({ pots, incomes }: Props) {
  const [editingPot, setEditingPot] = useState<PotId | null>(null)
  const [incomeOpen, setIncomeOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [, startTransition] = useTransition()

  // Show the result immediately; the server action revalidates behind it.
  const [shownPots, setShownPot] = useOptimistic(
    pots,
    (current: Pots, next: { id: PotId; pot: Pot }) => ({
      ...current,
      [next.id]: next.pot,
    })
  )
  const [shownIncomes, addWrite] = useOptimistic(incomes, applyWrite)

  function handlePotSubmit(id: PotId, next: Pot) {
    startTransition(async () => {
      setShownPot({ id, pot: next })
      await report(
        () => setPot({ id, amount: next.saved, goal: next.goal }),
        "Could not save the pot"
      )
    })
  }

  function handleIncomeSubmit(values: Omit<Income, "id">) {
    startTransition(async () => {
      if (editingIncome) {
        addWrite({
          type: "update",
          income: { ...values, id: editingIncome.id },
        })
        await report(
          () => updateIncome(editingIncome.id, values),
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

  /**
   * Only the household pot totals anything up. The first two lines each add
   * one thing to it rather than stacking, so they answer two separate
   * questions; the last adds up everything. A contribution of zero gets no
   * line, and the total is only worth a line once there are two things to
   * add: with one it would repeat the line above it.
   */
  function extrasFor(id: PotId): PotExtra[] {
    if (id !== "household") return []

    const { saved } = shownPots.household
    const flex = shownPots.flex.saved
    const planned = sumAmounts(shownIncomes)

    return [
      ...(flex > 0 ? [{ label: "With Flex", total: saved + flex }] : []),
      ...(planned > 0
        ? [{ label: "With planned income", total: saved + planned }]
        : []),
      ...(flex > 0 && planned > 0
        ? [{ label: "Total", total: saved + flex + planned, emphasis: true }]
        : []),
    ]
  }

  return (
    <div className="space-y-6">
      {POTS.map(({ id }) => (
        <PotCard
          key={id}
          id={id}
          pot={shownPots[id]}
          extras={extrasFor(id)}
          onEdit={() => setEditingPot(id)}
        />
      ))}

      <PlannedIncome
        incomes={shownIncomes}
        onAdd={() => {
          setEditingIncome(null)
          setIncomeOpen(true)
        }}
        onEdit={(income) => {
          setEditingIncome(income)
          setIncomeOpen(true)
        }}
        onDelete={handleIncomeDelete}
      />

      {/* Keyed by pot, so switching pots remounts the form rather than
          leaving the previous pot's figures in the inputs. */}
      {editingPot ? (
        <PotDialog
          key={editingPot}
          open
          onOpenChange={(open) => {
            if (!open) setEditingPot(null)
          }}
          id={editingPot}
          pot={shownPots[editingPot]}
          onSubmit={(next) => handlePotSubmit(editingPot, next)}
        />
      ) : null}

      <IncomeDialog
        open={incomeOpen}
        onOpenChange={setIncomeOpen}
        income={editingIncome}
        onDelete={handleIncomeDelete}
        onSubmit={handleIncomeSubmit}
      />
    </div>
  )
}
