import { slackLinkConsumeBodySchema } from "@/lib/schemas/slack";
import { consumeSlackLinkCode } from "@/lib/server/slack-link-codes";
import { requireInternalRequest } from "@/lib/server/internal-api";
import { errorResponse } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    requireInternalRequest(request);
    const body = slackLinkConsumeBodySchema.parse(await request.json());
    const result = await consumeSlackLinkCode(body);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
