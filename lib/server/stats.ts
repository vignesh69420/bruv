import { desc, gte, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface TokenRow {
  model: string;
  tokens: number;
  cost: number;
}

export interface AdminStats {
  users: { total: number; last7d: number };
  threads: { total: number; last7d: number };
  messages: { sent: number; received: number };
  memoryEntries: number;
  imessageLinked: number;
  slackLinked: number;
  allUsers: {
    id: string;
    email: string;
    name: string;
    createdAt: number;
  }[];
  tokens:
    | { configured: false }
    | { configured: true; error: string }
    | {
        configured: true;
        totalTokens: number;
        cost: number;
        byModel: TokenRow[];
        rangeDays: number;
      };
  generatedAt: number;
}

async function tableCount(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  where?: ReturnType<typeof gte>,
): Promise<number> {
  const query = db.select({ value: sql<number>`count(*)::int` }).from(table);
  const rows = where ? await query.where(where) : await query;
  return rows[0]?.value ?? 0;
}

async function fetchTokenUsage(): Promise<AdminStats["tokens"]> {
  const key = process.env.AI_GATEWAY_API_KEY?.trim();
  if (!key) return { configured: false };

  const end = new Date();
  const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  try {
    const res = await fetch(
      `https://ai-gateway.vercel.sh/v1/report?start_date=${fmt(start)}&end_date=${fmt(end)}&group_by=model`,
      { headers: { authorization: `Bearer ${key}` } },
    );
    if (!res.ok) {
      return { configured: true, error: `AI Gateway report failed: ${res.status}` };
    }
    const data = (await res.json()) as unknown;
    // Defensive parse — the report shape may evolve; pull any array of rows
    // with model + token + cost-ish fields.
    const rowsRaw = Array.isArray(data)
      ? data
      : ((data as { data?: unknown[]; rows?: unknown[]; results?: unknown[] })
          ?.data ??
          (data as { rows?: unknown[] })?.rows ??
          (data as { results?: unknown[] })?.results ??
          []);

    const byModel: TokenRow[] = (rowsRaw as Record<string, unknown>[]).map((r) => {
      const num = (...keys: string[]) => {
        for (const k of keys) {
          const v = r[k];
          if (typeof v === "number") return v;
        }
        return 0;
      };
      const input = num("input_tokens", "inputTokens", "prompt_tokens");
      const output = num("output_tokens", "outputTokens", "completion_tokens");
      return {
        model: String(r.model ?? r.model_id ?? r.name ?? "unknown"),
        tokens: num("total_tokens", "totalTokens", "tokens") || input + output,
        cost: num("cost", "total_cost", "amount"),
      };
    });

    return {
      configured: true,
      totalTokens: byModel.reduce((s, r) => s + r.tokens, 0),
      cost: byModel.reduce((s, r) => s + r.cost, 0),
      byModel: byModel.sort((a, b) => b.tokens - a.tokens),
      rangeDays: 30,
    };
  } catch (error) {
    return {
      configured: true,
      error: error instanceof Error ? error.message : "AI Gateway request failed",
    };
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  const since = new Date(Date.now() - WEEK_MS);

  const [
    usersTotal,
    usersWeek,
    threadsTotal,
    threadsWeek,
    memoryEntries,
    imessageLinked,
    slackLinked,
  ] = await Promise.all([
    tableCount(schema.user),
    tableCount(schema.user, gte(schema.user.createdAt, since)),
    tableCount(schema.threads),
    tableCount(schema.threads, gte(schema.threads.createdAt, since)),
    tableCount(schema.userMemory),
    tableCount(schema.phoneLinks),
    tableCount(schema.slackLinks),
  ]);

  // Messages live inside each thread's event stream:
  //   message.received  = a user message (sent to bruv)
  //   message.completed = a bruv reply (received by the user)
  const stateRows = await db
    .select({ state: schema.threads.state })
    .from(schema.threads);
  let sent = 0;
  let received = 0;
  for (const row of stateRows) {
    if (!row.state) continue;
    try {
      const parsed = JSON.parse(row.state) as { events?: { type?: string }[] };
      for (const event of parsed.events ?? []) {
        if (event?.type === "message.received") sent++;
        else if (event?.type === "message.completed") received++;
      }
    } catch {
      // skip malformed state
    }
  }

  const allUsers = await db
    .select({
      id: schema.user.id,
      email: schema.user.email,
      name: schema.user.name,
      createdAt: schema.user.createdAt,
    })
    .from(schema.user)
    .orderBy(desc(schema.user.createdAt));

  const tokens = await fetchTokenUsage();

  return {
    users: { total: usersTotal, last7d: usersWeek },
    threads: { total: threadsTotal, last7d: threadsWeek },
    messages: { sent, received },
    memoryEntries,
    imessageLinked,
    slackLinked,
    allUsers: allUsers.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      createdAt: r.createdAt.getTime(),
    })),
    tokens,
    generatedAt: Date.now(),
  };
}
