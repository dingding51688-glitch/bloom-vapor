import { ProductEditor } from "@/components/admin/ProductEditor";
import { serverFetch } from "@/lib/server-api";
import type { AdminProductRecord, CollectionRecord, StrapiListResponse, StrapiMedia, StrapiSingleResponse } from "@/lib/types";
import { notFound } from "next/navigation";

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

async function fetchProduct(productId: string): Promise<AdminProductRecord | null> {
  try {
    const response = await serverFetch<
      StrapiSingleResponse<{
        title: string;
        slug: string;
        description?: string;
        heroBadge?: string;
        priceFrom: number;
        strain?: string;
        thc?: string;
        potency?: string;
        origin?: string;
        originFlag?: string;
        weightOptions?: Array<{ id?: number; label: string; price: number; unitPrice?: string; featured?: boolean }>;
        featuredImage?: { data: StrapiMedia | null };
        gallery?: { data: StrapiMedia[] };
        collection?: {
          data: {
            id: number;
            attributes: { title: string };
          } | null;
        };
      }>
    >(`/api/products/${productId}?populate=featuredImage,gallery,weightOptions,collection`);

    if (!response.data) return null;
    const attrs = response.data.attributes;
    const mapMedia = (entity?: StrapiMedia | null) => {
      if (!entity) return null;
      return {
        id: entity.id,
        url: entity.attributes.url,
        name: entity.attributes.name
      };
    };

    const galleryMedia = attrs.gallery?.data ?? [];
    const gallery = galleryMedia
      .map((item) => mapMedia(item))
      .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset));

    return {
      id: response.data.id,
      title: attrs.title,
      slug: attrs.slug,
      description: attrs.description,
      heroBadge: attrs.heroBadge,
      priceFrom: attrs.priceFrom,
      strain: attrs.strain,
      thc: attrs.thc,
      potency: attrs.potency,
      origin: attrs.origin,
      originFlag: attrs.originFlag,
      weightOptions: attrs.weightOptions,
      featuredImage: mapMedia(attrs.featuredImage?.data || null),
      gallery,
      collection: attrs.collection?.data
        ? { id: attrs.collection.data.id, title: attrs.collection.data.attributes.title }
        : null
    };
  } catch (error) {
    console.error("Failed to load product", error);
    return null;
  }
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, collections] = await Promise.all([fetchProduct(params.id), fetchCollections()]);
  if (!product) {
    notFound();
  }
  return (
    <section className="space-y-6 px-4 py-8">
      <h1 className="text-3xl font-semibold text-white">Edit product</h1>
      <ProductEditor mode="edit" initialProduct={product} collections={collections} />
    </section>
  );
}
