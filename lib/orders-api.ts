import { getStoredToken } from "@/lib/auth-store";
import type { OrderRecord } from "@/lib/types";

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";

function requireAuthBase() {
  if (!AUTH_BASE) {
    throw new Error("NEXT_PUBLIC_AUTH_BASE_URL is not configured");
  }
}

async function ordersFetch<T>(path: string, init?: RequestInit): Promise<T> {
  requireAuthBase();
  const token = getStoredToken();
  if (!token) throw new Error("Login required");
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  const response = await fetch(`${AUTH_BASE}${path}`, {
    ...init,
    headers
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Order request failed");
  }
  return payload as T;
}

export type OrderItemInput = {
  productId: number;
  quantity: number;
  unitPrice: number;
  weight?: string;
};

export type CreateOrderPayload = {
  items: OrderItemInput[];
  lockerPostcode?: string;
  pickupWindow?: string;
  contactName?: string;
  contactPhone?: string;
  telegramHandle?: string;
  paymentOption?: string;
};

export type OrderItem = {
  productId: number;
  title?: string;
  quantity: number;
  unitPrice: number;
  weight?: string;
};

export type CreateOrderResponse = {
  success: boolean;
  order: OrderRecord;
};

export async function createOrder(payload: CreateOrderPayload) {
  return ordersFetch<CreateOrderResponse>("/api/orders/checkout", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export type OrdersListResponse = {
  success: boolean;
  data: OrderRecord[];
  meta?: unknown;
};

export async function listMyOrders(params?: { page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.pageSize) query.set("pageSize", params.pageSize.toString());
  const qs = query.toString();
  const pathUrl = qs ? `/api/orders/mine?${qs}` : "/api/orders/mine";
  return ordersFetch<OrdersListResponse>(pathUrl);
}

export type OrderTrackingResponse = {
  success: boolean;
  order: OrderRecord;
};

export async function getOrderTracking(referenceOrId: string) {
  return ordersFetch<OrderTrackingResponse>(`/api/orders/${referenceOrId}/tracking`);
}
