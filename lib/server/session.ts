import { auth } from "@/lib/auth";
import { createError } from "@/lib/server/http";

// Next.js App Router: Better Auth reads the web `Headers` directly, so no H3
// node-header bridge is needed.
export async function requireSessionUserId(request: Request): Promise<string> {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  return session.user.id;
}
