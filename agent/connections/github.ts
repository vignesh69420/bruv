import { connect } from "@vercel/connect/eve";
import { defineMcpClientConnection } from "eve/connections";
import { never } from "eve/tools/approval";

// GitHub's official remote MCP server, authenticated PER USER via Vercel Connect
// OAuth (connector "github/bruv"). Each end-user connects their own GitHub in
// Settings → Integrations; the agent acts as them, not a shared app token.
const CONNECTOR = "github/bruv";
const USER_ISSUER = "app";

const connectAuth = connect({
  connector: CONNECTOR,
  validate: true,
  tokenParams: { scopes: ["repo"] },
  principalToSubject: (principal) =>
    principal.type === "user"
      ? { type: "user", id: principal.id, issuer: principal.issuer ?? USER_ISSUER }
      : { type: "app" },
});

export default defineMcpClientConnection({
  url: "https://api.githubcopilot.com/mcp/",
  description:
    "GitHub: repositories, issues, pull requests, code and commit search, " +
    "branches, file contents, and Actions for the connected user's account.",
  auth: connectAuth,
  approval: never(),
});
