import { getConnector } from "@/lib/server/connectors";
import {
  connectQuerySchema,
  connectorIdParamsSchema,
} from "@/lib/schemas/integrations";
import { isValidEveResumeUrl, startConnectFlow } from "@/lib/server/connect";
import { throwConnectError } from "@/lib/server/errors";
import { requireSessionUserId } from "@/lib/server/session";
import { errorResponse, getRequestOrigin, queryParams } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  try {
    const { id } = connectorIdParamsSchema.parse(await ctx.params);
    const { resumeUrl } = connectQuerySchema.parse(queryParams(request));

    const connector = getConnector(id);
    const userId = await requireSessionUserId(request);
    const origin = getRequestOrigin(request);

    const callbackUrl =
      resumeUrl && isValidEveResumeUrl(resumeUrl, origin)
        ? resumeUrl
        : `${origin}/settings/integrations?connected=${connector.id}`;

    try {
      const { url } = await startConnectFlow(connector, userId, callbackUrl);
      return Response.json({ url });
    } catch (error) {
      throwConnectError(error);
    }
  } catch (error) {
    return errorResponse(error);
  }
}
