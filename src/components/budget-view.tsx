"use client"

import { useMemo, useOptimistic, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChartPie, LogOut, PiggyBank } from "lucide-react"

import { HouseholdSummary } from "@/components/household-summary"
import { LegacyImport } from "@/components/legacy-import"
import { PersonBudget } from "@/components/person-budget"
import { ThemeToggle } from "@/components/theme-toggle"
import { SalaryDialog } from "@/components/salary-dialog"
import { SpendingDialog } from "@/components/spending-dialog"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
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

/** Shown until the picture loads, or when the account has none. */
function initials(name: string) {
  const letters = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")

  return letters.toUpperCase() || "?"
}

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
  user: { name: string; image: string | null }
}

export function BudgetView({ spendings, salaries, user }: Props) {
  const [target, setTarget] = useState<Target>({
    owner: "jev",
    kind: "recurring",
    spending: null,
  })
  const [spendingOpen, setSpendingOpen] = useState(false)
  const [salaryOwner, setSalaryOwner] = useState<Owner | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

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
        await updateSpending(spending.id, { ...values, kind, owner })
      } else {
        // A throwaway id, replaced when the server data arrives.
        addWrite({
          type: "add",
          spending: { ...values, id: crypto.randomUUID(), kind, owner },
        })
        await addSpending({ ...values, kind, owner })
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      addWrite({ type: "delete", id })
      await deleteSpending(id)
    })
  }

  function handleSalarySubmit(amount: number) {
    if (!salaryOwner) return

    startTransition(async () => {
      setShownSalary({ owner: salaryOwner, amount })
      await setSalary({ owner: salaryOwner, amount })
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
          <Avatar className="size-8">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/categories" aria-label="Spending by category">
              <ChartPie />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/pot" aria-label="Savings pot">
              <PiggyBank />
            </Link>
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={() =>
              signOut({
                fetchOptions: { onSuccess: () => router.push("/sign-in") },
              })
            }
          >
            <LogOut />
          </Button>
        </div>
      </div>

      <LegacyImport hasData={spendings.length > 0} />

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
        onSubmit={handleSpendingSubmit}
      />
    </main>
  )
}
