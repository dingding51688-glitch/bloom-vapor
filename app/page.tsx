import { HeroClassic, HowItWorksLocker, PaymentRecommendation, ProductCategoryCard, ProductCollectionGrid } from "@/components/sections";
import type { ProductCardData, ProductsResponse } from "@/lib/types";
import { serverFetch } from "@/lib/server-api";
import { featuredCollectionsContent, homeHeroContent } from "@/data/fixtures/marketing";

async function getHighlightedProducts(): Promise<ProductCardData[]> {
  try {
    const params = new URLSearchParams({
      "pagination[page]": "1",
      "pagination[pageSize]": "4",
      "sort[0]": "createdAt:desc",
      "populate[weightOptions]": "*"
    });
    const response = await serverFetch<ProductsResponse>(`/api/products?${params.toString()}`);
    return (response.data || []).map((product) => ({
      id: product.documentId,
      title: product.title,
      category: product.strain,
      description: product.description,
      price: `£${product.priceFrom.toFixed(2)}`,
      badge: product.heroBadge ?? undefined
    }));
  } catch (error) {
    console.error("Failed to load highlighted products", error);
    return [];
  }
}

export default async function HomePage() {
  const highlightedProducts = await getHighlightedProducts();

  return (
    <div className="space-y-10 pb-20">
      <HeroClassic {...homeHeroContent} />

      <FeaturedCollections />

      <ProductCollectionGrid
        title="Featured products"
        description="Live menu pulled directly from Strapi so members can see what's ready right now."
        products={highlightedProducts}
        primaryCta={{ label: "View full menu", href: "/products" }}
      />

      <div id="lockers">
        <HowItWorksLocker />
      </div>

      <PaymentRecommendation />
    </div>
  );
}

function FeaturedCollections() {
  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {featuredCollectionsContent.map((collection) => (
        <ProductCategoryCard key={collection.title} {...collection} />
      ))}
    </section>
  );
}
