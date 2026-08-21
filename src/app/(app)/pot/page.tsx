import { PotView } from "@/components/pot-view"
import { getPot } from "@/lib/queries"

export default async function PotPage() {
  const pot = await getPot()

  return <PotView pot={pot} />
}
