import { connectors } from "@/lib/server/connectors";
import { probeStatus } from "@/lib/server/connect";
import { requireSessionUserId } from "@/lib/server/session";
import { errorResponse } from "@/lib/server/http";

export async function GET(request: Request) {
  try {
    const userId = await requireSessionUserId(request);

    const summaries = await Promise.all(
      connectors.map(async (connector) => {
        const status = await probeStatus(connector, userId);
        return {
          id: connector.id,
          name: connector.name,
          description: connector.description,
          icon: connector.icon,
          connectorUid: connector.connector,
          connectionName: connector.connectionName,
          testLabel: connector.test.label,
          status,
          connectedAs: status.state === "connected" ? status.label : undefined,
        };
      }),
    );

    return Response.json(summaries);
  } catch (error) {
    return errorResponse(error);
  }
}
