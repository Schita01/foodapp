import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentsApi } from "@/services/payments";

const CARDS_KEY = ["cards"];

export function useCards() {
  return useQuery({ queryKey: CARDS_KEY, queryFn: () => paymentsApi.listCards() });
}

export function useAddCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.addCard,
    onSuccess: () => qc.invalidateQueries({ queryKey: CARDS_KEY }),
  });
}

export function useRemoveCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => paymentsApi.removeCard(cardId),
    onSuccess: () => qc.invalidateQueries({ queryKey: CARDS_KEY }),
  });
}

export function useSetDefaultCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => paymentsApi.setDefaultCard(cardId),
    onSuccess: () => qc.invalidateQueries({ queryKey: CARDS_KEY }),
  });
}
