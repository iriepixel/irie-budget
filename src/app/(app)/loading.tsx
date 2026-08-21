import { Skeleton } from "@/components/ui/skeleton"

/** The budget's two columns, so the page does not jump when data arrives. */
export default function Loading() {
  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-8">
      {[0, 1].map((column) => (
        <div key={column} className="space-y-6">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}
