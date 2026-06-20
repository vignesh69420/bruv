import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "./db";

const baseURL = process.env.BETTER_AUTH_URL?.trim();

// Origins allowed to make auth requests. baseURL is trusted automatically; this
// covers the apex, www, the vercel.app fallback, and local dev.
const trustedOrigins = [
  "https://bruv.chat",
  "https://www.bruv.chat",
  "https://bruv-sandy.vercel.app",
  "http://localhost:3000",
];

export const auth = betterAuth({
  ...(baseURL ? { baseURL } : {}),
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
});
