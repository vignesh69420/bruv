"use client";

import { useRef } from "react";
import { useEveAgent } from "eve/react";
import type { InputResponse } from "eve/client";
import type { HandleMessageStreamEvent } from "eve/client";
import { apiFetch } from "@/lib/api";
import { truncateThreadTitle, type ThreadState } from "@/shared/types/thread";

// Wraps useEveAgent for one thread: resumes from persisted state, persists
// session + events back to the thread on every completed turn, and names the
// thread from the first message.
export function useChatSession(threadId: string, initialState: ThreadState | null) {
  const titleSet = useRef(Boolean(initialState && initialState.events.length > 0));

  const agent = useEveAgent({
    initialSession: initialState?.session,
    initialEvents: initialState?.events as
      | readonly HandleMessageStreamEvent[]
      | undefined,
    onFinish(snapshot) {
      void apiFetch(`/api/threads/${threadId}`, {
        method: "PATCH",
        body: JSON.stringify({
          state: {
            session: snapshot.session,
            events: [...snapshot.events],
          } satisfies ThreadState,
        }),
      }).catch(() => undefined);
    },
  });

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!titleSet.current) {
      titleSet.current = true;
      void apiFetch(`/api/threads/${threadId}`, {
        method: "PATCH",
        body: JSON.stringify({ title: truncateThreadTitle(trimmed) }),
      }).catch(() => undefined);
    }

    await agent.send({ message: trimmed });
  }

  async function respond(responses: InputResponse[]) {
    await agent.send({ inputResponses: responses });
  }

  return {
    messages: agent.data.messages,
    status: agent.status,
    error: agent.error,
    isBusy: agent.status === "submitted" || agent.status === "streaming",
    sendMessage,
    respond,
    stop: agent.stop,
  };
}
