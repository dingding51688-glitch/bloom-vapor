import { apiFetch } from "@/lib/api";
import type {
  StrapiListResponse,
  StrapiSingleResponse,
  TopupIntentResponse,
  TopupRecord,
  TopupTier,
  WalletBalanceResponse,
  WalletTransactionsResponse
} from "@/lib/types";

const mapTier = (entry: { id: number; attributes: Record<string, unknown> }): TopupTier => {
  const attrs = entry.attributes as any;
  return {
    id: entry.id,
    title: attrs.title,
    description: attrs.description || null,
    minAmountUsdt: Number(attrs.minAmountUsdt || 0),
    maxAmountUsdt: attrs.maxAmountUsdt ? Number(attrs.maxAmountUsdt) : null,
    bonusPercent: attrs.bonusPercent ? Number(attrs.bonusPercent) : null,
    isActive: attrs.isActive ?? true
  };
};

export async function listTopupTiers() {
  const response = await apiFetch<StrapiListResponse<any>>(
    "/api/topup-tiers?filters[isActive][$eq]=true&sort=minAmountUsdt:asc"
  );
  return response.data.map(mapTier);
}

export async function createTopupIntent(payload: { amount: number; chain?: "TRC20" | "ERC20" }) {
  return apiFetch<TopupIntentResponse>("/api/wallet/recharge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function pollTopupStatus(topupId: number | string) {
  const response = await apiFetch<StrapiSingleResponse<TopupRecord>>(
    `/api/topups/${topupId}`
  );
  if (!response.data) {
    throw new Error("Top-up not found");
  }
  return {
    id: response.data.id,
    ...response.data.attributes
  };
}

export async function fetchWalletBalance() {
  return apiFetch<WalletBalanceResponse>("/api/wallet/balance");
}

export async function fetchWalletTransactions(page = 1, pageSize = 20) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiFetch<WalletTransactionsResponse>(`/api/wallet/transactions?${params.toString()}`);
}
