import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

const toneMap = {
  green: {
    top: "#101c11",
    bottom: "#182818",
    accent: "#13a86b"
  },
  orange: {
    top: "#2c1608",
    bottom: "#3c200b",
    accent: "#f2a33a"
  },
  cream: {
    top: "#332515",
    bottom: "#251c11",
    accent: "#f5d6a1"
  }
};

export type ProductCategoryTone = keyof typeof toneMap;

export type ProductCategoryCardProps = {
  href: string;
  title: string;
  label?: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
  tone?: ProductCategoryTone;
  imageEmojiFallback?: string;
};

export function ProductCategoryCard({
  href,
  title,
  label,
  subtitle,
  imageUrl,
  imageAlt,
  tone = "green",
  imageEmojiFallback = "🍃"
}: ProductCategoryCardProps) {
  const palette = toneMap[tone] ?? toneMap.green;
  const background = `linear-gradient(180deg, ${palette.top} 0%, ${palette.top} 55%, ${palette.bottom} 55%, ${palette.bottom} 100%)`;

  return (
    <Link
      href={href}
      className="group relative flex min-h-[240px] overflow-hidden rounded-[36px] border border-white/10 bg-[#090909] shadow-[0_25px_70px_rgba(0,0,0,0.35)]"
      style={{ background }}
    >
      <div className="relative z-10 flex w-full flex-col justify-between gap-4 p-6 pr-4 sm:w-3/5">
        <div>
          {label && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70">{label}</p>
          )}
          <h3 className="mt-2 text-2xl font-semibold uppercase tracking-[0.2em] text-white">{title}</h3>
          {subtitle && <p className="mt-2 text-sm text-white/80">{subtitle}</p>}
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition group-hover:translate-x-1 group-hover:-translate-y-1">
          <ArrowIcon />
        </span>
      </div>
      <div className="relative z-10 flex flex-1 items-end justify-center pb-4 pr-4">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            width={220}
            height={220}
            className="h-40 w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
            priority={false}
          />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-white/5 text-4xl">
            <span role="img" aria-hidden="true">
              {imageEmojiFallback}
            </span>
          </div>
        )}
      </div>
      <div
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-20",
          tone === "orange" ? "bg-white" : "bg-white"
        )}
      />
    </Link>
  );
}

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  );
}

export default ProductCategoryCard;
