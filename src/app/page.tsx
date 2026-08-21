import { BudgetView } from "@/components/budget-view"
import { getBudget } from "@/lib/queries"
import { requireUser } from "@/lib/session"

export default async function Home() {
  const user = await requireUser()
  const { spendings, salaries } = await getBudget()

  return (
    <BudgetView
      spendings={spendings}
      salaries={salaries}
      userName={user.name || user.email}
    />
  )
}
