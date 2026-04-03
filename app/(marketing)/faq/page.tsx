"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { faqCategories, flatFaqEntries } from "@/data/fixtures/faq";

export default function FaqPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const initialCategory = searchParams?.get("category") || "all";
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  const entries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const source = category === "all"
      ? flatFaqEntries
      : flatFaqEntries.filter((entry: any) => entry.category === category);
    if (!normalizedQuery) return source;
    return source.filter((entry) =>
      entry.question.toLowerCase().includes(normalizedQuery) ||
      entry.answer.toLowerCase().includes(normalizedQuery) ||
      entry.keywords?.some((keyword) => keyword.toLowerCase().includes(normalizedQuery))
    );
  }, [category, query]);

  const topCards = entries.slice(0, 3);

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory);
    const params = new URLSearchParams(searchParams?.toString());
    if (nextCategory === "all") {
      params.delete("category");
    } else {
      params.set("category", nextCategory);
    }
    router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
  };

  return (
    <section className="space-y-10 pb-20">
      <header className="rounded-[40px] border border-white/10 bg-night-950/80 px-6 py-10 text-white sm:px-12">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">FAQ</p>
        <h1 className="mt-2 text-4xl font-semibold">Locker knowledge base</h1>
        <p className="mt-2 text-lg text-white/70">Search or browse by topic. Links below open guides, payment walkthroughs, and support threads.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {faqCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                category === cat.id ? "border-white bg-white/10 text-white" : "border-white/15 text-white/70 hover:border-white/40"
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
        <div className="mt-6 max-w-2xl">
          <Input
            placeholder="Search locker, payment, referral questions..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </header>

      <TopFaqCards cards={topCards} category={category} />

      <section className="space-y-4 rounded-3xl border border-white/10 bg-night-950/70 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">All questions</p>
        {entries.length === 0 ? (
          <p className="text-sm text-white/60">No results. Try a different keyword or browse the locker/payment guides.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <details key={entry.id} id={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                <summary className="cursor-pointer text-lg font-semibold text-white">{entry.question}</summary>
                <p className="mt-2 text-sm text-white/70">{entry.answer}</p>
              </details>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-night-950/80 p-6 text-white">
        <h2 className="text-2xl font-semibold">Still unsure?</h2>
        <p className="mt-2 text-sm text-white/70">Share screenshots + Transfer ID with concierge. Locker issues, payments, or referrals—one URL for all support flows.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/support">Contact concierge</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/guide/locker">Locker guide</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/guide/payment">Payment guide</Link>
          </Button>
        </div>
      </section>
    </section>
  );
}

type TopCardProps = {
  cards: any[];
  category: string;
};

function TopFaqCards({ cards, category }: TopCardProps) {
  if (!cards.length) return null;
  return (
    <section className="space-y-4 rounded-[32px] border border-white/10 bg-card p-6 shadow-card">
      <p className="text-xs uppercase tracking-[0.35em] text-white/50">Top {category === "all" ? "questions" : faqCategories.find((c) => c.id === category)?.title}</p>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <p className="text-lg font-semibold text-white">{card.question}</p>
            <p className="mt-2 text-sm text-white/70">{card.answer.substring(0, 160)}...</p>
            <Button asChild variant="ghost" size="sm" className="mt-3">
              <a href={`#${card.id}`}>View answer</a>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
