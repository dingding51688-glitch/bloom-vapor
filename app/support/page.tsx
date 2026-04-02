"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/button";
import { StateMessage } from "@/components/StateMessage";
import { contactChannels, contactHeroDetails } from "@/data/fixtures/marketing";
import { faqCategories } from "@/data/fixtures/faq";

const ticketSchema = z.object({
  topic: z.enum(["locker", "payment", "order", "other"]),
  message: z.string().min(20, "Please include at least 20 characters"),
  orderRef: z.string().optional().or(z.literal("")),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

const faqTopics = [
  { title: "Locker issues", answer: "Text HELP + locker ID to our SMS hotline (+44 7441 902134) and we reroute within 15 minutes. Include a photo if the locker looks tampered." },
  { title: "Payments & wallet", answer: "Wallet top-ups post instantly; bank / crypto confirmations can take up to 30 min. Send receipts to support@greenhub.app if you do not see a balance update." },
  { title: "Order tracking", answer: "Check /orders for live status. If a locker is stuck in ‘preparing’, ping Telegram concierge with your reference and we fast-track the drop." },
];

const lockerFaq = faqCategories.find((category) => category.id === "locker")?.entries.slice(0, 1) ?? [];
const paymentFaq = faqCategories.find((category) => category.id === "payment")?.entries.slice(0, 1) ?? [];

const supportFaq = [
  ...faqTopics,
  ...lockerFaq.map((faq) => ({ title: faq.question, answer: faq.answer })),
  ...paymentFaq.map((faq) => ({ title: faq.question, answer: faq.answer }))
];

export default function SupportPage() {
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { topic: "locker", message: "", orderRef: "" },
  });

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyToast(`Copied ${value}`);
      setTimeout(() => setCopyToast(null), 2500);
    } catch {
      setCopyToast("Unable to copy, please copy manually.");
      setTimeout(() => setCopyToast(null), 2500);
    }
  };

  const onSubmit = async (values: TicketFormValues) => {
    setFormStatus(null);
    try {
      // TODO: hook into Strapi support endpoint. For now we simulate a submission delay.
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setFormStatus({ type: "success", message: "Ticket received — concierge replies within 2 hours." });
      reset();
    } catch (error: any) {
      setFormStatus({ type: "error", message: error?.message || "Failed to submit ticket" });
    }
  };

  return (
    <section className="space-y-8">
      <header className="rounded-[40px] border border-white/10 bg-night-950/80 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Concierge support</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">We’re on locker duty 09:00–21:00 GMT daily</h1>
        <p className="mt-2 text-sm text-white/70">Telegram is fastest for locker swaps. Email or SMS for escalations. In emergencies, text HELP + locker ID.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button asChild variant="secondary" size="sm">
            <Link href="/guide/locker">Locker onboarding guide</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/guide/payment">Payment guide</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href="/invite">Share referral link</a>
          </Button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {contactHeroDetails.map((item) => (
            <div key={item.label} className="rounded-3xl border border-white/15 bg-white/5 p-4 text-sm text-white/80">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">{item.label}</p>
              {item.href ? (
                <a href={item.href} className="mt-1 block text-white underline">
                  {item.value}
                </a>
              ) : (
                <p className="mt-1 text-white">{item.value}</p>
              )}
            </div>
          ))}
        </div>
        {copyToast && <p className="mt-3 text-xs text-emerald-200">{copyToast}</p>}
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {contactChannels.map((channel) => (
          <article key={channel.title} className="rounded-[32px] border border-white/10 bg-night-950/70 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/50">{channel.title}</p>
                <p className="text-2xl font-semibold text-white">{channel.detail}</p>
                <p className="mt-2 text-sm text-white/70">{channel.description}</p>
              </div>
              {channel.badge && (
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">{channel.badge}</span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {channel.href && (
                <Button asChild size="sm">
                  <a href={channel.href} target={channel.href.startsWith("http") ? "_blank" : "_self"} rel="noreferrer">
                    Open channel
                  </a>
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => handleCopy(channel.detail)}>
                Copy details
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-[40px] border border-white/10 bg-night-950/70 p-6">
        <h2 className="text-2xl font-semibold text-white">Locker & payment FAQ</h2>
        <div className="mt-4 space-y-3">
          {supportFaq.map((item) => (
            <details key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <summary className="cursor-pointer text-lg font-semibold text-white">
                {item.title}
              </summary>
              <p className="mt-2 text-sm text-white/70">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="rounded-[40px] border border-white/10 bg-night-950/70 p-6">
        <h2 className="text-2xl font-semibold text-white">Submit a ticket</h2>
        <p className="text-sm text-white/60">We reply within 2 hours during concierge hours. Locker emergencies? Text the hotline instead.</p>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-xs uppercase tracking-[0.3em] text-white/50">
            Topic
            <select {...register("topic")} className="mt-1 w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2 text-sm text-white">
              <option value="locker" className="bg-night-900 text-white">Locker / pickup</option>
              <option value="payment" className="bg-night-900 text-white">Payment / recharge</option>
              <option value="order" className="bg-night-900 text-white">Order tracking</option>
              <option value="other" className="bg-night-900 text-white">Other</option>
            </select>
          </label>
          <label className="block text-xs uppercase tracking-[0.3em] text-white/50">
            Message
            <textarea
              rows={5}
              placeholder="Share as much context as possible"
              className="mt-1 w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2 text-sm text-white"
              {...register("message")}
            />
            {errors.message && <p className="text-xs text-red-300">{errors.message.message}</p>}
          </label>
          <label className="block text-xs uppercase tracking-[0.3em] text-white/50">
            Order reference (optional)
            <input
              type="text"
              placeholder="GH-2026-00042"
              className="mt-1 w-full rounded-2xl border border-white/15 bg-transparent px-3 py-2 text-sm text-white"
              {...register("orderRef")}
            />
          </label>
          {formStatus && (
            <StateMessage variant={formStatus.type === "success" ? "info" : "error"} title={formStatus.message} />
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send ticket"}
          </Button>
        </form>
      </div>
    </section>
  );
}
