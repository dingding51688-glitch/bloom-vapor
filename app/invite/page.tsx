"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { contactChannels, featuredCollectionsContent } from "@/data/fixtures/marketing";

const examplePayouts = [
  { label: "50 clicks", amount: "£15.00", description: "£0.30 per click" },
  { label: "3 locker orders", amount: "£27.00", description: "10% lifetime share" },
  { label: "Monthly average", amount: "£42.00", description: "Based on community data" }
];

const steps = [
  {
    title: "Copy your link",
    body: "Grab your invite link or referral code and share it with friends on Telegram, SMS, or socials."
  },
  {
    title: "Friend signs up",
    body: "They enter your code when registering or tap your unique link to prefill the field automatically."
  },
  {
    title: "Earn on every order",
    body: "You get £0.30 when they tap the link + 10% of every locker purchase for life."
  }
];

const faqs = [
  {
    question: "When are rewards paid?",
    answer: "Click rewards post instantly to your wallet. Order commission posts once the locker drop is marked delivered (usually < 12h)."
  },
  {
    question: "How do I withdraw?",
    answer: "Use Wallet → Withdraw to cash out via UK bank or USDT. Minimum balance for transfer is £20."
  },
  {
    question: "Any rules?",
    answer: "No spam, no paid ads, no public coupon dumps. Sharing with friends, Discords, or newsletters you run is perfect."
  }
];

const referralCopy = {
  headline: "Share lockers. Earn cash.",
  subhead: "Earn £0.30 whenever someone taps your link + 10% of everything they spend afterwards.",
  ctaLabel: "Get my locker invite"
};

const MIN_TRANSFER = 20;

export default function InvitePage() {
  const searchParams = useSearchParams();
  const incomingRef = searchParams?.get("ref")?.trim() || "";
  const [customRef, setCustomRef] = useState("");
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [origin, setOrigin] = useState("https://greenhub.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const activeCode = (incomingRef || customRef).toUpperCase();
  const inviteUrl = activeCode ? `${origin}/register?ref=${encodeURIComponent(activeCode)}` : `${origin}/register`;

  const handleCopy = async (value: string, toastLabel?: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopySuccess(toastLabel || "Copied to clipboard");
      setTimeout(() => setCopySuccess(null), 2500);
    } catch (error) {
      setCopySuccess("Copy failed — try manually");
      setTimeout(() => setCopySuccess(null), 2500);
    }
  };

  const conciergeContact = contactChannels[0];
  const heroImage = featuredCollectionsContent[0]?.imageUrl;

  return (
    <section className="space-y-10 px-4 py-10">
      <HeroSection
        heroImage={heroImage}
        copySuccess={copySuccess}
        activeCode={activeCode}
        inviteUrl={inviteUrl}
        onCopy={(value, label) => handleCopy(value, label)}
        onManualCodeChange={setCustomRef}
        incomingRef={incomingRef}
      />

      <RewardsSection />

      <StepsSection />

      <TestimonialSection />

      <FAQSection />

      <ConciergeCTA contact={conciergeContact} inviteUrl={inviteUrl} code={activeCode} onCopy={handleCopy} />
    </section>
  );
}

function HeroSection({
  heroImage,
  copySuccess,
  activeCode,
  inviteUrl,
  onCopy,
  onManualCodeChange,
  incomingRef
}: {
  heroImage?: string;
  copySuccess: string | null;
  activeCode: string;
  inviteUrl: string;
  onCopy: (value: string, label?: string) => void;
  onManualCodeChange: (value: string) => void;
  incomingRef: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,#080808,#040404)] px-6 py-10 shadow-card sm:px-12">
      {heroImage && (
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 opacity-30 md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt="Referral hero" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="relative z-10 max-w-2xl space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Referral campaign</p>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">{referralCopy.headline}</h1>
        <p className="text-lg text-white/80">{referralCopy.subhead}</p>

        <div className="flex flex-wrap gap-3 text-sm text-white/70">
          <StatPill label="Tap reward" value="£0.30" />
          <StatPill label="Lifetime share" value="10%" />
          <StatPill label="Min payout" value={`£${MIN_TRANSFER}`} />
        </div>

        {incomingRef ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">Referral code detected</p>
            <p className="font-mono text-2xl text-white">{activeCode}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onCopy(inviteUrl, "Invite link copied")}>Copy invite link</Button>
              <Link href={`/register?ref=${activeCode}`} className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white hover:border-white/50">
                Register now
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 text-sm text-white/80">
            <label className="text-xs uppercase tracking-[0.35em] text-white/40">Friend code</label>
            <Input
              placeholder="Enter your friend's code"
              onChange={(event) => onManualCodeChange(event.target.value.toUpperCase())}
              className="max-w-sm"
            />
            <p className="text-xs text-white/50">Share this page with your code appended, e.g. <span className="font-mono">/invite?ref=GH123</span>.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => onCopy(inviteUrl, "Invite link copied")}>{referralCopy.ctaLabel}</Button>
          <Link href={activeCode ? `/register?ref=${activeCode}` : "/register"} className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white hover:border-white/50">
            {activeCode ? "Register with this code" : "Create account"}
          </Link>
        </div>
        {copySuccess && <p className="text-xs text-emerald-300">{copySuccess}</p>}
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
      {label}: <span className="ml-1 text-white">{value}</span>
    </div>
  );
}

function RewardsSection() {
  return (
    <section className="space-y-4 rounded-[32px] border border-white/10 bg-card p-6 shadow-card">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">Rewards</p>
        <h2 className="text-2xl font-semibold text-white">Two ways to earn</h2>
        <p className="text-sm text-white/70">Clicks trigger an instant £0.30 bonus. When that friend books lockers, you keep 10% of every order.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <RewardCard
          title="£0.30 per verified click"
          body="Every unique tap that lands on our site credits £0.30 to your wallet. No purchase required."
          badge="Instant"
        />
        <RewardCard
          title="10% of every locker order"
          body="When your friend books lockers, you receive 10% commission for life. Paid after each delivery."
          badge="Lifetime"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {examplePayouts.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{item.label}</p>
            <p className="text-2xl font-semibold text-white">{item.amount}</p>
            <p className="text-xs text-white/60">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RewardCard({ title, body, badge }: { title: string; body: string; badge: string }) {
  return (
    <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 p-5 text-white">
      <span className="inline-flex rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">{badge}</span>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-sm text-white/70">{body}</p>
    </div>
  );
}

function StepsSection() {
  return (
    <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#080808,#030303)] p-6 text-white">
      <p className="text-xs uppercase tracking-[0.35em] text-white/50">How it works</p>
      <h2 className="mt-2 text-2xl font-semibold">Zero-fuss referral flow</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="text-xs uppercase tracking-[0.35em] text-white/40">0{index + 1}</span>
            <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
            <p className="text-sm text-white/70">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialSection() {
  return (
    <section className="rounded-[32px] border border-white/10 bg-card p-6 shadow-card">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">Community highlight</p>
        <blockquote className="text-lg text-white/80">
          “Shared my code with two Discord servers and cleared £120 last month. Locker payouts arrive the same day.”
        </blockquote>
        <p className="text-sm text-white/60">— Hannah, Belfast</p>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="space-y-4 rounded-[32px] border border-white/10 bg-card p-6 shadow-card">
      <p className="text-xs uppercase tracking-[0.35em] text-white/50">FAQ</p>
      <h2 className="text-2xl font-semibold text-white">Questions ops hears daily</h2>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <p className="text-white">{faq.question}</p>
            <p className="text-white/70">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ConciergeCTA({ contact, inviteUrl, code, onCopy }: { contact: any; inviteUrl: string; code: string; onCopy: (value: string, label?: string) => void }) {
  if (!contact) return null;
  return (
    <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#07130c,#030705)] p-6 text-white">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300">Need concierge?</p>
          <h2 className="text-2xl font-semibold">Ping {contact.title}</h2>
          <p className="text-sm text-white/70">Share your Transfer ID or referral code so we can verify rewards faster.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => onCopy(inviteUrl, "Invite link copied")}>Copy invite link</Button>
          {code && (
            <Button variant="secondary" onClick={() => onCopy(code, "Code copied")}>Copy code</Button>
          )}
          {contact.href && (
            <Link href={contact.href} className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white hover:border-white/50">
              Message concierge
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
