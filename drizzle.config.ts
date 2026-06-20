import { defineConfig } from "drizzle-kit";

// drizzle-kit evaluates this config in its own runtime that doesn't inherit
// the .env.local bun loads, so load it explicitly (Node 24 / bun built-in).
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local may be absent in CI; rely on the ambient environment then.
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
