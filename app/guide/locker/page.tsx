import Link from "next/link";
import Button from "@/components/ui/button";

const prepSteps = [
  {
    title: "Set up your wallet",
    detail: "Top up at least £20 and copy your Transfer ID. You’ll need it in every payment reference."
  },
  {
    title: "Pick your locker",
    detail: "At checkout enter the postcode closest to you. We hold lockers for 120 minutes once the parcel is ready."
  },
  {
    title: "Choose payment",
    detail: "Wallet is instant. Bank / USDT payments are also accepted — remember to include the Transfer ID."
  }
];

const pickupSteps = [
  {
    title: "Watch for SMS + email",
    detail: "You’ll get the locker address, PIN, and a QR link once concierge loads your parcel."
  },
  {
    title: "Go to the locker",
    detail: "Scan the QR or enter the PIN on the keypad. Most lockers open within 2 seconds." 
  },
  {
    title: "Grab & close",
    detail: "Take the parcel, close the door firmly, then reply DONE to the SMS so we can mark the drop complete."
  }
];

const incidentSteps = [
  {
    title: "Locker jam or won’t open",
    detail: "Reply HELP + locker ID to the SMS thread or Telegram concierge. Ops reroutes you within 15 minutes."
  },
  {
    title: "Missed window",
    detail: "Lockers auto-lock after 120 minutes. Text the thread and we’ll reassign the parcel to the next available unit." 
  },
  {
    title: "Need re-delivery",
    detail: "If you can’t reach the site that night, we can return the parcel to Belfast HQ for collection the next day."
  }
];

const faqs = [
  {
    q: "Why do you need my Transfer ID?",
    a: "It’s the unique reference that links payments and locker drops to your account. Add it to every bank/USDT transfer."
  },
  {
    q: "How long do lockers hold my parcel?",
    a: "We hold for 120 minutes after the “ready” SMS. If you need longer, reply to the thread before the timer expires."
  },
  {
    q: "Can someone else pick up for me?",
    a: "Yes — just forward them the SMS/Email with the locker PIN. You are still responsible for closing the door and replying DONE."
  },
  {
    q: "What happens if the parcel looks tampered?",
    a: "Take photos, close the locker, and text HELP immediately. Ops will dispatch a runner or refund depending on the inspection." 
  }
];

export const metadata = {
  title: "Locker onboarding guide",
  description: "Everything you need to know before and after your first locker drop."
};

export default function LockerGuidePage() {
  return (
    <section className="space-y-10 pb-20">
      <header className="rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,#050505,#0b1410)] px-6 py-10 text-white sm:px-12">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">Locker onboarding</p>
        <h1 className="mt-2 text-4xl font-semibold">Ace your first locker run</h1>
        <p className="mt-3 text-lg text-white/80">
          Everything from funding your wallet to replying DONE after you collect. Save this page, or share it with friends before their first drop.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/70">
          <span className="rounded-full border border-white/20 px-4 py-1">Hold window 120 min</span>
          <span className="rounded-full border border-white/20 px-4 py-1">Reply DONE after pickup</span>
          <span className="rounded-full border border-white/20 px-4 py-1">Include Transfer ID in payments</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/wallet/topup">Top up wallet</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/support">Talk to concierge</Link>
          </Button>
        </div>
      </header>

      <GuideSection title="Before you order" subtitle="Prep in under 5 minutes" steps={prepSteps} />
      <GuideSection title="After you receive the locker SMS" subtitle="Follow this sequence" steps={pickupSteps} />
      <GuideSection title="If something goes wrong" subtitle="We resolve most incidents within 15 minutes" steps={incidentSteps} />

      <section className="space-y-4 rounded-[32px] border border-white/10 bg-night-950/70 p-6">
        <header>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">FAQ</p>
          <h2 className="text-2xl font-semibold text-white">Locker questions, answered</h2>
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
        <h2 className="text-2xl font-semibold">Still stuck?</h2>
        <p className="mt-2 text-sm text-white/70">Reply HELP to the SMS thread for urgent locker issues, or open a ticket via the support hub.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/support">Open support hub</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/guide/locker#faq">Jump to FAQ</Link>
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
