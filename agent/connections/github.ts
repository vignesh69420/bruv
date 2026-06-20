import { defineMcpClientConnection } from "eve/connections";
import { never } from "eve/tools/approval";
import { getInstallationToken } from "../lib/github.js";

// GitHub's official remote MCP server. Discovers GitHub tools (issues, PRs,
// code/commit search, branches, file contents, actions, etc.) and exposes them
// as connection__github__*.
//
// Note: the MCP surface has no "list everything I can access" tool — its repo
// tool is `search_repositories`, which needs a query. For plain repo listing,
// bruv uses the authored `list_repos` tool (agent/tools/list_repos.ts).
//
// Auth is a GitHub App, so bruv acts as its own identity ("bruv[bot]") with
// scoped permissions. Token minting lives in ../lib/github.ts and is shared
// with authored tools. See .env.local for the required env vars.
//
// `never()` runs GitHub tools without per-call approval — bruv acts as its own
// scoped GitHub App on your account, and gating every read floods the chat. To
// re-add guardrails, switch to once()/always() or gate only mutating tools.
export default defineMcpClientConnection({
  url: "https://api.githubcopilot.com/mcp/",
  description:
    "GitHub: repositories, issues, pull requests, code and commit search, " +
    "branches, file contents, and GitHub Actions, acting as the bruv GitHub App.",
  auth: {
    getToken: getInstallationToken,
  },
  approval: never(),
});
