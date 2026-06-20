import { slackMemberQuerySchema } from "@/lib/schemas/slack";
import { getSlackLinkForMember } from "@/lib/server/slack-links";
import { requireInternalRequest } from "@/lib/server/internal-api";
import { errorResponse, queryParams } from "@/lib/server/http";

export async function GET(request: Request) {
  try {
    requireInternalRequest(request);
    const { teamId, userId } = slackMemberQuerySchema.parse(queryParams(request));
    const link = await getSlackLinkForMember(teamId, userId);
    return Response.json({ link: link ?? null });
  } catch (error) {
    return errorResponse(error);
  }
}
