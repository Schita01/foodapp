import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supportApi } from "@/services/support";
import { refundsApi } from "@/services/refunds";
import { qk } from "./queryKeys";

export function useTickets() {
  return useQuery({ queryKey: qk.tickets, queryFn: () => supportApi.list() });
}

export function useTicket(id: string) {
  return useQuery({ queryKey: qk.ticket(id), queryFn: () => supportApi.get(id), enabled: !!id });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: supportApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tickets }),
  });
}

export function useSendMessage(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, attachments }: { body: string; attachments?: any[] }) =>
      supportApi.addMessage(ticketId, body, attachments),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.ticket(ticketId) });
      qc.invalidateQueries({ queryKey: qk.tickets });
    },
  });
}

export function useTicketStatusChange(ticketId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: qk.ticket(ticketId) });
    qc.invalidateQueries({ queryKey: qk.tickets });
  };
  const close = useMutation({ mutationFn: () => supportApi.close(ticketId), onSuccess: invalidate });
  const reopen = useMutation({ mutationFn: () => supportApi.reopen(ticketId), onSuccess: invalidate });
  return { close, reopen };
}

export function useRefundByOrder(orderId: string) {
  return useQuery({
    queryKey: qk.refundByOrder(orderId),
    queryFn: () => refundsApi.getByOrder(orderId),
    enabled: !!orderId,
  });
}

export function useCreateRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: refundsApi.create,
    onSuccess: (refund) => {
      qc.invalidateQueries({ queryKey: qk.refundByOrder(refund.orderId) });
      qc.invalidateQueries({ queryKey: qk.order(refund.orderId) });
      qc.invalidateQueries({ queryKey: qk.orders });
      qc.invalidateQueries({ queryKey: qk.tickets });
      qc.invalidateQueries({ queryKey: qk.notifications });
    },
  });
}
