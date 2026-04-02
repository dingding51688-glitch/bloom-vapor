"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button, Input, Textarea } from "@/components/ui";
import { StateMessage } from "@/components/StateMessage";
import { createTopupIntent, listTopupTiers, pollTopupStatus } from "@/lib/wallet-api";
import type { TopupIntentMeta, TopupRecord, TopupTier } from "@/lib/types";

const FALLBACK_TIERS: TopupTier[] = [
  { id: 1, title: "Starter", description: "Tap to add £100", minAmountUsdt: 100, bonusPercent: 0 },
  { id: 2, title: "Club", description: "£250 +2% bonus", minAmountUsdt: 250, bonusPercent: 2 },
  { id: 3, title: "Collector", description: "£500 +5% bonus", minAmountUsdt: 500, bonusPercent: 5 }
];

const BANK_DETAILS = {
  name: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "GreenHub Processing Ltd",
  number: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "00000000",
  sortCode: process.env.NEXT_PUBLIC_BANK_SORT_CODE || "00-00-00"
};

const USDT_ADDRESS = process.env.NEXT_PUBLIC_TOPUP_USDT_ADDRESS || "TBD-USDT-ADDRESS";
const USDT_QR = process.env.NEXT_PUBLIC_TOPUP_USDT_QR || "";

const METHOD_OPTIONS = [
  {
    id: "nowpayments",
    label: "Card / Apple Pay (NowPayments)",
    description: "Pay by card or Apple Pay via NowPayments. We’ll generate an invoice link for you.",
    requiresIntent: true
  },
  {
    id: "bank",
    label: "Bank transfer",
    description: "Send GBP via Faster Payments. Ops will match the reference and credit your wallet.",
    requiresIntent: false
  },
  {
    id: "crypto",
    label: "Direct USDT transfer",
    description: "Send USDT to our treasury address (TRC20/ ERC20).",
    requiresIntent: false
  }
] as const;

type MethodId = (typeof METHOD_OPTIONS)[number]["id"];

const doneStatuses = new Set(["confirmed", "failed", "expired", "refunded"]);

export default function WalletTopupPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [selectedTierId, setSelectedTierId] = useState<number | null>(1);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState<MethodId>("nowpayments");
  const [chain, setChain] = useState<"TRC20" | "ERC20">("TRC20");
  const [intent, setIntent] = useState<TopupIntentMeta | null>(null);
  const [status, setStatus] = useState<TopupRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const { data: tiersData, error: tiersError } = useSWR<TopupTier[]>(
    token ? "wallet:tiers" : null,
    listTopupTiers,
    { fallbackData: FALLBACK_TIERS }
  );

  const tiers = tiersData ?? FALLBACK_TIERS;
  useEffect(() => {
    if (!selectedTierId && tiers.length > 0) {
      setSelectedTierId(tiers[0].id);
    }
  }, [tiers, selectedTierId]);

  const selectedTier = useMemo(() => tiers.find((tier) => tier.id === selectedTierId) || null, [tiers, selectedTierId]);

  const amount = selectedTier ? selectedTier.minAmountUsdt : parseFloat(customAmount) || 0;

  const handleStart = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (!amount || amount <= 0) {
      setError("Enter an amount to continue");
      return;
    }
    if (method !== "nowpayments") {
      setError(null);
      setIntent(null);
      setStatus(null);
      setStatusMessage("Manual payment instructions ready below. Confirm with concierge once sent.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setStatusMessage(null);
      const response = await createTopupIntent({ amount, chain });
      setIntent(response.topup);
      const latest = await pollTopupStatus(response.topup.id).catch(() => null);
      if (latest) {
        setStatus({ ...latest, id: response.topup.id });
      }
    } catch (err) {
      setError((err as Error).message || "Failed to create top-up");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!intent || method !== "nowpayments") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const latest = await pollTopupStatus(intent.id);
        if (cancelled) return;
        setStatus({ ...latest, id: intent.id });
        if (!doneStatuses.has(latest.status)) {
          timer = setTimeout(poll, 7000);
        }
      } catch (err) {
        if (!cancelled) {
          setStatusMessage((err as Error).message ?? "Unable to poll status");
          timer = setTimeout(poll, 12000);
        }
      }
    };

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [intent, method]);

  const countdown = useCountdown(status?.expiresAt);

  if (!token) {
    return (
      <section className="space-y-6 px-4 py-10">
        <StateMessage
          title="Sign in required"
          body="Log in to create a top-up invoice."
          actionLabel="Go to login"
          onAction={() => router.push("/login")}
        />
      </section>
    );
  }

  return (
    <section className="space-y-8 px-4 py-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Wallet</p>
        <h1 className="text-3xl font-semibold text-white">Top up your balance</h1>
        <p className="text-sm text-white/70">Pick a tier, choose payment method, and follow the instructions. Your wallet updates automatically when the status becomes confirmed.</p>
      </header>

      {tiersError && (
        <StateMessage
          variant="error"
          title="Unable to load top-up tiers"
          body={tiersError.message}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6 rounded-3xl border border-white/10 bg-card p-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-white">1. Choose an amount</p>
              <button
                onClick={() => setSelectedTierId(null)}
                className="text-xs uppercase tracking-[0.3em] text-white/50"
              >
                Custom amount
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {tiers.map((tier) => (
                <button
                  key={tier.id}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${selectedTierId === tier.id ? "border-white bg-white/10" : "border-white/10 hover:border-white/30"}`}
                  onClick={() => {
                    setSelectedTierId(tier.id);
                    setCustomAmount("");
                  }}
                >
                  <p className="text-sm font-semibold text-white">{tier.title}</p>
                  <p className="text-xl font-semibold text-white">£{tier.minAmountUsdt}</p>
                  {tier.bonusPercent ? (
                    <p className="text-xs text-emerald-300">+{tier.bonusPercent}% bonus</p>
                  ) : (
                    <p className="text-xs text-white/50">Standard rate</p>
                  )}
                </button>
              ))}
            </div>
            {!selectedTier && (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Input
                  type="number"
                  step="1"
                  min="50"
                  placeholder="Enter amount (£)"
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value)}
                />
                <span className="text-sm text-white/60">GBP</span>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <p className="text-lg font-semibold text-white">2. Payment method</p>
            <div className="grid gap-4 md:grid-cols-3">
              {METHOD_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${method === option.id ? "border-white bg-white/10" : "border-white/10 hover:border-white/30"}`}
                  onClick={() => {
                    setMethod(option.id);
                    setStatus(null);
                    setIntent(null);
                    setStatusMessage(null);
                  }}
                >
                  <p className="font-semibold text-white">{option.label}</p>
                  <p className="mt-1 text-xs text-white/60">{option.description}</p>
                </button>
              ))}
            </div>
            {method === "nowpayments" && (
              <div className="flex items-center gap-4 text-sm text-white/70">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={chain === "TRC20"}
                    onChange={() => setChain("TRC20")}
                  />
                  USDT TRC20
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={chain === "ERC20"}
                    onChange={() => setChain("ERC20")}
                  />
                  USDT ERC20
                </label>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <p className="text-lg font-semibold text-white">3. Generate instructions</p>
            {error && <p className="text-sm text-amber-400">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleStart} disabled={submitting}>
                {method === "nowpayments" ? "Get payment link" : "Show manual instructions"}
              </Button>
              <Link href="/wallet" className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/70">
                Back to wallet
              </Link>
            </div>
            {submitting && <p className="text-sm text-white/60">Creating intent…</p>}
          </section>

          {statusMessage && <p className="text-sm text-white/60">{statusMessage}</p>}

          {method === "nowpayments" ? (
            <NowPaymentsPanel intent={intent} status={status} countdown={countdown} />
          ) : method === "bank" ? (
            <BankInstructions amount={amount} />
          ) : (
            <CryptoInstructions amount={amount} chain={chain} />
          )}
        </div>

        <aside className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
          <h2 className="text-lg font-semibold text-white">Need help?</h2>
          <p className="text-sm text-white/70">Share your order code or screenshot with concierge if you need manual review.</p>
          <Textarea readOnly value={`Tier: ${selectedTier?.title || "Custom"}\nAmount: £${amount.toFixed(2)}\nMethod: ${method.toUpperCase()}\nChain: ${chain}`} />
          <Link href="/notifications" className="block rounded-2xl border border-white/15 px-4 py-2 text-center text-sm text-white/70 hover:border-white/40">
            Check notifications
          </Link>
        </aside>
      </div>
    </section>
  );
}

function NowPaymentsPanel({ intent, status, countdown }: { intent: TopupIntentMeta | null; status: TopupRecord | null; countdown: string | null }) {
  if (!intent) {
    return (
      <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/70">
        <p>Click “Get payment link” to generate a NowPayments invoice.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-white">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">Invoice</p>
          <p className="text-lg font-semibold">{intent.orderCode}</p>
        </div>
        <Link
          href={intent.invoiceUrl || "#"}
          target="_blank"
          className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:border-white/60"
        >
          Open payment page
        </Link>
      </div>
      {status && (
        <dl className="grid gap-2 text-xs text-white/80 sm:grid-cols-3">
          <div>
            <dt className="uppercase tracking-[0.3em] text-white/40">Status</dt>
            <dd className="text-sm font-semibold capitalize text-white">{status.status.replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.3em] text-white/40">Amount</dt>
            <dd className="text-sm font-semibold text-white">£{status.amountFiat.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.3em] text-white/40">Chain</dt>
            <dd className="text-sm font-semibold text-white">{status.network}</dd>
          </div>
        </dl>
      )}
      {countdown && <p className="text-xs text-white/60">Invoice expires in {countdown}</p>}
    </div>
  );
}

function BankInstructions({ amount }: { amount: number }) {
  return (
    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
      <p className="font-semibold text-white">Send a Faster Payment</p>
      <ul className="list-disc space-y-1 pl-5 text-xs text-white/70">
        <li>Account name: {BANK_DETAILS.name}</li>
        <li>Account number: {BANK_DETAILS.number}</li>
        <li>Sort code: {BANK_DETAILS.sortCode}</li>
        <li>Amount: £{amount.toFixed(2)} (or equivalent)</li>
        <li>Reference: your locker email or @handle</li>
      </ul>
      <p className="text-xs text-white/50">Share the payment screenshot with concierge for manual credit if it hasn’t auto-posted within 30 minutes.</p>
    </div>
  );
}

function CryptoInstructions({ amount, chain }: { amount: number; chain: "TRC20" | "ERC20" }) {
  return (
    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
      <p className="font-semibold text-white">Send USDT ({chain})</p>
      <p className="text-xs text-white/70">Address: <span className="font-mono text-white">{USDT_ADDRESS}</span></p>
      {USDT_QR && (
        <a
          href={USDT_QR}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-emerald-300 underline"
        >
          View QR code
        </a>
      )}
      <p className="text-xs text-white/70">Send £{amount.toFixed(2)} worth of USDT. After broadcasting, share the TX hash with concierge so we can mark it confirmed.</p>
    </div>
  );
}

function useCountdown(target?: string | null) {
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    if (!target) {
      setValue(null);
      return;
    }
    const update = () => {
      const diff = Math.max(0, new Date(target).getTime() - Date.now());
      if (diff <= 0) {
        setValue("0s");
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setValue(`${minutes}m ${seconds.toString().padStart(2, "0")}s`);
      }
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [target]);
  return value;
}
