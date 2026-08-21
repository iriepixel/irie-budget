/**
 * The only people who may sign in. Anyone else is refused at account
 * creation, so no stranger ever gets a row in the database.
 */
export const ALLOWED_EMAILS = [
  "jev@smolnikov.me",
  "smolnikoff@gmail.com",
  "olia.smolnikova@gmail.com",
]

export function isAllowed(email: string | null | undefined) {
  if (!email) return false
  return ALLOWED_EMAILS.includes(email.trim().toLowerCase())
}
