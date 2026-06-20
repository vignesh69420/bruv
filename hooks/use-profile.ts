"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { UserProfilePatch, UserProfileWithUser } from "@/shared/types/profile";

export function useProfile() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["profile"],
    queryFn: () =>
      apiFetch<{ profile: UserProfileWithUser }>("/api/profile").then((r) => r.profile),
  });

  const save = useMutation({
    mutationFn: (patch: UserProfilePatch) =>
      apiFetch<{ profile: UserProfileWithUser }>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(patch),
      }).then((r) => r.profile),
    onSuccess: (profile) => qc.setQueryData(["profile"], profile),
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    saveProfile: save.mutateAsync,
    isSaving: save.isPending,
  };
}
