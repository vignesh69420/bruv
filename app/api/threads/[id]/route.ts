import { patchThreadBodySchema, threadIdParamsSchema } from "@/lib/schemas/threads";
import {
  deleteThreadForUser,
  getThreadForUser,
  updateThreadForUser,
} from "@/lib/server/threads";
import { requireSessionUserId } from "@/lib/server/session";
import { createError, errorResponse } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  try {
    const { id } = threadIdParamsSchema.parse(await ctx.params);
    const userId = await requireSessionUserId(request);
    const thread = await getThreadForUser(userId, id);
    if (!thread) {
      throw createError({ statusCode: 404, statusMessage: "Thread not found" });
    }
    return Response.json({ thread });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const { id } = threadIdParamsSchema.parse(await ctx.params);
    const userId = await requireSessionUserId(request);
    const body = patchThreadBodySchema.parse(await request.json());
    const thread = await updateThreadForUser(userId, id, body);
    if (!thread) {
      throw createError({ statusCode: 404, statusMessage: "Thread not found" });
    }
    return Response.json({ thread });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  try {
    const { id } = threadIdParamsSchema.parse(await ctx.params);
    const userId = await requireSessionUserId(request);
    const deleted = await deleteThreadForUser(userId, id);
    if (!deleted) {
      throw createError({ statusCode: 404, statusMessage: "Thread not found" });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
