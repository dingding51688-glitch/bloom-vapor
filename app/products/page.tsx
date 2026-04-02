"use client";

import clsx from "clsx";
import useSWR from "swr";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/Skeleton";
import { swrFetcher } from "@/lib/api";
import type { ProductRecord, ProductsResponse } from "@/lib/types";
import {
  productCategoryContent,
  productListingFallbacks,
  type ProductCategoryKey
} from "@/data/fixtures/products";

const STRAIN_FILTERS = ["all", "Hybrid", "Indica", "Sativa"] as const;
const CATEGORY_TABS: ProductCategoryKey[] = ["shop-all", "flowers", "pre-rolls", "vapes"];

function resolveCategory(value: string | null): ProductCategoryKey {
  if (value && CATEGORY_TABS.includes(value as ProductCategoryKey)) {
    return value as ProductCategoryKey;
  }
  return "shop-all";
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = resolveCategory(searchParams.get("category"));
  const strainParam = searchParams.get("strain") || "all";
  const strain = STRAIN_FILTERS.includes(strainParam as (typeof STRAIN_FILTERS)[number]) ? strainParam : "all";

  const requestParams = new URLSearchParams({
    "pagination[pageSize]": "12",
    "sort[0]": "createdAt:desc",
    "populate[weightOptions]": "*"
  });
  if (strain !== "all") {
    requestParams.set("filters[strain][$eq]", strain);
  }
  const categoryFilter = productCategoryContent[category].filter;
  if (categoryFilter) {
    requestParams.set(`filters[${categoryFilter.field}][$eq]`, categoryFilter.value);
  }

  const key = `/api/products?${requestParams.toString()}`;
  const { data, isLoading } = useSWR<ProductsResponse>(key, swrFetcher);
  const products = useMemo(() => data?.data ?? [], [data]);

  const displayProducts = useMemo<ProductRecord[]>(() => {
    if (products.length > 0) {
      if (!categoryFilter) {
        return products;
      }
      return products.filter((product) => product.category === categoryFilter.value || !product.category);
    }
    if (!categoryFilter) {
      return productListingFallbacks;
    }
    return productListingFallbacks.filter((product) => product.category === categoryFilter.value);
  }, [products, categoryFilter]);

  const handleCategoryChange = (value: ProductCategoryKey) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "shop-all") {
      next.delete("category");
    } else {
      next.set("category", value);
    }
    const query = next.toString();
    router.replace(query ? `/products?${query}` : "/products", { scroll: false });
  };

  const handleFilterChange = (value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      next.delete("strain");
    } else {
      next.set("strain", value);
    }
    const query = next.toString();
    router.replace(query ? `/products?${query}` : "/products", { scroll: false });
  };

  const hero = productCategoryContent[category];

  return (
    <div className="space-y-6 pb-20">
      <div className="overflow-x-auto px-6 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/80 whitespace-nowrap">
          {hero.breadcrumb}
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-night-950/60 p-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={clsx(
                "rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition",
                category === tab ? "bg-night-900 text-white" : "bg-night-50 text-night-600 hover:text-night-900"
              )}
              onClick={() => handleCategoryChange(tab)}
            >
              {tab === "shop-all" ? "Shop All" : tab.replace("-", " ")}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {STRAIN_FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              className={clsx(
                "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em]",
                strain === option
                  ? "border-night-900 bg-night-900 text-white"
                  : "border-night-200 bg-night-50 text-night-500 hover:text-night-800"
              )}
              onClick={() => handleFilterChange(option)}
            >
              {option === "all" ? "All" : option}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <p className="text-sm text-ink-500">Loading locker inventory…</p>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-64" />
            ))}
          </div>
        </div>
      )}

      {!isLoading && displayProducts.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-night-950/60 p-6 text-center text-sm text-ink-400">
          No products available for this filter. Try All strains or another category later tonight.
        </div>
      )}

      {!isLoading && displayProducts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {displayProducts.map((product) => (
            <ProductCard key={product.documentId} product={product} />
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-night-900/50 p-5 text-sm text-ink-500">
        <p className="font-semibold text-white">Need curated help?</p>
        <p>Ping concierge via Telegram or email and we’ll recommend a locker bundle that matches your palette.</p>
        <Button asChild variant="ghost" className="mt-3 w-full sm:w-auto">
          <a href="mailto:concierge@greenhub420.co.uk">Contact concierge</a>
        </Button>
      </div>
    </div>
  );
}
