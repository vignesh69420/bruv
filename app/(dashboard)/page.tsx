"use client";

import { useRouter } from "next/navigation";
import { useThreads } from "@/hooks/use-threads";
import { Composer } from "@/components/chat/composer";

export default function Home() {
  const { createThread } = useThreads();
  const router = useRouter();

  async function start(text: string) {
    const thread = await createThread({ title: text });
    sessionStorage.setItem(`pending:${thread.id}`, text);
    router.push(`/chat/${thread.id}`);
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-4">
      <div className="text-center">
        <h1 className="text-3xl font-semibold lowercase">bruv</h1>
        <p className="text-muted-foreground mt-1">what do you need?</p>
      </div>
      <div className="w-full max-w-2xl">
        <Composer onSend={start} onStop={() => {}} isBusy={false} />
      </div>
    </div>
  );
}
