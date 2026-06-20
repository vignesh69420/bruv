import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "./db";

const baseURL = process.env.BETTER_AUTH_URL?.trim();

export const auth = betterAuth({
  ...(baseURL ? { baseURL } : {}),
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
});
