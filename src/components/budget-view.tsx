"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { HouseholdSummary } from "@/components/household-summary"
import { LegacyImport } from "@/components/legacy-import"
import { PersonBudget } from "@/components/person-budget"
import { SalaryDialog } from "@/components/salary-dialog"
import { SpendingDialog } from "@/components/spending-dialog"
import { Button } from "@/components/ui/button"
import {
  addSpending,
  deleteSpending,
  setSalary,
  updateSpending,
} from "@/app/actions"
import { signOut } from "@/lib/auth-client"
import {
  OWNERS,
  type Owner,
  type Salaries,
  type Spending,
  type SpendingKind,
} from "@/lib/spendings"

/** Which person a dialog is currently acting on. */
type Target = { owner: Owner; kind: SpendingKind; spending: Spending | null }

type Props = {
  spendings: Spending[]
  salaries: Salaries
  userName: string
}

export function BudgetView({ spendings, salaries, userName }: Props) {
  const [target, setTarget] = useState<Target>({
    owner: "jev",
    kind: "recurring",
    spending: null,
  })
  const [spendingOpen, setSpendingOpen] = useState(false)
  const [salaryOwner, setSalaryOwner] = useState<Owner | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const byOwner = useMemo(
    () =>
      Object.fromEntries(
        OWNERS.map(({ id }) => [id, spendings.filter((s) => s.owner === id)])
      ) as Record<Owner, Spending[]>,
    [spendings]
  )

  function handleSpendingSubmit(values: Omit<Spending, "id" | "kind" | "owner">) {
    const { owner, kind, spending } = target

    startTransition(async () => {
      if (spending) {
        await updateSpending(spending.id, { ...values, kind, owner })
      } else {
        await addSpending({ ...values, kind, owner })
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSpending(id)
    })
  }

  function handleSalarySubmit(amount: number) {
    if (!salaryOwner) return

    startTransition(async () => {
      await setSalary({ owner: salaryOwner, amount })
    })
  }

  const salaryName = OWNERS.find(({ id }) => id === salaryOwner)?.name ?? ""

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 md:py-16">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Spendings</h1>
          <p className="text-sm text-muted-foreground">
            What repeats every month, and what only counts for this one.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {userName}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              signOut({
                fetchOptions: { onSuccess: () => router.push("/sign-in") },
              })
            }
          >
            <LogOut />
            Sign out
          </Button>
        </div>
      </div>

      <LegacyImport hasData={spendings.length > 0} />

      <div
        className={
          pending ? "opacity-60 transition-opacity" : "transition-opacity"
        }
      >
        <div className="grid gap-10 md:grid-cols-2 md:gap-8">
          {OWNERS.map(({ id, name }) => (
            <PersonBudget
              key={id}
              name={name}
              salary={salaries[id]}
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
          ))}
        </div>

        <div className="mt-10">
          <HouseholdSummary salaries={salaries} spendings={spendings} />
        </div>
      </div>

      <SalaryDialog
        open={salaryOwner !== null}
        onOpenChange={(open) => {
          if (!open) setSalaryOwner(null)
        }}
        name={salaryName}
        salary={salaryOwner ? salaries[salaryOwner] : 0}
        onSubmit={handleSalarySubmit}
      />

      <SpendingDialog
        open={spendingOpen}
        onOpenChange={setSpendingOpen}
        spending={target.spending}
        kind={target.kind}
        name={OWNERS.find(({ id }) => id === target.owner)?.name ?? ""}
        onSubmit={handleSpendingSubmit}
      />
    </main>
  )
}
