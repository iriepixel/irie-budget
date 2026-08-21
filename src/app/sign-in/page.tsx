import { SignInCard } from "@/components/sign-in-card"

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      <SignInCard error={error ? describe(error) : null} />
    </main>
  )
}

/** better-auth passes its failure reason back as ?error=<code>. */
function describe(code: string) {
  switch (code) {
    case "EMAIL_NOT_ALLOWED":
    case "unable_to_create_user":
      return "That Google account is not on the allowlist. Sign in with an approved address."
    case "unable_to_create_session":
      return "Signed in, but the session could not be created. Try again."
    default:
      return `Sign in failed (${code}).`
  }
}
