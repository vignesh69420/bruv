import { createSlackLinkCode } from "@/lib/server/slack-link-codes";
import { requireSessionUserId } from "@/lib/server/session";
import { errorResponse } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const appUserId = await requireSessionUserId(request);
    const { code, expiresAt } = await createSlackLinkCode(appUserId);
    return Response.json({ code, expiresAt });
  } catch (error) {
    return errorResponse(error);
  }
}
