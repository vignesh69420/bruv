import { z } from "zod";
import {
  internalMemoryQuerySchema,
  memoryCategorySchema,
} from "@/lib/schemas/memory";
import { listMemoryForUser, setMemoryForCategory } from "@/lib/server/memory";
import {
  getOrCreateProfileForUser,
  getProfileWithUser,
} from "@/lib/server/profile";
import { requireInternalRequest } from "@/lib/server/internal-api";
import { errorResponse, queryParams } from "@/lib/server/http";

const saveMemoryBodySchema = z.object({
  userId: z.string().trim().min(1),
  category: memoryCategorySchema,
  content: z.string().trim().min(1),
  source: z.enum(["import", "agent", "manual"]).default("agent"),
});

export async function GET(request: Request) {
  try {
    requireInternalRequest(request);
    const { userId } = internalMemoryQuerySchema.parse(queryParams(request));
    const [profileWithUser, memory] = await Promise.all([
      getProfileWithUser(userId),
      listMemoryForUser(userId),
    ]);
    // getProfileWithUser includes name/email/phone; fall back to the bare
    // profile only if the user record is somehow missing.
    const profile = profileWithUser ?? (await getOrCreateProfileForUser(userId));
    return Response.json({ profile, memory });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    requireInternalRequest(request);
    const body = saveMemoryBodySchema.parse(await request.json());
    const result = await setMemoryForCategory(body.userId, {
      category: body.category,
      content: body.content,
      source: body.source,
    });

    if (!result.saved) {
      return Response.json({ saved: false, reason: result.reason ?? "unchanged" });
    }
    return Response.json({ saved: true, entry: result.entry });
  } catch (error) {
    return errorResponse(error);
  }
}
