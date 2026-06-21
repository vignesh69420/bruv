"use client";

import dynamic from "next/dynamic";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import type { ShowDiffOutput } from "@/shared/tools/show_diff";

// @pierre/diffs renders into a web component (touches `document`/customElements),
// so load it browser-only to keep it out of SSR.
const PatchDiff = dynamic(
  () => import("@pierre/diffs/react").then((m) => m.PatchDiff),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground px-3 py-2 text-xs">rendering diff…</div>
    ),
  },
);

export function DiffCard({ output }: { output: ShowDiffOutput }) {
  if (output.empty) {
    return (
      <div className="bg-card text-muted-foreground flex w-full max-w-md items-center gap-1.5 rounded-xl border px-3 py-2 text-xs animate-in fade-in slide-in-from-bottom-1 duration-300">
        <DocumentTextIcon className="size-3.5" />
        no changes in {output.dir === "." ? "the workspace" : output.dir}
      </div>
    );
  }

  return (
    <div className="bg-card w-full max-w-md overflow-hidden rounded-xl border transition-shadow hover:shadow-md animate-in fade-in slide-in-from-bottom-1 duration-300">
      {/* @pierre/diffs draws its own per-file headers + syntax-highlighted diff */}
      <PatchDiff
        patch={output.patch}
        options={{ overflow: "wrap" }}
        disableWorkerPool
      />
      {output.truncated && (
        <p className="text-muted-foreground border-t px-3 py-1.5 text-xs">
          diff truncated — open the PR to see the rest
        </p>
      )}
    </div>
  );
}
