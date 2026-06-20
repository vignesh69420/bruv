import { defineTool } from "eve/tools";
import { z } from "zod";

type Overall = Record<string, number>;

// Fortnite Battle Royale stats via fortnite-api.com (needs a free FORTNITE_API_KEY
// from https://dash.fortnite-api.com).
export default defineTool({
  description:
    "Get Fortnite Battle Royale stats for a player by their Epic Games display name. Use when asked about someone's Fortnite stats, wins, K/D, etc.",
  inputSchema: z.object({
    name: z.string().min(1).describe("Epic Games display name"),
  }),
  async execute({ name }) {
    const key = process.env.FORTNITE_API_KEY?.trim();
    if (!key) {
      return {
        error:
          "Fortnite stats aren't set up. Tell the user to add a free FORTNITE_API_KEY from dash.fortnite-api.com.",
      };
    }

    const res = await fetch(
      `https://fortnite-api.com/v2/stats/br/v2?name=${encodeURIComponent(name)}`,
      { headers: { authorization: key } },
    );
    if (res.status === 404 || res.status === 403) {
      return {
        error: `couldn't find public Fortnite stats for "${name}" (wrong name or private account?).`,
      };
    }
    if (!res.ok) {
      return { error: `Fortnite API error: ${res.status}` };
    }

    const body = (await res.json()) as {
      data?: {
        account?: { name?: string };
        battlePass?: { level?: number };
        stats?: { all?: { overall?: Overall } };
      };
    };
    const d = body.data;
    const o = d?.stats?.all?.overall ?? {};

    return {
      name: d?.account?.name ?? name,
      level: d?.battlePass?.level ?? null,
      wins: o.wins ?? 0,
      kd: o.kd ?? 0,
      kills: o.kills ?? 0,
      matches: o.matches ?? 0,
      winRate: o.winRate ?? 0,
      killsPerMatch: o.killsPerMatch ?? 0,
    };
  },
});
