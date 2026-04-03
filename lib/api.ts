import { getStoredToken } from "@/lib/auth-store";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const DEV_CUSTOMER_ID = process.env.NEXT_PUBLIC_DEV_CUSTOMER_ID;

const withDevCustomerId = (path: string) => {
  if (!DEV_CUSTOMER_ID) return path;
  try {
    const url = new URL(path, "https://placeholder.local");
    if (!url.searchParams.has("customerId")) {
      url.searchParams.set("customerId", DEV_CUSTOMER_ID);
    }
    return url.pathname + url.search;
  } catch {
    return path;
  }
};

const PUBLIC_ENDPOINT_PREFIXES = ["/api/products", "/api/collections"];

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const finalPath = withDevCustomerId(path.startsWith("/") ? path : `/${path}`);
  const headers = new Headers(init?.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  const runtimeToken = getStoredToken();
  const authToken = runtimeToken || API_TOKEN;
  const shouldSkipAuth = PUBLIC_ENDPOINT_PREFIXES.some((prefix) => finalPath.startsWith(prefix));
  if (!shouldSkipAuth && authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const normalizedBase = BASE_URL.replace(/\/$/, "");
  const response = await fetch(`${normalizedBase}${finalPath}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || response.statusText || "Request failed";
    throw new Error(message);
  }
  return payload as T;
}

export const swrFetcher = <T>(path: string) => apiFetch<T>(path);
export async function apiMutate<T>(path: string, method: 'POST' | 'PUT', body?: unknown) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const init: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };
  return apiFetch<T>(path, init);
}
