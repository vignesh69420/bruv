import { memoryIdParamsSchema, patchMemoryBodySchema } from "@/lib/schemas/memory";
import { deleteMemoryEntry, updateMemoryEntry } from "@/lib/server/memory";
import { requireSessionUserId } from "@/lib/server/session";
import { createError, errorResponse } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const userId = await requireSessionUserId(request);
    const { id } = memoryIdParamsSchema.parse(await ctx.params);
    const body = patchMemoryBodySchema.parse(await request.json());
    const entry = await updateMemoryEntry(userId, id, body.content);
    if (!entry) {
      throw createError({ statusCode: 404, statusMessage: "Memory entry not found" });
    }
    return Response.json({ entry });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  try {
    const userId = await requireSessionUserId(request);
    const { id } = memoryIdParamsSchema.parse(await ctx.params);
    const deleted = await deleteMemoryEntry(userId, id);
    if (!deleted) {
      throw createError({ statusCode: 404, statusMessage: "Memory entry not found" });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
