import Image from "next/image";
import { Card, Button } from "@/components/ui";
import { featuredProducts } from "@/data/fixtures/marketing";
import type { ProductCardData } from "@/lib/types";

export type ProductCollectionGridProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  products?: ProductCardData[];
  primaryCta?: { label: string; href: string };
};

const toneByIndex = (index: number) => (index % 2 === 0 ? "green" : "orange");

export function ProductCollectionGrid(props: Partial<ProductCollectionGridProps>) {
  const content = {
    eyebrow: "Locker menu",
    title: "Member favourites",
    description: "Curated drops refreshed every Friday at 10am.",
    products: featuredProducts,
    primaryCta: { label: "View full menu", href: "/products" },
    ...props
  } as ProductCollectionGridProps;

  const hasProducts = content.products && content.products.length > 0;

  return (
    <section className="space-y-6 rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,#070707,#050505)] px-6 py-10 shadow-card sm:px-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {content.eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[rgba(255,255,255,0.6)]">
              {content.eyebrow}
            </p>
          )}
          <h2 className="mt-2 text-[28px] font-semibold text-white sm:text-[32px]">
            {content.title}
          </h2>
          {content.description && (
            <p className="mt-2 text-[rgba(255,255,255,0.75)]">{content.description}</p>
          )}
        </div>
        {content.primaryCta && (
          <Button asChild size="md" variant="secondary" className="w-full sm:w-auto">
            <a href={content.primaryCta.href}>{content.primaryCta.label}</a>
          </Button>
        )}
      </div>
      {hasProducts ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {content.products?.map((product, index) => (
            <Card key={product.id} tone={toneByIndex(index)} padding="md" className="flex flex-col gap-4">
              {product.imageUrl && (
                <div className="relative h-40 w-full overflow-hidden rounded-[28px] border border-white/15">
                  <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
                </div>
              )}
              <div className="space-y-2">
                {product.category && (
                  <p className="text-[11px] uppercase tracking-[0.35em] text-[rgba(255,255,255,0.6)]">
                    {product.category}
                  </p>
                )}
                <h3 className="text-lg font-semibold text-white">{product.title}</h3>
                {product.description && (
                  <p className="text-sm text-[rgba(255,255,255,0.75)]">{product.description}</p>
                )}
              </div>
              {product.price && (
                <p className="text-base font-semibold text-white">{product.price}</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-[32px] border border-dashed border-white/20 px-6 py-10 text-center text-sm text-[rgba(255,255,255,0.6)]">
          No products available — check back after the next drop.
        </div>
      )}
    </section>
  );
}

export default ProductCollectionGrid;
