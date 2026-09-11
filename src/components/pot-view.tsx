"use client"

import { useOptimistic, useState, useTransition } from "react"
import { Coins, PiggyBank, TrendingUp, Wallet } from "lucide-react"

import { IncomeDialog } from "@/components/income-dialog"
import { PlannedIncome } from "@/components/planned-income"
import { TotalCard, type TotalExtra } from "@/components/total-card"
import { PotDialog } from "@/components/pot-dialog"
import { addIncome, deleteIncome, setPot, updateIncome } from "@/app/actions"
import { report } from "@/lib/report"
import { sumAmounts } from "@/lib/spendings"
import { potMeta, type Pot, type PotId, type Pots } from "@/lib/pots"
import type { Income } from "@/lib/income"

/** Two identical piggy banks stacked read as one card rendered twice. */
const POT_ICONS: Record<PotId, React.ComponentType<{ className?: string }>> = {
  household: PiggyBank,
  flex: Wallet,
  sergej: Coins,
}

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

  const plannedTotal = sumAmounts(shownIncomes)

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
   * The lines under the savings figure: the money actually held, what is
   * still to come, and last the only emphasised line, the two added up.
   */
  function householdExtras(): TotalExtra[] {
    const { saved } = shownPots.household
    const flex = shownPots.flex.saved
    const sergej = shownPots.sergej.saved

    const extras: TotalExtra[] = []

    /**
     * A line only earns its place when it says something the headline and
     * the lines above it do not: an empty pot would have it repeating the
     * savings figure, or a line already on the card.
     */
    function add(label: string, total: number, emphasis = false) {
      if (total === saved) return
      if (extras.some((extra) => extra.total === total)) return

      extras.push({ label, total, emphasis })
    }

    add("Saved + Flex + Sergej", saved + flex + sergej)
    // Pushed directly, not through add(): this is the addend itself rather
    // than a running total, so the total below can be read off the two
    // lines above it instead of taken on trust.
    if (plannedTotal > 0) extras.push({ label: "Planned", total: plannedTotal })
    add("Total", saved + flex + sergej + plannedTotal, true)

    return extras
  }

  return (
    <div className="space-y-6">
      <TotalCard
        title={potMeta("household").title}
        label={potMeta("household").label}
        icon={POT_ICONS.household}
        amount={shownPots.household.saved}
        goal={shownPots.household.goal}
        extras={householdExtras()}
        onEdit={() => setEditingPot("household")}
      />

      {/* The smaller figures sit side by side once there is room, so the
          page does not read as a column of identical cards. Three abreast
          only below a wide enough viewport to keep a 4xl amount inside
          its column. */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* No Update button: this figure is the table below added up, so
            there is nothing here to type into. */}
        <TotalCard
          compact
          title="Planned income"
          label="Expected to arrive"
          icon={TrendingUp}
          amount={plannedTotal}
        />

        <TotalCard
          compact
          title={potMeta("flex").title}
          label={potMeta("flex").label}
          icon={POT_ICONS.flex}
          amount={shownPots.flex.saved}
          onEdit={() => setEditingPot("flex")}
        />

        <TotalCard
          compact
          title={potMeta("sergej").title}
          label={potMeta("sergej").label}
          icon={POT_ICONS.sergej}
          amount={shownPots.sergej.saved}
          onEdit={() => setEditingPot("sergej")}
        />
      </div>

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
