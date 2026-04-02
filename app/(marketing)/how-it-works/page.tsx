import Link from "next/link";
import { HeroClassic, HowItWorksLocker, PaymentRecommendation } from "@/components/sections";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { faqCategories } from "@/data/fixtures/faq";

export const metadata = {
  title: "How GreenHub lockers work",
  description: "Step-by-step guide for Northern Ireland locker pickups, payments, and FAQs."
};

export default function HowItWorksPage() {
  return (
    <div className="space-y-10 pb-20">
      <HeroClassic
        highlight="HOME / HOW IT WORKS"
        eyebrow="Locker Playbook"
        title="Order online, collect from private lockers in minutes"
        subtitle="Follow three simple steps to secure your slot, confirm payment, and grab your parcel whenever it suits your evening."
        primaryCta={{ label: "Create an account", href: "/register" }}
        secondaryCta={{ label: "Shop the menu", href: "/products" }}
        tone="soft"
        alignment="left"
        stats={[
          { label: "Locker sites", value: "50+" },
          { label: "Avg. prep", value: "18 min" },
          { label: "Hold window", value: "120 min" }
        ]}
      />

      <HowItWorksLocker />

      <GuideCta />

      <FaqSection />

      <PaymentRecommendation footnote="Need bespoke billing for teams or patients? Email concierge@greenhub420.co.uk for enterprise lockers." />
    </div>
  );
}

function FaqSection() {
  const lockerFaq = faqCategories.find((category) => category.id === "locker")?.entries.slice(0, 4) ?? [];
  return (
    <section className="space-y-6 rounded-3xl border border-white/5 bg-night-950/80 p-6 shadow-surface sm:p-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-ink-500">FAQ</p>
        <h2 className="text-3xl font-semibold text-white">Lockers, payments, and support</h2>
        <p className="text-sm text-ink-400">Short answers to the questions concierge receives most often.</p>
      </header>
      <div className="space-y-4">
        {lockerFaq.map((item) => (
          <Card key={item.id} padding="sm" className="bg-night-900/70">
            <h3 className="text-lg font-semibold text-white">{item.question}</h3>
            <p className="mt-2 text-sm text-ink-400">{item.answer}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function GuideCta() {
  return (
    <section className="rounded-3xl border border-white/10 bg-night-950/70 p-6 shadow-surface sm:flex sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">New to lockers?</p>
        <h2 className="text-2xl font-semibold text-white">Follow the locker onboarding guide</h2>
        <p className="text-sm text-white/70">Step-by-step walkthrough covering payments, PIN codes, and what to do if the locker jams.</p>
      </div>
      <Button asChild className="mt-4 sm:mt-0">
        <Link href="/guide/locker">Open locker guide</Link>
      </Button>
    </section>
  );
}
