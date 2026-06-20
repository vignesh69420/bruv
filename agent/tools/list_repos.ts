import { defineTool } from "eve/tools";
import { z } from "zod";
import { githubFetch } from "../lib/github.js";

type GhRepo = {
  full_name: string;
  private: boolean;
  description: string | null;
  html_url: string;
  pushed_at: string | null;
};

// The GitHub MCP connection has no tool that lists every repo the app can
// reach (its `search_repositories` needs a query). This fills that gap via the
// REST /installation/repositories endpoint, sorted most-recently-pushed first.
export default defineTool({
  description:
    "List the GitHub repositories bruv can access. Use this whenever someone " +
    "asks to list, browse, or count repos and has NOT given a search query. " +
    "For searching by keyword, use the GitHub connection's search instead.",
  inputSchema: z.object({
    nameContains: z
      .string()
      .optional()
      .describe("case-insensitive substring to filter repo names by"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(200)
      .default(50)
      .describe("max repos to return"),
  }),
  async execute({ nameContains, limit }) {
    const all: GhRepo[] = [];
    for (let page = 1; ; page++) {
      const res = await githubFetch(
        `/installation/repositories?per_page=100&page=${page}`,
      );
      if (!res.ok) {
        throw new Error(`GitHub list repos failed: ${res.status} ${await res.text()}`);
      }
      const data = (await res.json()) as { repositories: GhRepo[] };
      all.push(...data.repositories);
      if (data.repositories.length < 100) break;
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
    repos.sort((a, b) => (b.pushedAt ?? "").localeCompare(a.pushedAt ?? ""));

    return { total: repos.length, repos: repos.slice(0, limit) };
  },
});
