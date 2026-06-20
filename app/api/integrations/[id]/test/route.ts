import { getConnector } from "@/lib/server/connectors";
import { connectorIdParamsSchema } from "@/lib/schemas/integrations";
import { mintUserToken, probeStatus } from "@/lib/server/connect";
import { throwConnectError } from "@/lib/server/errors";
import { requireSessionUserId } from "@/lib/server/session";
import { errorResponse } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  try {
    const { id } = connectorIdParamsSchema.parse(await ctx.params);
    const connector = getConnector(id);
    const userId = await requireSessionUserId(request);

    try {
      const status = await probeStatus(connector, userId);
      const installationId =
        status.state === "connected" ? status.installationId : undefined;
      const token = await mintUserToken(connector, userId, installationId);
      const results = await connector.test.run(token);
      return Response.json({ results });
    } catch (error) {
      throwConnectError(error);
    }
  } catch (error) {
    return errorResponse(error);
  }
}
