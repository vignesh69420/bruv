import { getConnector } from "@/lib/server/connectors";
import { connectorIdParamsSchema } from "@/lib/schemas/integrations";
import { probeStatus, revokeConnection } from "@/lib/server/connect";
import { throwConnectError } from "@/lib/server/errors";
import { requireSessionUserId } from "@/lib/server/session";
import { errorResponse } from "@/lib/server/http";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  try {
    const { id } = connectorIdParamsSchema.parse(await ctx.params);
    const connector = getConnector(id);
    const userId = await requireSessionUserId(request);
    const status = await probeStatus(connector, userId);
    const installationId =
      status.state === "connected" ? status.installationId : undefined;

    try {
      await revokeConnection(connector, userId, installationId);
      return Response.json({ ok: true });
    } catch (error) {
      throwConnectError(error);
    }
  } catch (error) {
    return errorResponse(error);
  }
}
