import { CategoryCharts } from "@/components/category-charts"
import { getSpendings } from "@/lib/queries"

export default async function CategoriesPage() {
  const spendings = await getSpendings()

  return <CategoryCharts spendings={spendings} />
}
