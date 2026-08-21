import { CategoryBreakdown } from "@/components/category-breakdown"
import { getSpendings } from "@/lib/queries"

export default async function CategoriesPage() {
  const spendings = await getSpendings()

  return <CategoryBreakdown spendings={spendings} />
}
