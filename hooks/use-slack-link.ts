"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { SlackLinkSummary } from "@/shared/types/slack-link";

export function useSlackLink() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["slack-link"] });

  const query = useQuery({
    queryKey: ["slack-link"],
    queryFn: () => apiFetch<SlackLinkSummary>("/api/slack/link"),
  });

  const generateCode = useMutation({
    mutationFn: () =>
      apiFetch<{ code: string; expiresAt: string }>("/api/slack/link/code", {
        method: "POST",
      }),
    onSuccess: invalidate,
  });

  const unlink = useMutation({
    mutationFn: () => apiFetch("/api/slack/link", { method: "DELETE" }),
    onSuccess: invalidate,
  });

  return {
    link: query.data,
    isLoading: query.isLoading,
    generateCode: generateCode.mutateAsync,
    unlink: unlink.mutateAsync,
  };
}
