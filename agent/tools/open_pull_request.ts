import { defineTool } from "eve/tools";
import { z } from "zod";
import {
  NOT_CONNECTED,
  isGithubNotConnected,
  userGithubFetch,
  userGithubToken,
} from "../lib/github-token.js";

// Opens a pull request as the CONNECTED USER via their Vercel Connect GitHub
// token. Runs in the app runtime (not the sandbox), so it talks to the GitHub
// API directly. Use this AFTER pushing a branch from the sandbox — it keeps PR
// creation deterministic instead of relying on the model to drive git/the MCP.
type GhPull = {
  number: number;
  title: string;
  html_url: string;
  draft: boolean;
  state: string;
  head: { ref: string };
  base: { ref: string };
};

export default defineTool({
  description:
    "Open a GitHub pull request as the connected user. Use after a branch has been pushed (typically from the sandbox). Needs the repo, the base branch to merge into, and the head branch with your changes.",
  inputSchema: z.object({
    repo: z
      .string()
      .regex(/^[^/\s]+\/[^/\s]+$/, "must be 'owner/name'")
      .describe("Repository as 'owner/name', e.g. 'bruvimtired/my-agent'."),
    head: z
      .string()
      .min(1)
      .describe(
        "The branch with your changes. Use 'branch' for same-repo, or 'fork-owner:branch' for a cross-fork PR.",
      ),
    base: z
      .string()
      .min(1)
      .default("main")
      .describe("The branch to merge into (e.g. 'main')."),
    title: z.string().min(1).describe("Pull request title."),
    body: z.string().optional().describe("Pull request description (markdown)."),
    draft: z.boolean().default(false).describe("Open as a draft PR."),
  }),
  async execute({ repo, head, base, title, body, draft }, ctx) {
    const userId = ctx.session.auth.current?.principalId;
    if (!userId) return NOT_CONNECTED;

    let token: string;
    try {
      token = await userGithubToken(userId);
    } catch (error) {
      if (isGithubNotConnected(error)) return NOT_CONNECTED;
      throw error;
    }

    const res = await userGithubFetch(token, `/repos/${repo}/pulls`, {
      method: "POST",
      body: JSON.stringify({ title, head, base, body, draft }),
    });

    if (!res.ok) {
      const text = await res.text();
      // GitHub returns 422 with helpful messages (e.g. no commits between
      // branches, PR already exists). Surface them rather than throwing.
      if (res.status === 422) {
        return {
          error: `Couldn't open the PR: ${text}. Check the branch was pushed and that base/head differ.`,
        };
      }
      throw new Error(`GitHub create PR failed: ${res.status} ${text}`);
    }

    const pr = (await res.json()) as GhPull;
    return {
      repo,
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      draft: pr.draft,
      state: pr.state,
      head: pr.head.ref,
      base: pr.base.ref,
    };
  },
});
