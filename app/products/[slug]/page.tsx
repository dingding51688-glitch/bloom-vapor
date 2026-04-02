import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ProductImageZoom } from "@/components/ProductImageZoom";
import type { ProductRecord, ProductsResponse } from "@/lib/types";
import { serverFetch } from "@/lib/server-api";
import { ProductDetailPurchase } from "./purchase-panel";
import { getProductListingMeta, productListingFallbacks } from "@/data/fixtures/products";
import { FavoriteToggle } from "@/components/FavoriteToggle";

async function getProduct(slug: string) {
  const query = new URLSearchParams({
    "filters[slug][$eq]": slug,
    "populate[weightOptions]": "*",
    "populate[coverImage]": "*"
  });
  try {
    const data = await serverFetch<ProductsResponse>(`/api/products?${query.toString()}`);
    if (data.data?.[0]) {
      return data.data[0];
    }
  } catch (error) {
    console.warn("Strapi product fetch failed, falling back to fixtures", error);
  }
  return buildFallbackProduct(slug);
}

async function getRelatedProducts(slug: string) {
  const query = new URLSearchParams({
    "filters[slug][$ne]": slug,
    "pagination[pageSize]": "4",
    "sort[0]": "createdAt:desc",
    "populate[weightOptions]": "*",
    "populate[coverImage]": "*"
  });
  try {
    const data = await serverFetch<ProductsResponse>(`/api/products?${query.toString()}`);
    if (data.data) {
      return data.data;
    }
  } catch (error) {
    console.warn("Strapi related-products fetch failed, using fixtures", error);
  }
  return productListingFallbacks.filter((product) => product.slug !== slug).slice(0, 4);
}

function formatPriceRange(product: ProductRecord) {
  const prices = product.weightOptions?.map((option) => option.price);
  if (prices && prices.length > 0) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `£${min.toFixed(0)}`;
    return `£${min.toFixed(0)} – £${max.toFixed(0)}`;
  }
  return `From £${product.priceFrom.toFixed(0)}`;
}

function selectCuratedProducts(products: ProductRecord[], currentSlug: string) {
  if (products.length > 0) {
    return products.filter((product) => product.slug !== currentSlug).slice(0, 4);
  }
  return productListingFallbacks.filter((product) => product.slug !== currentSlug).slice(0, 4);
}

function buildFallbackProduct(slug: string): ProductRecord | null {
  const base = productListingFallbacks.find((product) => product.slug === slug) ?? productListingFallbacks[0];
  if (!base) return null;
  const meta = getProductListingMeta(base.slug);
  return {
    ...base,
    coverImage: meta?.imageUrl
      ? {
          url: meta.imageUrl,
          alternativeText: meta?.imageAlt ?? base.title
        }
      : base.coverImage,
    rating: base.rating ?? meta?.rating ?? 4.9,
    reviews: base.reviews ?? meta?.reviews ?? 0
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [product, relatedProducts] = await Promise.all([getProduct(params.slug), getRelatedProducts(params.slug)]);
  if (!product) {
    notFound();
  }

  const curated = selectCuratedProducts(relatedProducts, product.slug);

  return (
    <div className="space-y-10 pb-20">
      <section className="grid gap-6 lg:grid-cols-[3fr,2fr]">
        <ProductHero product={product} />
        <ProductDetailPurchase product={product} />
      </section>

      <StrainInfo />

      <CuratedPicks products={curated} />
    </div>
  );
}

function ProductHero({ product }: { product: ProductRecord }) {
  const meta = getProductListingMeta(product.slug);
  const imageUrl = product.coverImage?.url ?? meta?.imageUrl;
  const imageAlt = product.coverImage?.alternativeText ?? meta?.imageAlt ?? product.title;
  const rating = product.rating ?? meta?.rating ?? 4.9;
  const reviews = product.reviews ?? meta?.reviews ?? 0;
  const origin = meta?.origin ?? "🇬🇧 Locker verified";
  const priceRange = formatPriceRange(product);

  return (
    <div className="space-y-6 rounded-[40px] border border-white/10 bg-night-950/80 p-6 shadow-card">
      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <ProductImageZoom imageUrl={imageUrl} imageAlt={imageAlt} badge={product.heroBadge} />
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-ink-500">{product.strain} strain</p>
            <FavoriteToggle product={product} layout="pill" />
          </div>
          <h1 className="text-4xl font-semibold text-white">{product.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-ink-400">
            <span className="flex items-center gap-1 text-amber-200">
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-current">
                <path d="M12 2.5l2.9 6 6.6.5-5 4.4 1.5 6.4L12 16.7 6 19.8l1.5-6.4-5-4.4 6.6-.5z" />
              </svg>
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-ink-500">({reviews})</span>
            </span>
            <span className="text-white font-semibold">{priceRange}</span>
          </div>
          <p className="text-sm text-ink-400">{product.description}</p>
          <div className="flex flex-wrap gap-3 text-xs text-ink-400">
            {product.thc && <span className="rounded-full border border-white/20 px-3 py-1 text-white">{product.thc}</span>}
            {product.potency && <span className="rounded-full border border-white/20 px-3 py-1 text-white">{product.potency}</span>}
            <span className="rounded-full border border-white/20 px-3 py-1 text-white">{origin}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StrainInfo() {
  return (
    <section id="strain-info" className="rounded-[32px] border border-white/10 bg-night-950/70 p-6">
      <Card
        title="Locker-ready experience"
        description="Locker-ready flower, hand bottled the morning of delivery. Expect dense buds, terpene-heavy aroma, and discreet packaging that slides into any Bloom locker."
      >
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>Sourced from small-batch EU cultivators.</li>
          <li>Slow cured 14 days and nitrogen-flushed.</li>
          <li>Consumer lab reports available on request.</li>
        </ul>
      </Card>
    </section>
  );
}

function CuratedPicks({ products }: { products: ProductRecord[] }) {
  if (products.length === 0) return null;
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-ink-500">Curated picks</p>
          <h2 className="text-3xl font-semibold text-white">Related locker drops</h2>
        </div>
        <Button asChild variant="ghost" className="w-full sm:w-auto">
          <Link href="/products">View menu</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <ProductCard key={product.documentId} product={product} />
        ))}
      </div>
    </section>
  );
}
