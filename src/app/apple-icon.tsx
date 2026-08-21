import { renderIcon } from "@/lib/icon"

// 180px is what iOS asks for when adding to the home screen.
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return renderIcon(size.width)
}
