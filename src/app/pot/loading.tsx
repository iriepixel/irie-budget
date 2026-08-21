import { PageHeaderSkeleton } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 md:py-16">
      <PageHeaderSkeleton />
      <Skeleton className="h-64 w-full rounded-xl" />
    </main>
  )
}
