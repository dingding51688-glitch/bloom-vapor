import { getStoredToken } from "@/lib/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const ensureLeadingSlash = (path: string) => (path.startsWith("/") ? path : `/${path}`);

async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const token = getStoredToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");

  const response = await fetch(`${API_BASE.replace(/\/$/, "")}${ensureLeadingSlash(path)}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => ({})) : undefined;

  if (!response.ok) {
    const message = (payload as any)?.error?.message || response.statusText || "Request failed";
    throw new Error(message);
  }

  return (payload as T) ?? ({} as T);
}

export type WeightOptionInput = {
  id?: number;
  label: string;
  price: number;
  unitPrice?: string;
  featured?: boolean;
};

export type ProductInputPayload = {
  title: string;
  slug?: string;
  description?: string;
  heroBadge?: string;
  priceFrom: number;
  strain?: string;
  thc?: string;
  potency?: string;
  origin?: string;
  originFlag?: string;
  collection?: number | null;
  featuredImage: number;
  gallery?: number[];
  weightOptions?: WeightOptionInput[];
};

export type StrapiCreateResponse<T> = {
  data: {
    id: number;
    attributes: T & { slug?: string };
  };
};

export async function createProduct(payload: ProductInputPayload) {
  return adminFetch<StrapiCreateResponse<{ slug: string }>>("/api/products", {
    method: "POST",
    body: JSON.stringify({ data: payload })
  });
}

export async function updateProduct(productId: number | string, payload: ProductInputPayload) {
  return adminFetch<StrapiCreateResponse<{ slug: string }>>(`/api/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ data: payload })
  });
}

export type UploadAsset = {
  id: number;
  name: string;
  url: string;
  alternativeText?: string;
  formats?: Record<string, { url: string }>;
};

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("files", file);
  return adminFetch<UploadAsset[]>("/api/upload", {
    method: "POST",
    body: formData
  });
}
