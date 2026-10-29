import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/services/orders";
import { qk } from "./queryKeys";

export function useOrders() {
  return useQuery({ queryKey: qk.orders, queryFn: () => ordersApi.list() });
}

export function useOrder(id: string) {
  return useQuery({ queryKey: qk.order(id), queryFn: () => ordersApi.get(id), enabled: !!id });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orders });
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["listing"] });
      qc.invalidateQueries({ queryKey: qk.notifications });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.cancel(orderId),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: qk.orders });
      qc.invalidateQueries({ queryKey: qk.order(order.orderId) });
    },
  });
}

export function useConfirmPickup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { orderId: string; scannedBranchId?: string }) =>
      ordersApi.confirmPickup(input.orderId, input.scannedBranchId),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: qk.orders });
      qc.invalidateQueries({ queryKey: qk.order(order.orderId) });
      qc.invalidateQueries({ queryKey: qk.me });
      qc.invalidateQueries({ queryKey: qk.notifications });
    },
  });
}
