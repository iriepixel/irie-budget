import { unstable_rethrow } from "next/navigation"
import { toast } from "sonner"

/**
 * Runs a server action and surfaces a failure. Without this an optimistic
 * update simply rolls back, which looks identical to a successful save.
 *
 * Returns whether the action succeeded, so callers can gate follow-up work
 * (clearing localStorage, closing a banner) on a confirmed save.
 */
export async function report(action: () => Promise<void>, message: string) {
  try {
    await action()
    return true
  } catch (error) {
    // Next signals redirects (an expired session in requireUser) by
    // throwing; swallowing those would strand the user mid-action.
    unstable_rethrow(error)
    console.error(error)
    toast.error(message, {
      description: "Your change was not saved. Check your connection.",
    })
    return false
  }
}
