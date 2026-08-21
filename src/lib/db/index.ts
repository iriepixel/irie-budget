import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "./schema"

type Database = ReturnType<typeof connect>

function connect() {
  const url = process.env.DATABASE_URL

  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.")
  }

  return drizzle(neon(url), { schema })
}

let instance: Database | null = null

/**
 * Connect on first query rather than on import. Next collects route config at
 * build time by evaluating modules, and a build should not need runtime
 * secrets to succeed.
 */
export const db = new Proxy({} as Database, {
  get(_target, property) {
    instance ??= connect()
    const value = Reflect.get(instance, property, instance)
    return typeof value === "function" ? value.bind(instance) : value
  },
})

export * from "./schema"
