"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { HouseholdSummary } from "@/components/household-summary"
import { LegacyImport } from "@/components/legacy-import"
import { PersonBudget } from "@/components/person-budget"
import { ThemeToggle } from "@/components/theme-toggle"
import { SalaryDialog } from "@/components/salary-dialog"
import { SpendingDialog } from "@/components/spending-dialog"
import { Button } from "@/components/ui/button"
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

  function renderPerson(id: Owner, name: string) {
    return (
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
    )
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-16">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            IRIE Budget
          </h1>
          <p className="text-sm text-muted-foreground">
            Every pound has a plan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {userName}
          </span>
          <ThemeToggle />
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
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>

      <LegacyImport hasData={spendings.length > 0} />

      <div
        className={
          pending ? "opacity-60 transition-opacity" : "transition-opacity"
        }
      >
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
