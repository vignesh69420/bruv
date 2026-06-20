import { getPendingSlackLinkCode } from "@/lib/server/slack-link-codes";
import {
  deleteSlackLinkForAppUser,
  getSlackLinkForAppUser,
  toSlackLinkSummary,
} from "@/lib/server/slack-links";
import { requireSessionUserId } from "@/lib/server/session";
import { errorResponse } from "@/lib/server/http";

export async function GET(request: Request) {
  try {
    const appUserId = await requireSessionUserId(request);
    const link = await getSlackLinkForAppUser(appUserId);
    const pending = await getPendingSlackLinkCode(appUserId);

    return Response.json({
      ...toSlackLinkSummary(link),
      pendingCode: pending?.code,
      pendingExpiresAt: pending?.expiresAt,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const appUserId = await requireSessionUserId(request);
    const removed = await deleteSlackLinkForAppUser(appUserId);
    return Response.json({ removed });
  } catch (error) {
    return errorResponse(error);
  }
}
