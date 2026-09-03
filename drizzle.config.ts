import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

// Next reads .env.local, so that is where DATABASE_URL lives; plain
// `dotenv/config` only looks at .env and leaves drizzle-kit with no url.
config({ path: [".env.local", ".env"], quiet: true })

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
