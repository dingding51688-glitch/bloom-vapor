import Link from "next/link";
import Button from "@/components/ui/button";

const walletSteps = [
  {
    title: "Copy Transfer ID",
    detail: "Find it on /wallet. Always include it in bank/USDT references so ops can auto-match funds."
  },
  {
    title: "Top up minimum £20",
    detail: "Wallet recharges under £20 are rejected. Wallet top-ups settle instantly; bank/crypto can take up to 30 minutes."
  },
  {
    title: "Watch for balance updates",
    detail: "Wallet balance refreshes automatically. If you don’t see it, screenshot the receipt and send it to concierge." 
  }
];

const nowPaymentsSteps = [
  {
    title: "Generate invoice",
    detail: "At /wallet/topup choose NowPayments. Pick USDT TRC20/ ERC20 or card/Apple Pay."
  },
  {
    title: "Follow the instructions",
    detail: "NowPayments redirects you to their hosted checkout. Complete the prompts before the timer expires."
  },
  {
    title: "Status updates",
    detail: "We poll the invoice every few seconds. Once NowPayments confirms, the wallet credit posts immediately." 
  }
];

const manualSteps = [
  {
    title: "Use the bank details on /wallet/topup",
    detail: "Account name: GreenHub Processing Ltd. Always include Transfer ID or locker email in the reference."
  },
  {
    title: "USDT direct transfer",
    detail: "Send to the TRC20/ERC20 address listed. DM concierge with TX hash + Transfer ID for manual confirmation."
  },
  {
    title: "Ops confirmation",
    detail: "Manual transfers credit once ops verifies the receipt—usually within 15 minutes. Keep screenshots handy." 
  }
];

const faqs = [
  {
    q: "Why is there a £20 minimum?",
    a: "It keeps payment processor fees reasonable and reduces fraud. Anything below £20 is auto-refunded minus fees."
  },
  {
    q: "Can I pay cash on delivery?",
    a: "We only accept wallet, NowPayments, or bank/USDT transfers. Locker runners do not carry cash." 
  },
  {
    q: "What if NowPayments flags my card?",
    a: "They have their own risk filters. If the invoice fails twice, switch to wallet/bank or contact concierge for manual review."
  },
  {
    q: "Do you refund to wallet or bank?",
    a: "Wallet credits are instant. Bank/USDT refunds go back to the sending channel and can take 1–3 business days." 
  }
];

export const metadata = {
  title: "Payment guide",
  description: "Wallet top-ups, NowPayments, and manual transfers explained."
};

export default function PaymentGuidePage() {
  return (
    <section className="space-y-10 pb-20">
      <header className="rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,#04130d,#020607)] px-6 py-10 text-white sm:px-12">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">Payments</p>
        <h1 className="mt-2 text-4xl font-semibold">Fund your locker in seconds</h1>
        <p className="mt-3 text-lg text-white/80">Wallet recharges, NowPayments invoices, and manual bank/USDT transfers—here’s how each method works.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/wallet/topup">Start a top-up</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/wallet/withdraw">Withdraw funds</Link>
          </Button>
        </div>
      </header>

      <GuideSection title="Wallet recharge" subtitle="Fastest way to fund lockers" steps={walletSteps} />
      <GuideSection title="NowPayments" subtitle="Card, Apple Pay, or USDT via hosted checkout" steps={nowPaymentsSteps} />
      <GuideSection title="Bank / direct USDT" subtitle="Manual transfers with concierge confirmation" steps={manualSteps} />

      <section className="space-y-4 rounded-[32px] border border-white/10 bg-night-950/80 p-6">
        <header>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">FAQ</p>
          <h2 className="text-2xl font-semibold text-white">Payments, fees, and troubleshooting</h2>
        </header>
        <div className="space-y-3">
          {faqs.map((item) => (
            <details key={item.q} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              <summary className="cursor-pointer text-lg font-semibold text-white">{item.q}</summary>
              <p className="mt-2 text-sm text-white/70">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-night-950/80 p-6 text-white">
        <h2 className="text-2xl font-semibold">Still need help?</h2>
        <p className="mt-2 text-sm text-white/70">Share your Transfer ID and any receipts with concierge. We’ll match the payment and credit or refund as needed.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/support">Contact concierge</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/guide/locker">Locker onboarding guide</Link>
          </Button>
        </div>
      </section>
    </section>
  );
}

type GuideSectionProps = {
  title: string;
  subtitle: string;
  steps: { title: string; detail: string }[];
};

function GuideSection({ title, subtitle, steps }: GuideSectionProps) {
  return (
    <section className="space-y-5 rounded-[32px] border border-white/10 bg-night-950/60 p-6">
      <header>
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">{title}</p>
        <h2 className="text-2xl font-semibold text-white">{subtitle}</h2>
      </header>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-sm font-semibold text-white/70">
              0{index + 1}
            </span>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-1 text-sm text-white/70">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
