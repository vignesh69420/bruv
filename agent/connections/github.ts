import { defineMcpClientConnection } from "eve/connections";
import { once } from "eve/tools/approval";
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
// `once()` asks for human approval the first time bruv calls a GitHub tool in a
// session — a safeguard since some of these tools can create, modify, or delete.
export default defineMcpClientConnection({
  url: "https://api.githubcopilot.com/mcp/",
  description:
    "GitHub: repositories, issues, pull requests, code and commit search, " +
    "branches, file contents, and GitHub Actions, acting as the bruv GitHub App.",
  auth: {
    getToken: getInstallationToken,
  },
  approval: once(),
});
