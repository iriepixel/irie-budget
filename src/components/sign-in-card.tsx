"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { signIn } from "@/lib/auth-client"

export function SignInCard({ error }: { error: string | null }) {
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState<string | null>(error)

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Spendings</CardTitle>
        <CardDescription>Sign in to see the household budget.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          disabled={pending}
          onClick={() => {
            setPending(true)
            setFailure(null)
            signIn.social(
              { provider: "google", callbackURL: "/" },
              {
                onError: ({ error }) => {
                  setPending(false)
                  setFailure(error.message || "Sign in failed. Try again.")
                },
              }
            )
          }}
        >
          {pending ? "Redirecting…" : "Continue with Google"}
        </Button>
        {failure ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {failure}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
