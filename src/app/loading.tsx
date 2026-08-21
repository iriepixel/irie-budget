import { Skeleton } from "@/components/ui/skeleton"

/**
 * Shown while the budget is fetched. Without it a navigation sits on the
 * previous page until the query returns, which reads as a dead click.
 */
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-16">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="size-8 rounded-full" />
      </div>

      <div className="grid gap-10 md:grid-cols-2 md:gap-8">
        {[0, 1].map((column) => (
          <div key={column} className="space-y-6">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </main>
  )
}
