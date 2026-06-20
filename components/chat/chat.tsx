"use client";

import { useEffect, useRef } from "react";
import { useChatSession } from "@/hooks/use-chat-session";
import type { ThreadState } from "@/shared/types/thread";
import { ChatMessage } from "./message";
import { Composer } from "./composer";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";

export function Chat({
  threadId,
  initialState,
}: {
  threadId: string;
  initialState: ThreadState | null;
}) {
  const chat = useChatSession(threadId, initialState);
  const startedRef = useRef(false);

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
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {chat.messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onRespond={chat.respond}
              canRespond={!chat.isBusy}
            />
          ))}
          {chat.status === "submitted" && <TypingDots />}
          {chat.error && (
            <p className="text-destructive text-sm">{chat.error.message}</p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="mx-auto w-full max-w-3xl px-4 pb-4">
        <Composer
          onSend={chat.sendMessage}
          onStop={chat.stop}
          isBusy={chat.isBusy}
        />
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
