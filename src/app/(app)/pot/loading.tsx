import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Tallest first: the savings pot carries the goal and the running
          totals that the two compact cards below it do not. */}
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="grid gap-6 sm:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  )
}
