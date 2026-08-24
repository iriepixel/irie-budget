/**
 * iPhone launch-screen sizes. iOS shows an apple-touch-startup-image only
 * when a media query matches the device exactly, so unlisted models fall
 * back to the manifest's plain background colour.
 */
export const SPLASH_DEVICES = [
  { w: 440, h: 956, r: 3 }, // 16 Pro Max
  { w: 430, h: 932, r: 3 }, // 14/15 Pro Max, 15/16 Plus
  { w: 428, h: 926, r: 3 }, // 12/13 Pro Max, 14 Plus
  { w: 414, h: 896, r: 3 }, // XS Max, 11 Pro Max
  { w: 414, h: 896, r: 2 }, // XR, 11
  { w: 402, h: 874, r: 3 }, // 16 Pro
  { w: 393, h: 852, r: 3 }, // 14 Pro, 15, 15 Pro, 16
  { w: 390, h: 844, r: 3 }, // 12, 13, 14
  { w: 375, h: 812, r: 3 }, // X, XS, 11 Pro, 12/13 mini
  { w: 375, h: 667, r: 2 }, // SE 2/3, 8
] as const

export function splashSize({ w, h, r }: (typeof SPLASH_DEVICES)[number]) {
  return `${w * r}x${h * r}`
}

export function splashMedia({ w, h, r }: (typeof SPLASH_DEVICES)[number]) {
  return `(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)`
}
