import { ImageResponse } from "next/og"

import { SPLASH_DEVICES, splashSize } from "@/lib/splash"

const SIZES = new Set(SPLASH_DEVICES.map(splashSize))

/**
 * The iOS launch screen: what shows in the moment between tapping the icon
 * and the first paint, which used to be a plain black rectangle. iOS only
 * accepts a static image here, so this is a splash, not a spinner.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params

  if (!SIZES.has(size)) {
    return new Response("Not found", { status: 404 })
  }

  const [width, height] = size.split("x").map(Number)
  const roundel = Math.round(width * 0.24)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: Math.round(width * 0.05),
          background: "#0a0a0a",
        }}
      >
        <div
          style={{
            width: roundel,
            height: roundel,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "#171717",
            color: "#fafafa",
            fontSize: roundel * 0.55,
            fontWeight: 700,
          }}
        >
          £
        </div>
        <div
          style={{
            color: "#fafafa",
            fontSize: Math.round(width * 0.055),
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          IRIE Budget
        </div>
        <div
          style={{
            color: "#8a8a8a",
            fontSize: Math.round(width * 0.03),
          }}
        >
          Every pound has a plan.
        </div>
      </div>
    ),
    {
      width,
      height,
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
      },
    }
  )
}
