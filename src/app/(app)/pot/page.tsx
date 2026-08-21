import { PotView } from "@/components/pot-view"
import { getPot } from "@/lib/queries"

export default async function PotPage() {
  const saved = await getPot()

  return <PotView saved={saved} />
}
