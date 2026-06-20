import { z } from "zod";
import {
  internalMemoryQuerySchema,
  memoryCategorySchema,
} from "@/lib/schemas/memory";
import { listMemoryForUser, setMemoryForCategory } from "@/lib/server/memory";
import { getOrCreateProfileForUser } from "@/lib/server/profile";
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
    const [profile, memory] = await Promise.all([
      getOrCreateProfileForUser(userId),
      listMemoryForUser(userId),
    ]);
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
