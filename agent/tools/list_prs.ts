import { defineTool } from "eve/tools";
import { z } from "zod";
import { githubFetch } from "../lib/github.js";

type Pull = {
  number: number;
  title: string;
  draft: boolean;
  html_url: string;
  user: { login: string } | null;
};

interface PrSummary {
  repo: string;
  number: number;
  title: string;
  draft: boolean;
  author: string;
  url: string;
}

function isDependencyBump(pr: PrSummary) {
  return (
    /^(bump |build\(deps\)|chore\(deps\))/i.test(pr.title) ||
    /dependabot|renovate/i.test(pr.author)
  );
}

// Authored tool: aggregates open PRs across every repo the bruv GitHub App can
// reach, so the count is actually complete (unlike the per-repo MCP tool). By
// default it hides automated dependency-bump PRs.
export default defineTool({
  description:
    "List open pull requests across ALL repositories bruv can access. Use this for 'my PRs', 'open PRs', PR counts, etc. — it scans every accessible repo so the result is complete. By default it excludes automated dependency-bump (Dependabot/Renovate) PRs.",
  inputSchema: z.object({
    includeDependabot: z
      .boolean()
      .default(false)
      .describe("Include automated dependency-bump PRs. Default false."),
    repoContains: z
      .string()
      .optional()
      .describe("Only PRs whose repo full_name contains this substring."),
    limit: z.number().int().min(1).max(100).default(40),
  }),
  async execute({ includeDependabot, repoContains, limit }) {
    const repos: string[] = [];
    for (let page = 1; ; page++) {
      const res = await githubFetch(
        `/installation/repositories?per_page=100&page=${page}`,
      );
      if (!res.ok) throw new Error(`GitHub list repos failed: ${res.status}`);
      const data = (await res.json()) as { repositories: { full_name: string }[] };
      repos.push(...data.repositories.map((r) => r.full_name));
      if (data.repositories.length < 100) break;
    }

    const needle = repoContains?.toLowerCase();
    const targets = needle
      ? repos.filter((r) => r.toLowerCase().includes(needle))
      : repos;

    const prs: PrSummary[] = [];
    for (let i = 0; i < targets.length; i += 12) {
      const batch = targets.slice(i, i + 12);
      const results = await Promise.all(
        batch.map(async (fullName) => {
          const res = await githubFetch(
            `/repos/${fullName}/pulls?state=open&per_page=100`,
          );
          if (!res.ok) return [] as PrSummary[];
          const list = (await res.json()) as Pull[];
          return list.map((pr) => ({
            repo: fullName,
            number: pr.number,
            title: pr.title,
            draft: pr.draft,
            author: pr.user?.login ?? "",
            url: pr.html_url,
          }));
        }),
      );
      for (const list of results) prs.push(...list);
    }

    const filtered = includeDependabot ? prs : prs.filter((p) => !isDependencyBump(p));
    filtered.sort((a, b) => a.repo.localeCompare(b.repo) || b.number - a.number);

    return {
      total: filtered.length,
      totalIncludingBots: prs.length,
      prs: filtered.slice(0, limit),
    };
  },
});
