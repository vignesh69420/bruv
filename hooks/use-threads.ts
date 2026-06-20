"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ThreadRecord, ThreadSummary } from "@/shared/types/thread";

export function useThreads() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["threads"],
    queryFn: () =>
      apiFetch<{ threads: ThreadSummary[] }>("/api/threads").then((r) => r.threads),
  });

  const create = useMutation({
    mutationFn: (input: { id?: string; title?: string }) =>
      apiFetch<{ thread: ThreadRecord }>("/api/threads", {
        method: "POST",
        body: JSON.stringify(input),
      }).then((r) => r.thread),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["threads"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/threads/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["threads"] }),
  });

  return {
    threads: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createThread: create.mutateAsync,
    deleteThread: remove.mutateAsync,
  };
}
