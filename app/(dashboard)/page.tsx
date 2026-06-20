"use client";

import { useRouter } from "next/navigation";
import { useThreads } from "@/hooks/use-threads";
import { Composer } from "@/components/chat/composer";

const SUGGESTIONS = [
  "show me my open PRs",
  "what's on my Linear?",
  "weather in london",
];

export default function Home() {
  const { createThread } = useThreads();
  const router = useRouter();

  async function start(text: string) {
    const thread = await createThread({ title: text });
    sessionStorage.setItem(`pending:${thread.id}`, text);
    router.push(`/chat/${thread.id}`);
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center gap-7 px-4">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight lowercase">bruv</h1>
        <p className="text-muted-foreground text-sm">what do you need?</p>
      </div>

      <div className="w-full">
        <Composer onSend={start} onStop={() => {}} isBusy={false} autoFocus />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => start(suggestion)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent border-border rounded-full border px-3 py-1.5 text-xs transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
