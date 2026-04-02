import { apiFetch } from "@/lib/api";
import type { WithdrawalListResponse, WithdrawalRequest } from "@/lib/types";

export type CreateWithdrawalPayload = {
  amount: number;
  currency?: string;
  payoutMethod: "bank" | "crypto" | "wallet" | string;
  payoutDetails: Record<string, unknown>;
  note?: string;
};

export type CreateWithdrawalResponse = {
  success: boolean;
  request: WithdrawalRequest;
};

export async function createWithdrawalRequest(payload: CreateWithdrawalPayload) {
  return apiFetch<CreateWithdrawalResponse>("/api/withdrawal-requests/account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function listWithdrawalRequests(params?: { page?: number; pageSize?: number }) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", params.page.toString());
  if (params?.pageSize) search.set("pageSize", params.pageSize.toString());
  const qs = search.toString();
  const path = `/api/withdrawal-requests/account${qs ? `?${qs}` : ""}`;
  return apiFetch<WithdrawalListResponse>(path);
}
