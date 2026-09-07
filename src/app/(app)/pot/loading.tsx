import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Taller first: the savings pot carries the goal and planned-income
          lines that Flex does not. */}
      <Skeleton className="h-72 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  )
}
