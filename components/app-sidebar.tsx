"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useThreads } from "@/hooks/use-threads";
import type { ThreadSummary } from "@/shared/types/thread";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";

export function AppSidebar() {
  const { threads, createThread, deleteThread } = useThreads();
  const router = useRouter();
  const params = useParams<{ id?: string }>();

  async function newChat() {
    const thread = await createThread({});
    router.push(`/chat/${thread.id}`);
  }

  return (
    <aside className="bg-sidebar text-sidebar-foreground flex h-dvh w-64 shrink-0 flex-col border-r">
      <div className="flex items-center justify-between p-3">
        <Link href="/" className="px-2 text-lg font-semibold lowercase">
          bruv
        </Link>
        <ThemeToggle />
      </div>

      <div className="px-3">
        <Button onClick={newChat} variant="secondary" className="w-full justify-start">
          <Plus data-icon="inline-start" />
          new chat
        </Button>
      </div>

      <ScrollArea className="mt-2 flex-1 px-2">
        <nav className="flex flex-col gap-0.5 pb-2">
          {threads.map((thread) => (
            <ThreadRow
              key={thread.id}
              thread={thread}
              active={params?.id === thread.id}
              onDelete={async () => {
                await deleteThread(thread.id);
                if (params?.id === thread.id) router.push("/");
              }}
            />
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t p-2">
        <UserMenu />
      </div>
    </aside>
  );
}

function ThreadRow({
  thread,
  active,
  onDelete,
}: {
  thread: ThreadSummary;
  active: boolean;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group hover:bg-sidebar-accent flex items-center gap-1 rounded-md",
        active && "bg-sidebar-accent",
      )}
    >
      <Link
        href={`/chat/${thread.id}`}
        className="flex-1 truncate px-2 py-1.5 text-sm"
      >
        {thread.title}
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 opacity-0 group-hover:opacity-100"
        aria-label="Delete chat"
        onClick={onDelete}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
