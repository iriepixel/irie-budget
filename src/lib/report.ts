import { toast } from "sonner"

/**
 * Runs a server action and surfaces a failure. Without this an optimistic
 * update simply rolls back, which looks identical to a successful save.
 */
export async function report(action: () => Promise<void>, message: string) {
  try {
    await action()
  } catch (error) {
    console.error(error)
    toast.error(message, {
      description: "Your change was not saved. Check your connection.",
    })
  }
}
