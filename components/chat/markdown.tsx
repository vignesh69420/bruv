"use client";

import { Streamdown } from "streamdown";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
      <Streamdown>{children}</Streamdown>
    </div>
  );
}
