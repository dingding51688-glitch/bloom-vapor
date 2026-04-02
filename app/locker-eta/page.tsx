import Link from "next/link";
import Button from "@/components/ui/button";

const etaWindows = [
  {
    label: "Morning",
    time: "09:00 – 12:00",
    notes: "Earliest run, great if you confirm the night before. Limited to Belfast city lockers."
  },
  {
    label: "Afternoon",
    time: "12:00 – 16:00",
    notes: "Standard slot for most postcodes. Works with bank or wallet orders placed before 11:00."
  },
  {
    label: "Evening",
    time: "16:00 – 20:00",
    notes: "After-work handoffs. Confirm by 15:00 to lock this window; couriers batch drops in 30-minute waves."
  }
];

const howToRequest = [
  {
    title: "Add a note at checkout",
    detail: "In the Notes field, list your preferred window (Morning / Afternoon / Evening). Include backup times in case lockers are full."
  },
  {
    title: "Reply to the SMS or Telegram",
    detail: "Once we text the locker confirmation, reply right away if the time no longer works. Ops can reroute you before the courier dispatches."
  },
  {
    title: "Escalate for emergencies",
    detail: "If you get stuck en route, text HELP + locker ID. We can hold the locker open a little longer or move your parcel."
  }
];

const faqItems = [
  {
    q: "How long is my locker PIN valid?",
    a: "Pins stay active for 2 hours once we send the READY SMS/email. Need longer? Reply before the timer ends so we can reissue a slot."
  },
  {
    q: "Can I pick an exact time?",
    a: "We work in windows rather than exact minutes. Share the earliest/latest you can collect and concierge fits you into the closest run."
  },
  {
    q: "What if no lockers are free?",
    a: "Ops will text you with a backup location or offer courier-to-door for a small fee. We never cancel without checking with you first."
  }
];

export const metadata = {
  title: "Locker ETA sheet",
  description: "Understand our delivery windows, how to request a different slot, and what to do if you miss the timer."
};

export default function LockerEtaPage() {
  return (
    <div className="space-y-10 pb-20">
      <section className="rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,#050505,#0b1410)] px-6 py-10 text-white sm:px-12">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">Locker ETA sheet</p>
        <h1 className="mt-2 text-4xl font-semibold">Locker windows & concierge tips</h1>
        <p className="mt-3 text-lg text-white/80">
          These are the slots we run every day. Use them to plan pickups, leave better checkout notes, and understand how long a PIN stays live.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/70">
          <span className="rounded-full border border-white/20 px-4 py-1">Same-day lockers 7 days/week</span>
          <span className="rounded-full border border-white/20 px-4 py-1">Pins valid for 2 hours</span>
          <span className="rounded-full border border-white/20 px-4 py-1">Concierge replies in &lt;15 min</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/products">Browse menu</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/support">Talk to concierge</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {etaWindows.map((slot) => (
          <article key={slot.label} className="rounded-[32px] border border-white/10 bg-night-950/70 p-6 text-white">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">{slot.label}</p>
            <h2 className="mt-2 text-3xl font-semibold">{slot.time}</h2>
            <p className="mt-3 text-sm text-white/70">{slot.notes}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[32px] border border-white/10 bg-night-950/70 p-6 text-white">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">How to request a different slot</p>
          <h2 className="text-3xl font-semibold">Still need a custom time?</h2>
          <p className="text-sm text-white/70">Ops can usually shuffle things if you let us know before the courier leaves HQ.</p>
        </header>
        <ol className="mt-6 space-y-4">
          {howToRequest.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-sm font-semibold text-white/70">
                0{index + 1}
              </span>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-1 text-sm text-white/70">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <article className="rounded-[32px] border border-white/10 bg-night-950/70 p-6 text-white">
          <h2 className="text-2xl font-semibold">Locker PIN timer</h2>
          <p className="mt-2 text-sm text-white/70">
            Pins and QR codes expire 120 minutes after we text you. Reply to that SMS or Telegram thread before the timer ends if you need an extension.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/70">
            <li>Extensions are limited to 30 minutes when other members are waiting.</li>
            <li>If the locker jams, close the door and text HELP immediately.</li>
            <li>Missed windows can be re-delivered the next day for £5 courier fee.</li>
          </ul>
        </article>
        <article className="rounded-[32px] border border-white/10 bg-night-950/70 p-6 text-white">
          <h2 className="text-2xl font-semibold">Need a human?</h2>
          <p className="mt-2 text-sm text-white/70">Concierge is online 09:00–21:00 GMT. Outside hours, leave a voicemail or Telegram note and we reply at open.</p>
          <div className="mt-4 space-y-2 text-sm text-white/80">
            <p>Telegram: <a href="https://t.me/greenhubconcierge" className="underline">@greenhubconcierge</a></p>
            <p>SMS hotline: +44 7441 902134</p>
            <p>Email: support@greenhub.app</p>
          </div>
        </article>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-night-950/70 p-6 text-white">
        <header>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">FAQ</p>
          <h2 className="text-2xl font-semibold text-white">Locker ETA questions</h2>
        </header>
        <div className="mt-4 space-y-3">
          {faqItems.map((item) => (
            <details key={item.q} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer text-lg font-semibold text-white">{item.q}</summary>
              <p className="mt-2 text-sm text-white/70">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
