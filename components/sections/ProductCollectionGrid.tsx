import Image from "next/image";
import { Button } from "@/components/ui";
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

const tonePalette = {
  green: {
    top: "#101c11",
    bottom: "#1b2b1b",
    accent: "#13a86b"
  },
  orange: {
    top: "#2c1608",
    bottom: "#3c200b",
    accent: "#f2a33a"
  }
};

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
          {content.products?.map((product, index) => {
            const tone = toneByIndex(index);
            const palette = tonePalette[tone as keyof typeof tonePalette] ?? tonePalette.green;
            const background = `linear-gradient(180deg, ${palette.top} 0%, ${palette.top} 55%, ${palette.bottom} 55%, ${palette.bottom} 100%)`;

            return (
              <article
                key={product.id}
                className="relative flex min-h-[240px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#0b0b0b] text-white sm:flex-row"
                style={{ background }}
              >
                <div className="relative z-10 flex flex-1 flex-col gap-3 p-5">
                  {product.category && (
                    <p className="text-[11px] uppercase tracking-[0.35em] text-white/70">{product.category}</p>
                  )}
                  <h3 className="text-xl font-semibold">{product.title}</h3>
                  {product.description && (
                    <p className="text-sm text-white/80">{product.description}</p>
                  )}
                  <div className="mt-auto flex items-center gap-4">
                    {product.price && <span className="text-base font-semibold">{product.price}</span>}
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10">
                      <ArrowIcon />
                    </span>
                  </div>
                </div>
                <div className="relative z-10 flex w-full items-end justify-center pb-4 pr-4 sm:w-2/5">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      width={200}
                      height={200}
                      className="h-36 w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
                    />
                  ) : (
                    <PlaceholderBadge title={product.title} />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[32px] border border-dashed border-white/20 px-6 py-10 text-center text-sm text-[rgba(255,255,255,0.6)]">
          No products available — check back after the next drop.
        </div>
      )}
    </section>
  );
}

function PlaceholderBadge({ title }: { title: string }) {
  const initial = title.charAt(0).toUpperCase();
  return (
    <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/20 bg-white/5 text-3xl text-white/70">
      {initial}
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  );
}

export default ProductCollectionGrid;
