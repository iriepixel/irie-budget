import { ImageResponse } from "next/og"

/**
 * One definition for every icon size, so the favicon, the manifest icons and
 * the iOS home screen icon cannot drift apart.
 */
export function renderIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          fontSize: size * 0.6,
          fontWeight: 700,
          letterSpacing: -size * 0.02,
        }}
      >
        £
      </div>
    ),
    { width: size, height: size }
  )
}
