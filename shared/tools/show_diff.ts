// Output shape for the `show_diff` tool, shared between the agent tool and the
// chat card so they stay in sync.

export interface DiffFile {
  /** Path relative to the repo root. */
  path: string;
  /** Lines added (0 for binary files — see `binary`). */
  additions: number;
  /** Lines removed (0 for binary files). */
  deletions: number;
  /** True when git reported the file as binary. */
  binary: boolean;
}

export interface ShowDiffOutput {
  /** Repo directory the diff was taken in (relative to /workspace). */
  dir: string;
  /** Per-file change summary. */
  files: DiffFile[];
  /** Total lines added across all files. */
  additions: number;
  /** Total lines removed across all files. */
  deletions: number;
  /** Unified diff patch (may be truncated — see `truncated`). */
  patch: string;
  /** True when the patch was cut to stay under the size cap. */
  truncated: boolean;
  /** True when there are no working-tree changes. */
  empty: boolean;
}
