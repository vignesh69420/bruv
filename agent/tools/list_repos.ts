import { defineTool } from "eve/tools";
import { z } from "zod";
import {
  NOT_CONNECTED,
  isGithubNotConnected,
  userGithubFetch,
  userGithubToken,
} from "../lib/github-token.js";

type GhRepo = {
  full_name: string;
  private: boolean;
  description: string | null;
  pushed_at: string | null;
  html_url: string;
};

// Lists the repositories the CONNECTED USER can access (their own + orgs), via
// their Vercel Connect GitHub token.
export default defineTool({
  description:
    "List the GitHub repositories the connected user can access (their own and their orgs). Use this whenever someone asks to list, browse, or count repos. No query needed.",
  inputSchema: z.object({
    nameContains: z
      .string()
      .optional()
      .describe("case-insensitive substring to filter repo names by"),
    limit: z.number().int().min(1).max(200).default(50),
  }),
  async execute({ nameContains, limit }, ctx) {
    const userId = ctx.session.auth.current?.principalId;
    if (!userId) return NOT_CONNECTED;

    let token: string;
    try {
      token = await userGithubToken(userId);
    } catch (error) {
      if (isGithubNotConnected(error)) return NOT_CONNECTED;
      throw error;
    }

    const all: GhRepo[] = [];
    for (let page = 1; page <= 5; page++) {
      const res = await userGithubFetch(
        token,
        `/user/repos?per_page=100&sort=pushed&page=${page}`,
      );
      if (!res.ok) {
        throw new Error(`GitHub list repos failed: ${res.status} ${await res.text()}`);
      }
      const data = (await res.json()) as GhRepo[];
      all.push(...data);
      if (data.length < 100) break;
    }

    let repos = all.map((r) => ({
      name: r.full_name,
      private: r.private,
      description: r.description,
      pushedAt: r.pushed_at,
      url: r.html_url,
    }));

    if (nameContains) {
      const needle = nameContains.toLowerCase();
      repos = repos.filter((r) => r.name.toLowerCase().includes(needle));
    }

    return { total: repos.length, repos: repos.slice(0, limit) };
  },
});
