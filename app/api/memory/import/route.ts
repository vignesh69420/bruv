import { importMemoryBodySchema } from "@/lib/schemas/memory";
import { importMemoryForUser } from "@/lib/server/memory";
import { requireSessionUserId } from "@/lib/server/session";
import { errorResponse } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const userId = await requireSessionUserId(request);
    const body = importMemoryBodySchema.parse(await request.json());
    const result = await importMemoryForUser(userId, body.raw);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
