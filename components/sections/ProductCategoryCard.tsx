import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

const toneMap = {
  green: {
    top: "#0f1b0f",
    bottom: "#1b2b1b",
    accent: "#13a86b",
    overlay: "rgba(19,168,107,0.18)"
  },
  orange: {
    top: "#3b1b06",
    bottom: "#4c260c",
    accent: "#f2a33a",
    overlay: "rgba(242,163,58,0.2)"
  },
  cream: {
    top: "#2f2416",
    bottom: "#20170f",
    accent: "#f5d6a1",
    overlay: "rgba(245,214,161,0.15)"
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
  const background = `linear-gradient(180deg, ${palette.top} 0%, ${palette.top} 58%, ${palette.bottom} 58%, ${palette.bottom} 100%)`;

  return (
    <Link
      href={href}
      className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-[40px] border border-white/10 bg-[#050505] text-white shadow-[0_25px_70px_rgba(0,0,0,0.35)] sm:flex-row"
      style={{ background }}
    >
      <div className="relative z-10 flex w-full flex-col justify-between gap-5 px-6 py-6 sm:w-3/5">
        <div>
          {label && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/75">{label}</p>
          )}
          <h3 className="mt-3 text-2xl font-semibold uppercase tracking-[0.22em]">{title}</h3>
          {subtitle && <p className="mt-3 text-sm text-white/80">{subtitle}</p>}
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition group-hover:translate-x-1 group-hover:-translate-y-1">
          <ArrowIcon />
        </span>
      </div>
      <div className="relative z-10 flex flex-1 items-end justify-center px-4 pb-4 sm:justify-end sm:px-0 sm:pr-8">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            width={280}
            height={280}
            className="h-44 w-auto object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
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
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div
          className="absolute -bottom-12 -right-16 h-56 w-56 rounded-[50%] blur-[60px]"
          style={{ background: palette.overlay }}
        />
        <div className="absolute bottom-0 right-0 h-32 w-32 rounded-tl-[90%] bg-white/5" />
      </div>
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
