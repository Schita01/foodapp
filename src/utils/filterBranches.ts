import type { Branch } from "@/types";

/** Customer app only shows approved, active branches. */
export function isCustomerVisibleBranch(b: Branch): boolean {
  return b.approvalStatus === "APPROVED" && b.status === "ACTIVE";
}

export function customerVisibleBranches(branches: Branch[]): Branch[] {
  return branches.filter(isCustomerVisibleBranch);
}

export function branchVisibilityMap(branches: Branch[]): Map<string, Branch> {
  return new Map(
    customerVisibleBranches(branches).map((b) => [b.branchId, b]),
  );
}
