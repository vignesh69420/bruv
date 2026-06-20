import { createThreadBodySchema } from "@/lib/schemas/threads";
import { createThreadForUser, listThreadsForUser } from "@/lib/server/threads";
import { requireSessionUserId } from "@/lib/server/session";
import { errorResponse } from "@/lib/server/http";

export async function GET(request: Request) {
  try {
    const userId = await requireSessionUserId(request);
    const threads = await listThreadsForUser(userId);
    return Response.json({ threads });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireSessionUserId(request);
    const body = createThreadBodySchema.parse(await request.json());
    const thread = await createThreadForUser(userId, body);
    return Response.json({ thread }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
