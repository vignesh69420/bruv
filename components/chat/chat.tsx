"use client";

import { useEffect, useRef } from "react";
import { useChatSession } from "@/hooks/use-chat-session";
import type { ThreadState } from "@/shared/types/thread";
import { Message } from "./message";
import { Composer } from "./composer";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Chat({
  threadId,
  initialState,
}: {
  threadId: string;
  initialState: ThreadState | null;
}) {
  const chat = useChatSession(threadId, initialState);
  const bottomRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  // Consume a first message handed off from the home composer.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const key = `pending:${threadId}`;
    const pending = sessionStorage.getItem(key);
    if (pending) {
      sessionStorage.removeItem(key);
      void chat.sendMessage(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
          {chat.messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              onRespond={chat.respond}
              canRespond={!chat.isBusy}
            />
          ))}
          {chat.status === "submitted" && (
            <p className="text-muted-foreground text-sm">thinking…</p>
          )}
          {chat.error && (
            <p className="text-destructive text-sm">{chat.error.message}</p>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="mx-auto w-full max-w-3xl p-4 pt-0">
        <Composer
          onSend={chat.sendMessage}
          onStop={chat.stop}
          isBusy={chat.isBusy}
        />
      </div>
    </div>
  );
}
