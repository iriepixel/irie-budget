import { PotView } from "@/components/pot-view"
import { getPot } from "@/lib/queries"
import { requireUser } from "@/lib/session"

export default async function PotPage() {
  await requireUser()
  const saved = await getPot()

  return <PotView saved={saved} />
}
