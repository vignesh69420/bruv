import { listMemoryForUser } from "@/lib/server/memory";
import { requireSessionUserId } from "@/lib/server/session";
import { errorResponse } from "@/lib/server/http";

export async function GET(request: Request) {
  try {
    const userId = await requireSessionUserId(request);
    const memory = await listMemoryForUser(userId);
    return Response.json({ memory });
  } catch (error) {
    return errorResponse(error);
  }
}
