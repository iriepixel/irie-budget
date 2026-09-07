import { PotView } from "@/components/pot-view"
import { getIncomes, getPots } from "@/lib/queries"

export default async function PotPage() {
  const [pots, incomes] = await Promise.all([getPots(), getIncomes()])

  return <PotView pots={pots} incomes={incomes} />
}
