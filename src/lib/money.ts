/** Money lives in the database as integer pence; the UI works in pounds. */
export function toPence(pounds: number) {
  return Math.round(pounds * 100)
}

export function toPounds(pence: number) {
  return pence / 100
}
