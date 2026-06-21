"use client";

import { ChevronRightIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ShowDiffOutput } from "@/shared/tools/show_diff";

function fileName(path: string) {
  return path.split("/").pop() ?? path;
}

// Classify a unified-diff line for coloring. Header lines ("diff --git", "+++",
// "---", "@@ …") get muted/neutral treatment so real additions/removals stand out.
function lineClass(line: string): string {
  if (line.startsWith("@@")) return "text-sky-600 dark:text-sky-400";
  if (
    line.startsWith("+++") ||
    line.startsWith("---") ||
    line.startsWith("diff ") ||
    line.startsWith("index ") ||
    line.startsWith("new file") ||
    line.startsWith("deleted file") ||
    line.startsWith("rename ")
  ) {
    return "text-muted-foreground";
  }
  if (line.startsWith("+"))
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (line.startsWith("-"))
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  return "text-foreground/80";
}

export function DiffCard({ output }: { output: ShowDiffOutput }) {
  if (output.empty) {
    return (
      <div className="bg-card text-muted-foreground flex w-full max-w-md items-center gap-1.5 rounded-xl border px-3 py-2 text-xs animate-in fade-in slide-in-from-bottom-1 duration-300">
        <DocumentTextIcon className="size-3.5" />
        no changes in {output.dir === "." ? "the workspace" : output.dir}
      </div>
    );
  }

  const lines = output.patch.split("\n");

  return (
    <Collapsible
      defaultOpen
      className="bg-card w-full max-w-md overflow-hidden rounded-xl border transition-shadow hover:shadow-md animate-in fade-in slide-in-from-bottom-1 duration-300"
    >
      <CollapsibleTrigger className="group/diff text-muted-foreground hover:text-foreground flex w-full items-center gap-1.5 px-3 py-2 text-xs transition-colors">
        <DocumentTextIcon className="size-3.5" />
        <span>
          {output.files.length} file{output.files.length === 1 ? "" : "s"} changed
        </span>
        {output.additions > 0 && (
          <span className="text-emerald-600 dark:text-emerald-400">
            +{output.additions}
          </span>
        )}
        {output.deletions > 0 && (
          <span className="text-rose-600 dark:text-rose-400">
            −{output.deletions}
          </span>
        )}
        <ChevronRightIcon className="ml-auto size-3 transition-transform group-data-[state=open]/diff:rotate-90" />
      </CollapsibleTrigger>

      {/* file list */}
      <ul className="border-t">
        {output.files.map((f) => (
          <li
            key={f.path}
            className="flex items-center gap-2 px-3 py-1.5 text-xs"
            title={f.path}
          >
            <span className="flex-1 truncate font-mono">{fileName(f.path)}</span>
            {f.binary ? (
              <span className="text-muted-foreground text-[10px]">binary</span>
            ) : (
              <>
                {f.additions > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    +{f.additions}
                  </span>
                )}
                {f.deletions > 0 && (
                  <span className="text-rose-600 dark:text-rose-400">
                    −{f.deletions}
                  </span>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

      <CollapsibleContent>
        <pre className="border-t overflow-x-auto text-[11px] leading-relaxed">
          <code className="block py-1 font-mono">
            {lines.map((line, i) => (
              <span
                key={i}
                className={cn("block px-3 whitespace-pre", lineClass(line))}
              >
                {line || " "}
              </span>
            ))}
          </code>
        </pre>
        {output.truncated && (
          <p className="text-muted-foreground border-t px-3 py-1.5 text-xs">
            diff truncated — open the PR to see the rest
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
