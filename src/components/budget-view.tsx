"use client"

import { useMemo, useOptimistic, useState, useTransition } from "react"
import { report } from "@/lib/report"

import { HouseholdSummary } from "@/components/household-summary"
import { LegacyImport } from "@/components/legacy-import"
import { PersonBudget } from "@/components/person-budget"
import { SalaryDialog } from "@/components/salary-dialog"
import { SpendingDialog } from "@/components/spending-dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  addSpending,
  deleteSpending,
  setSalary,
  updateSpending,
} from "@/app/actions"
import {
  OWNERS,
  type Owner,
  type Salaries,
  type Spending,
  type SpendingKind,
} from "@/lib/spendings"

/** A write that has been sent but not yet confirmed by the server. */
type PendingWrite =
  | { type: "add"; spending: Spending }
  | { type: "update"; spending: Spending }
  | { type: "delete"; id: string }

function applyWrite(current: Spending[], write: PendingWrite): Spending[] {
  switch (write.type) {
    case "add":
      return [...current, write.spending]
    case "update":
      return current.map((s) =>
        s.id === write.spending.id ? write.spending : s
      )
    case "delete":
      return current.filter((s) => s.id !== write.id)
  }
}

/** Which person a dialog is currently acting on. */
type Target = { owner: Owner; kind: SpendingKind; spending: Spending | null }

type Props = {
  spendings: Spending[]
  salaries: Salaries
}

export function BudgetView({ spendings, salaries }: Props) {
  const [target, setTarget] = useState<Target>({
    owner: "jev",
    kind: "recurring",
    spending: null,
  })
  const [spendingOpen, setSpendingOpen] = useState(false)
  const [salaryOwner, setSalaryOwner] = useState<Owner | null>(null)
  const [, startTransition] = useTransition()

  // Show the result immediately; the server action revalidates behind it.
  const [shownSpendings, addWrite] = useOptimistic(spendings, applyWrite)
  const [shownSalaries, setShownSalary] = useOptimistic(
    salaries,
    (current: Salaries, next: { owner: Owner; amount: number }) => ({
      ...current,
      [next.owner]: next.amount,
    })
  )

  const byOwner = useMemo(
    () =>
      Object.fromEntries(
        OWNERS.map(({ id }) => [
          id,
          shownSpendings.filter((s) => s.owner === id),
        ])
      ) as Record<Owner, Spending[]>,
    [shownSpendings]
  )

  function handleSpendingSubmit(values: Omit<Spending, "id" | "kind" | "owner">) {
    const { owner, kind, spending } = target

    startTransition(async () => {
      if (spending) {
        addWrite({
          type: "update",
          spending: { ...values, id: spending.id, kind, owner },
        })
        await report(
          () => updateSpending(spending.id, { ...values, kind, owner }),
          `Could not save ${values.title}`
        )
      } else {
        // A throwaway id, replaced when the server data arrives.
        addWrite({
          type: "add",
          spending: { ...values, id: crypto.randomUUID(), kind, owner },
        })
        await report(
          () => addSpending({ ...values, kind, owner }),
          `Could not add ${values.title}`
        )
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      addWrite({ type: "delete", id })
      await report(() => deleteSpending(id), "Could not delete that spending")
    })
  }

  function handleSalarySubmit(amount: number) {
    if (!salaryOwner) return

    startTransition(async () => {
      setShownSalary({ owner: salaryOwner, amount })
      await report(
        () => setSalary({ owner: salaryOwner, amount }),
        "Could not save the salary"
      )
    })
  }

  const salaryName = OWNERS.find(({ id }) => id === salaryOwner)?.name ?? ""

  function renderPerson(id: Owner, name: string) {
    return (
      <PersonBudget
        key={id}
        name={name}
        salary={shownSalaries[id]}
        spendings={byOwner[id]}
        showFood={id === "olia"}
        onEditSalary={() => setSalaryOwner(id)}
        onAdd={(kind) => {
          setTarget({ owner: id, kind, spending: null })
          setSpendingOpen(true)
        }}
        onEdit={(spending) => {
          setTarget({
            owner: spending.owner,
            kind: spending.kind,
            spending,
          })
          setSpendingOpen(true)
        }}
        onDelete={handleDelete}
      />
    )
  }

  return (
    <>
      <LegacyImport hasData={shownSpendings.length > 0} />

      <div>
        {/* Two columns side by side once there is room for them. */}
        <div className="hidden gap-8 md:grid md:grid-cols-2 [&>*]:min-w-0">
          {OWNERS.map(({ id, name }) => renderPerson(id, name))}
        </div>

        {/* On a phone the columns become tabs, so neither is squeezed. */}
        <Tabs defaultValue={OWNERS[0].id} className="gap-6 md:hidden">
          <TabsList className="grid w-full grid-cols-2">
            {OWNERS.map(({ id, name }) => (
              <TabsTrigger key={id} value={id}>
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
          {OWNERS.map(({ id, name }) => (
            <TabsContent key={id} value={id} className="min-w-0">
              {renderPerson(id, name)}
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-10">
          <HouseholdSummary
            salaries={shownSalaries}
            spendings={shownSpendings}
          />
        </div>
      </div>

      <SalaryDialog
        open={salaryOwner !== null}
        onOpenChange={(open) => {
          if (!open) setSalaryOwner(null)
        }}
        name={salaryName}
        salary={salaryOwner ? shownSalaries[salaryOwner] : 0}
        onSubmit={handleSalarySubmit}
      />

      <SpendingDialog
        open={spendingOpen}
        onOpenChange={setSpendingOpen}
        spending={target.spending}
        kind={target.kind}
        name={OWNERS.find(({ id }) => id === target.owner)?.name ?? ""}
        onDelete={handleDelete}
        onSubmit={handleSpendingSubmit}
      />
    </>
  )
}
