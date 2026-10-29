import { useQuery } from "@tanstack/react-query";
import { branchesApi } from "@/services/branches";

export function useBranch(branchId: string | undefined) {
  return useQuery({
    queryKey: ["branch", branchId],
    queryFn: () => branchesApi.get(branchId!),
    enabled: !!branchId,
  });
}

export function useRestaurantBranches(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["branches", restaurantId],
    queryFn: () => branchesApi.byRestaurant(restaurantId!),
    enabled: !!restaurantId,
  });
}
