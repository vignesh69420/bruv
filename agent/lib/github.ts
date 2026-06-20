import { createSign } from "node:crypto";

// Shared GitHub App auth used by both the connection (agent/connections/github.ts)
// and authored tools (agent/tools/*). Mints short-lived installation tokens from
// the app credentials in the environment.
//
// Env vars (see .env.local / your host's secrets):
//   GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID, GITHUB_APP_PRIVATE_KEY

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Sign a short-lived (≤10 min) RS256 JWT identifying the GitHub App.
function appJwt(): string {
  const appId = process.env.GITHUB_APP_ID!;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  // iat backdated 60s for clock skew; exp capped under GitHub's 10 min max.
  const payload = base64url(
    JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: appId }),
  );
  const signature = base64url(
    createSign("RSA-SHA256").update(`${header}.${payload}`).sign(privateKey),
  );
  return `${header}.${payload}.${signature}`;
}

let cached: { token: string; expiresAt: number } | null = null;

// Exchange the app JWT for an installation access token (~1h TTL). Cached in
// memory and reused until ~1 min before expiry; eve also refreshes via expiresAt.
export async function getInstallationToken(): Promise<{
  token: string;
  expiresAt: number;
}> {
  if (cached && cached.expiresAt - Date.now() > 60_000) return cached;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID!;
  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${appJwt()}`,
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
      },
    },
  );
  if (!res.ok) {
    throw new Error(
      `GitHub App token exchange failed: ${res.status} ${await res.text()}`,
    );
  }
  const data = (await res.json()) as { token: string; expires_at: string };
  cached = { token: data.token, expiresAt: Date.parse(data.expires_at) };
  return cached;
}

// Authenticated fetch against the GitHub REST API, acting as the bruv app.
export async function githubFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const { token } = await getInstallationToken();
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
