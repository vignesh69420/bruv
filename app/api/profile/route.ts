import { patchProfileBodySchema } from "@/lib/schemas/profile";
import { getProfileWithUser, updateProfileForUser } from "@/lib/server/profile";
import { requireSessionUserId } from "@/lib/server/session";
import { createError, errorResponse } from "@/lib/server/http";

export async function GET(request: Request) {
  try {
    const userId = await requireSessionUserId(request);
    const profile = await getProfileWithUser(userId);
    if (!profile) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }
    return Response.json({ profile });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireSessionUserId(request);
    const body = patchProfileBodySchema.parse(await request.json());
    const profile = await updateProfileForUser(userId, body);
    if (!profile) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }
    return Response.json({ profile });
  } catch (error) {
    return errorResponse(error);
  }
}
