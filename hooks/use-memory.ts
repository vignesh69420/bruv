"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { MemoryByCategory } from "@/shared/types/memory";

export function useMemory() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["memory"] });

  const query = useQuery({
    queryKey: ["memory"],
    queryFn: () =>
      apiFetch<{ memory: MemoryByCategory }>("/api/memory").then((r) => r.memory),
  });

  const importMemory = useMutation({
    mutationFn: (raw: string) =>
      apiFetch("/api/memory/import", { method: "POST", body: JSON.stringify({ raw }) }),
    onSuccess: invalidate,
  });

  const updateEntry = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      apiFetch(`/api/memory/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ content }),
      }),
    onSuccess: invalidate,
  });

  const deleteEntry = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/memory/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  return {
    memory: query.data,
    isLoading: query.isLoading,
    importMemory: importMemory.mutateAsync,
    updateEntry: updateEntry.mutateAsync,
    deleteEntry: deleteEntry.mutateAsync,
  };
}
