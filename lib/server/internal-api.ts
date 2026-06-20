import { createError } from "@/lib/server/http";

export function requireInternalRequest(request: Request) {
  const secret = process.env.INTERNAL_API_SECRET?.trim();

  if (!secret) {
    throw createError({
      statusCode: 503,
      statusMessage: "Internal API is not configured",
    });
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${secret}`) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
}
