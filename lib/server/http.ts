// Minimal stand-in for Nuxt/H3's global `createError`, so the ported server
// utils keep their `throw createError({ statusCode, statusMessage })` shape.
// Route handlers convert thrown HttpErrors into responses via `errorResponse`.

import { ZodError } from "zod";

export interface HttpErrorInit {
  statusCode: number;
  statusMessage?: string;
  message?: string;
}

export class HttpError extends Error {
  readonly statusCode: number;
  readonly statusMessage?: string;

  constructor(init: HttpErrorInit) {
    super(init.message ?? init.statusMessage ?? "Error");
    this.name = "HttpError";
    this.statusCode = init.statusCode;
    this.statusMessage = init.statusMessage;
  }
}

export function createError(init: HttpErrorInit): HttpError {
  return new HttpError(init);
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json(
      { error: error.message, statusMessage: error.statusMessage },
      { status: error.statusCode },
    );
  }
  if (error instanceof ZodError) {
    return Response.json(
      { error: "Invalid request", issues: error.issues },
      { status: 400 },
    );
  }
  console.error(error);
  return Response.json({ error: "Internal Server Error" }, { status: 500 });
}

/** Public origin of the request, honoring proxy headers (withEve, Vercel). */
export function getRequestOrigin(request: Request): string {
  const headers = request.headers;
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  const proto =
    (headers.get("x-forwarded-proto") ?? "https").split(",")[0]?.trim() ?? "https";
  if (host) {
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

/** Query params as a plain object for zod parsing. */
export function queryParams(request: Request): Record<string, string> {
  return Object.fromEntries(new URL(request.url).searchParams);
}
