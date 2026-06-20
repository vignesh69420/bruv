import { defineTool } from "eve/tools";
import { z } from "zod";
import {
  NOT_CONNECTED,
  isGithubNotConnected,
  userGithubFetch,
  userGithubToken,
} from "../lib/github-token.js";

type SearchItem = {
  number: number;
  title: string;
  draft?: boolean;
  html_url: string;
  repository_url: string;
  user: { login: string } | null;
};

// Lists the connected user's own open pull requests (ones they authored), across
// all their repos and orgs, via the GitHub search API with their Connect token.
export default defineTool({
  description:
    "List the connected user's open pull requests — PRs they authored, across all their repos and orgs. Use for 'my PRs', 'open PRs', PR counts.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(100).default(40),
  }),
  async execute({ limit }, ctx) {
    const userId = ctx.session.auth.current?.principalId;
    if (!userId) return NOT_CONNECTED;

    let token: string;
    try {
      token = await userGithubToken(userId);
    } catch (error) {
      if (isGithubNotConnected(error)) return NOT_CONNECTED;
      throw error;
    }

    const q = encodeURIComponent("is:open is:pr author:@me");
    const res = await userGithubFetch(
      token,
      `/search/issues?q=${q}&per_page=100&advanced_search=true`,
    );
    if (!res.ok) {
      throw new Error(`GitHub PR search failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as {
      total_count: number;
      items: SearchItem[];
    };

    const prs = (data.items ?? []).map((item) => ({
      repo: item.repository_url.split("/").slice(-2).join("/"),
      number: item.number,
      title: item.title,
      draft: item.draft ?? false,
      author: item.user?.login ?? "",
      url: item.html_url,
    }));
    prs.sort((a, b) => a.repo.localeCompare(b.repo) || b.number - a.number);

    return { total: prs.length, prs: prs.slice(0, limit) };
  },
});
