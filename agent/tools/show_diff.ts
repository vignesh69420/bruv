import { defineTool } from "eve/tools";
import { z } from "zod";
import type { DiffFile, ShowDiffOutput } from "../../shared/tools/show_diff.js";

// Shows the working-tree changes in a sandbox git repo as a unified diff, so the
// user can see exactly what the agent edited (rendered as a diff card). Runs in
// the app runtime but reaches into the live sandbox via ctx.getSandbox().

// Cap the patch so a giant diff can't blow up the message payload.
const MAX_PATCH_CHARS = 60_000;

// Conservative path: only allow characters that are safe to embed in the shell
// command below. Anything fancy is rejected rather than escaped.
const SAFE_DIR = /^[A-Za-z0-9._/-]+$/;

function parseNumstat(block: string): DiffFile[] {
  const files: DiffFile[] = [];
  for (const line of block.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split("\t");
    if (parts.length < 3) continue;
    const [addRaw, delRaw, ...pathParts] = parts;
    const binary = addRaw === "-" || delRaw === "-";
    files.push({
      path: pathParts.join("\t"),
      additions: binary ? 0 : Number(addRaw) || 0,
      deletions: binary ? 0 : Number(delRaw) || 0,
      binary,
    });
  }
  return files;
}

export default defineTool({
  description:
    "Show the current uncommitted changes in a sandbox git repo as a diff. Use after editing files (before asking to commit/push) so the user can see exactly what changed. Includes new/untracked files.",
  inputSchema: z.object({
    dir: z
      .string()
      .regex(SAFE_DIR, "dir must be a simple path with no spaces or shell chars")
      .default(".")
      .describe(
        "Repo directory relative to /workspace (the folder you cloned into). Defaults to the workspace root.",
      ),
  }),
  async execute({ dir }, ctx): Promise<ShowDiffOutput | { error: string }> {
    const sandbox = await ctx.getSandbox();

    // One shell script: cd in, intent-to-add untracked files so they show in the
    // diff, then emit numstat + patch against HEAD (or the empty tree when there
    // are no commits yet). Markers let us split the two sections reliably.
    const script = [
      `cd "${dir}" 2>/dev/null || { echo "__NODIR__"; exit 0; }`,
      `git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "__NOREPO__"; exit 0; }`,
      `BASE=HEAD`,
      `git rev-parse --verify HEAD >/dev/null 2>&1 || BASE=$(git hash-object -t tree /dev/null)`,
      `git add -N -- . >/dev/null 2>&1 || true`,
      `echo "__NUMSTAT__"`,
      `git -c core.quotepath=false diff --numstat "$BASE" 2>/dev/null || true`,
      `echo "__PATCH__"`,
      `git -c core.quotepath=false diff --no-color "$BASE" 2>/dev/null || true`,
    ].join("\n");

    const { stdout } = await sandbox.run({ command: script });

    if (stdout.includes("__NODIR__")) {
      return { error: `No directory '${dir}' in the sandbox. Clone the repo first.` };
    }
    if (stdout.includes("__NOREPO__")) {
      return {
        error: `'${dir}' isn't a git repo. Clone the repo (git clone …) before asking for a diff.`,
      };
    }

    const numstatStart = stdout.indexOf("__NUMSTAT__");
    const patchStart = stdout.indexOf("__PATCH__");
    const numstatBlock =
      numstatStart >= 0 && patchStart >= 0
        ? stdout.slice(numstatStart + "__NUMSTAT__".length, patchStart)
        : "";
    let patch =
      patchStart >= 0 ? stdout.slice(patchStart + "__PATCH__".length) : "";
    patch = patch.replace(/^\n/, "").replace(/\n$/, "");

    const files = parseNumstat(numstatBlock);
    const additions = files.reduce((n, f) => n + f.additions, 0);
    const deletions = files.reduce((n, f) => n + f.deletions, 0);

    let truncated = false;
    if (patch.length > MAX_PATCH_CHARS) {
      patch = patch.slice(0, MAX_PATCH_CHARS);
      truncated = true;
    }

    return {
      dir,
      files,
      additions,
      deletions,
      patch,
      truncated,
      empty: files.length === 0 && patch.trim() === "",
    };
  },
});
