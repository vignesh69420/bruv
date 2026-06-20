import {
  getToken,
  NoValidTokenError,
  UserAuthorizationRequiredError,
} from "@vercel/connect";

// Per-user GitHub access via Vercel Connect. Each end-user connects their own
// GitHub (Settings → Integrations), and the agent acts as THEM — never a shared
// app token.
const CONNECTOR = "github/bruv";
const USER_ISSUER = "app";

export async function userGithubToken(userId: string): Promise<string> {
  return getToken(CONNECTOR, {
    subject: { type: "user", id: userId, issuer: USER_ISSUER },
    scopes: ["repo"],
  });
}

export function isGithubNotConnected(error: unknown): boolean {
  return (
    error instanceof UserAuthorizationRequiredError ||
    error instanceof NoValidTokenError
  );
}

export async function userGithubFetch(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      ...init.headers,
    },
  });
}

export const NOT_CONNECTED = {
  error:
    "GitHub isn't connected for this user yet. Tell them to connect it in Settings → Integrations, then try again.",
} as const;
