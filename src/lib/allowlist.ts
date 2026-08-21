/**
 * The only people who may sign in. Anyone else is refused at account
 * creation, so no stranger ever gets a row in the database.
 *
 * Add Olia's address here when she needs access — nothing else changes.
 */
export const ALLOWED_EMAILS = ["jev@smolnikov.me", "smolnikoff@gmail.com"]

export function isAllowed(email: string | null | undefined) {
  if (!email) return false
  return ALLOWED_EMAILS.includes(email.trim().toLowerCase())
}
