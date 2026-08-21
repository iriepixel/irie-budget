/**
 * Digits and at most one decimal point, with commas normalised to points, so
 * a value typed on any keyboard stays parseable by Number().
 */
export function cleanAmountInput(raw: string) {
  const [whole, ...rest] = raw
    .replace(/,/g, ".")
    .replace(/[^\d.]/g, "")
    .split(".")

  return rest.length > 0 ? `${whole}.${rest.join("")}` : whole
}
