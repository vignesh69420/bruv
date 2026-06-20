import { auth } from "@/lib/auth";
import { createError } from "@/lib/server/http";

// The single email allowed into the admin panel. Enforced server-side on both
// the page and any admin API.
export const ADMIN_EMAIL = "akx9@icloud.com";

export function isAdminEmail(email?: string | null): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL;
}

// For admin API routes: 404 (not 403) so the route's existence isn't revealed.
export async function requireAdmin(request: Request): Promise<string> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!isAdminEmail(session?.user?.email)) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }
  return session!.user.id;
}
