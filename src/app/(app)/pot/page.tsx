import { PotView } from "@/components/pot-view"
import { getIncomes, getPot } from "@/lib/queries"

export default async function PotPage() {
  const [pot, incomes] = await Promise.all([getPot(), getIncomes()])

  return <PotView pot={pot} incomes={incomes} />
}
