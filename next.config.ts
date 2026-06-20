import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {};

// withEve mounts the eve agent (agent/) alongside the Next.js app as one
// project: same origin in dev (next dev boots the eve dev server) and a single
// Vercel deploy in prod, with eve served behind /_eve_internal/eve.
export default withEve(nextConfig);
