import { CategoryBreakdown } from "@/components/category-breakdown"
import { PageHeader } from "@/components/page-header"
import { getBudget } from "@/lib/queries"
import { requireUser } from "@/lib/session"

export default async function CategoriesPage() {
  await requireUser()
  const { spendings } = await getBudget()

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 md:py-16">
      <PageHeader />
      <CategoryBreakdown spendings={spendings} />
    </main>
  )
}
