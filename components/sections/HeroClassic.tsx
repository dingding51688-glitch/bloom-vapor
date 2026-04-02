"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { heroClassicContent, HeroLink } from "@/data/fixtures/marketing";

export type HeroClassicProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  highlight?: string;
  primaryCta?: HeroLink;
  secondaryCta?: HeroLink;
  stats?: { label: string; value: string }[];
};

export function HeroClassic(props: Partial<HeroClassicProps>) {
  const content = { ...heroClassicContent, ...props } as HeroClassicProps;

  return (
    <section className="relative isolate overflow-hidden rounded-[40px] border border-white/10 bg-hero-gradient px-6 py-12 shadow-card sm:px-12">
      <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 20% -10%, rgba(19,168,107,0.45), transparent 55%)" }} aria-hidden="true" />
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-8 text-center">
        {content.highlight && (
          <span className="inline-flex items-center justify-center self-center rounded-pill border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-[rgba(255,255,255,0.7)]">
            {content.highlight}
          </span>
        )}
        <div className="space-y-4">
          {content.eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[rgba(255,255,255,0.6)]">
              {content.eyebrow}
            </p>
          )}
          <h1 className="text-[34px] font-semibold leading-[1.3] text-white sm:text-[40px]">
            {content.title}
          </h1>
          {content.subtitle && (
            <p className="text-base text-[rgba(255,255,255,0.8)] sm:text-lg">{content.subtitle}</p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {content.primaryCta && (
            <Link href={content.primaryCta.href} className="w-full sm:w-auto">
              <Button size="lg" className="w-full">
                {content.primaryCta.label}
              </Button>
            </Link>
          )}
          {content.secondaryCta && (
            <Link href={content.secondaryCta.href} className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full text-[rgba(255,255,255,0.85)]">
                {content.secondaryCta.label}
              </Button>
            </Link>
          )}
        </div>
        {content.stats && content.stats.length > 0 && (
          <dl className="grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
            {content.stats.map((stat) => (
              <div key={stat.label} className="rounded-[28px] border border-white/15 bg-white/5 px-6 py-4 text-center backdrop-blur">
                <dt className="text-[11px] uppercase tracking-[0.3em] text-[rgba(255,255,255,0.6)]">
                  {stat.label}
                </dt>
                <dd className="mt-3 text-2xl font-semibold text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

export default HeroClassic;
