"use client"

import { useSyncExternalStore, useTransition } from "react"
import { Upload } from "lucide-react"

import { importLegacyData } from "@/app/actions"
import { report } from "@/lib/report"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CATEGORIES, type Category, type Owner } from "@/lib/spendings"

const SPENDINGS_KEY = "budget.spendings.v1"
const SALARY_KEY = "budget.salary.v1"

type Payload = {
  spendings: {
    title: string
    amount: number
    day: number
    category: Category
    kind: string
    owner: Owner
  }[]
  salaries: { owner: Owner; amount: number }[]
}

/**
 * Offers a one-time import of data saved in this browser before the app had
 * a database. Only appears when there is something to import.
 */
export function LegacyImport({ hasData }: { hasData: boolean }) {
  const payload = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [pending, startTransition] = useTransition()

  if (!payload || payload.spendings.length === 0) return null

  return (
    <Card className="mb-8 border-dashed">
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {payload.spendings.length} spendings found in this browser
          </p>
          <p className="text-sm text-muted-foreground">
            {hasData
              ? "Importing adds them to what is already saved — you may end up with duplicates."
              : "Saved before this app had a database. Import them to keep them."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={dismiss}
          >
            Discard
          </Button>
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const ok = await report(
                  () => importLegacyData(payload),
                  "Import failed"
                )
                // Only clear the browser copy once the server confirmed it.
                if (ok) dismiss()
              })
            }
          >
            <Upload />
            {pending ? "Importing…" : "Import"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Read once and cache, so the snapshot stays stable between renders and the
 * banner can be dismissed without an effect.
 */
let cache: Payload | null | undefined
const listeners = new Set<() => void>()

function getSnapshot(): Payload | null {
  if (cache === undefined) cache = readLegacy()
  return cache
}

function getServerSnapshot(): Payload | null {
  return null
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function dismiss() {
  clearLegacy()
  cache = null
  for (const listener of listeners) listener()
}

function readLegacy(): Payload | null {
  try {
    const raw = window.localStorage.getItem(SPENDINGS_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null

    const spendings = parsed.flatMap((value) => {
      if (typeof value !== "object" || value === null) return []
      const v = value as Record<string, unknown>

      // Entries predate the day-of-month, kind and owner fields.
      const day =
        typeof v.day === "number"
          ? v.day
          : typeof v.date === "string"
            ? Number(v.date.slice(8, 10))
            : NaN

      if (typeof v.title !== "string" || typeof v.amount !== "number") return []
      if (!Number.isInteger(day) || day < 1 || day > 31) return []
      if (v.amount <= 0) return []

      return [
        {
          title: v.title,
          amount: v.amount,
          day,
          category: CATEGORIES.includes(v.category as Category)
            ? (v.category as Category)
            : ("Other" as Category),
          kind:
            v.kind === "oneOff" || v.kind === "food"
              ? (v.kind as string)
              : "recurring",
          owner: (v.owner === "olia" ? "olia" : "jev") as Owner,
        },
      ]
    })

    const salaryRaw = window.localStorage.getItem(SALARY_KEY)
    const salaries: Payload["salaries"] = []

    if (salaryRaw) {
      const value: unknown = JSON.parse(salaryRaw)
      if (typeof value === "number" && value > 0) {
        salaries.push({ owner: "jev", amount: value })
      } else if (typeof value === "object" && value !== null) {
        for (const [owner, amount] of Object.entries(value)) {
          if ((owner === "jev" || owner === "olia") && typeof amount === "number" && amount > 0) {
            salaries.push({ owner, amount })
          }
        }
      }
    }

    return { spendings, salaries }
  } catch {
    return null
  }
}

function clearLegacy() {
  window.localStorage.removeItem(SPENDINGS_KEY)
  window.localStorage.removeItem(SALARY_KEY)
}
