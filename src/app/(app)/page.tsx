import { BudgetView } from "@/components/budget-view"
import { getBudget } from "@/lib/queries"

export default async function Home() {
  const { spendings, salaries } = await getBudget()

  return <BudgetView spendings={spendings} salaries={salaries} />
}
