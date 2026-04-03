import { resolveServerBase } from "@/lib/server-base";

const API_BASE =
  resolveServerBase(process.env.NEXT_PUBLIC_API_BASE_URL, { fallback: "http://127.0.0.1:1338" }) ||
  "http://127.0.0.1:1338";

export async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}${normalizedPath}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers || {})
    },
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
