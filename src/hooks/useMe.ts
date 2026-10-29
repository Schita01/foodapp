import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meApi } from "@/services/me";
import type { User } from "@/types";
import { qk } from "./queryKeys";

export function useMe() {
  return useQuery({ queryKey: qk.me, queryFn: () => meApi.get() });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<User>) => meApi.update(patch),
    onSuccess: (user) => qc.setQueryData(qk.me, user),
  });
}

export function useDeleteAccount() {
  return useMutation({ mutationFn: () => meApi.remove() });
}
