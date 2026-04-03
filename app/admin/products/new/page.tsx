import { ProductEditor } from "@/components/admin/ProductEditor";
import { serverFetch } from "@/lib/server-api";
import type { CollectionRecord, StrapiListResponse } from "@/lib/types";

async function fetchCollections() {
  try {
    const response = await serverFetch<StrapiListResponse<CollectionRecord>>(
      "/api/collections?pagination[pageSize]=100&sort=title"
    );
    return response.data.map((entry) => ({ id: entry.id, title: entry.attributes.title }));
  } catch {
    return [];
  }
}

export default async function NewProductPage() {
  const collections = await fetchCollections();
  return (
    <section className="space-y-6 px-4 py-8">
      <h1 className="text-3xl font-semibold text-white">New product</h1>
      <ProductEditor mode="create" collections={collections} />
    </section>
  );
}
