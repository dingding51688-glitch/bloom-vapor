"use client";

import Image from "next/image";
import Link from "next/link";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import type { ProductRecord } from "@/lib/types";
import { getProductListingMeta } from "@/data/fixtures/products";
import { FavoriteToggle } from "@/components/FavoriteToggle";

interface ProductCardProps {
  product: ProductRecord;
  variant?: "grid" | "list";
}

function formatPriceRange(product: ProductRecord) {
  const prices = product.weightOptions?.map((option) => option.price).filter(Boolean);
  if (prices && prices.length > 0) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
      return `£${min.toFixed(0)}`;
    }
    return `£${min.toFixed(0)} – £${max.toFixed(0)}`;
  }
  return `From £${product.priceFrom.toFixed(0)}`;
}

export function ProductCard({ product, variant = "grid" }: ProductCardProps) {
  const meta = getProductListingMeta(product.slug) ?? {};
  const rating = product.rating ?? meta.rating ?? 4.9;
  const reviews = product.reviews ?? meta.reviews ?? 0;
  const potency = product.potency ?? meta.potencyBadge ?? "Medium";
  const origin = meta.origin ?? "🇬🇧 Locker verified";
  const imageUrl = meta.imageUrl ?? product.coverImage?.url;
  const imageAlt = meta.imageAlt ?? product.coverImage?.alternativeText ?? product.title;
  const priceRange = formatPriceRange(product);

  return (
    <Card className="flex flex-col gap-4 bg-night-950/70 p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,#0d1b13,#050505)] sm:w-40 sm:flex-none">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(min-width: 640px) 160px, 100vw"
              className="object-contain p-4"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white/60">Locker shot</div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white/80">
            {potency}
          </span>
          <div className="absolute right-3 top-3">
            <FavoriteToggle product={product} />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-ink-500">{product.strain} strain</p>
            <h3 className="text-2xl font-semibold text-white">{product.title}</h3>
            <p className="text-sm text-ink-400">{product.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-400">
            <span className="flex items-center gap-1 text-amber-200">
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-current">
                <path d="M12 2.5l2.9 6 6.6.5-5 4.4 1.5 6.4L12 16.7 6 19.8l1.5-6.4-5-4.4 6.6-.5z" />
              </svg>
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-ink-500">({reviews})</span>
            </span>
            {product.thc && <span>{product.thc}</span>}
            <span>{origin}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-night-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-500">Price range</p>
          <p className="text-xl font-semibold text-white">{priceRange}</p>
        </div>
        <Button asChild variant={variant === "grid" ? "primary" : "secondary"} className="w-full sm:w-auto">
          <Link href={`/products/${product.slug}`}>View strain</Link>
        </Button>
      </div>
    </Card>
  );
}
