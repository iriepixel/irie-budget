import { renderIcon } from "@/lib/icon"

// A fixed path so the manifest can point at it.
export function GET() {
  return renderIcon(192)
}
