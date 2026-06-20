import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createError } from "@/lib/server/http";

// Request-scoped (React cache) session lookup for Server Components. Lets the
// dashboard layout and the page it renders share a single getSession DB call
// per request instead of each doing their own.
export const getServerSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

// Next.js App Router: Better Auth reads the web `Headers` directly, so no H3
// node-header bridge is needed.
export async function requireSessionUserId(request: Request): Promise<string> {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  return session.user.id;
}
