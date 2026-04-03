"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button, Input, Textarea } from "@/components/ui";
import { StateMessage } from "@/components/StateMessage";
import { TransferIdNotice } from "@/components/wallet/TransferIdNotice";
import type { WalletBalanceResponse, WithdrawalRequest } from "@/lib/types";
import { swrFetcher } from "@/lib/api";
import { createWithdrawalRequest } from "@/lib/withdrawal-api";
import { deriveTransferId } from "@/lib/wallet-utils";

const MIN_WITHDRAWAL = 20;
const FEE_PERCENT = 0.02; // 2% handling fee (update if ops changes)

const payoutConfigs = {
  bank: {
    label: "Bank transfer (GBP)",
    description: "Payout to a UK Faster Payments account.",
    fields: [
      { key: "accountName", label: "Account name", placeholder: "GreenHub Ops", required: true },
      { key: "accountNumber", label: "Account number", placeholder: "00000000", required: true },
      { key: "sortCode", label: "Sort code", placeholder: "00-00-00", required: true },
      { key: "bankName", label: "Bank name", placeholder: "Starling" }
    ]
  },
  crypto: {
    label: "USDT transfer",
    description: "Send to your USDT wallet (TRC20 / ERC20).",
    fields: [
      { key: "network", label: "Network", placeholder: "TRC20", required: true },
      { key: "address", label: "Wallet address", placeholder: "T...", required: true }
    ]
  },
  wallet: {
    label: "Locker wallet credit",
    description: "Move balance to another concierge handle or internal account.",
    fields: [
      { key: "handle", label: "Recipient handle", placeholder: "@greenhub", required: true },
      { key: "memo", label: "Memo", placeholder: "Transfer to concierge" }
    ]
  }
} as const;

type MethodId = keyof typeof payoutConfigs;

export default function WalletWithdrawPage() {
  const router = useRouter();
  const { token, profile } = useAuth();
  const transferId = deriveTransferId(profile);
  const [step, setStep] = useState(1);
  const [amountInput, setAmountInput] = useState("100");
  const [method, setMethod] = useState<MethodId>("bank");
  const [bankDetails, setBankDetails] = useState({ accountName: "", accountNumber: "", sortCode: "", bankName: "" });
  const [cryptoDetails, setCryptoDetails] = useState({ network: "TRC20", address: "" });
  const [walletDetails, setWalletDetails] = useState({ handle: "", memo: "" });
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WithdrawalRequest | null>(null);

  const { data: balanceData, error: balanceError } = useSWR<WalletBalanceResponse>(
    token ? "/api/wallet/balance" : null,
    swrFetcher,
    { refreshInterval: 60_000 }
  );

  const available = balanceData?.balance ?? 0;
  const amount = parseFloat(amountInput) || 0;
  const fee = Math.max(0, amount * FEE_PERCENT);
  const receiveAmount = Math.max(0, amount - fee);
  const amountValid = amount >= MIN_WITHDRAWAL && amount <= available;

  const currentDetails = useMemo(() => {
    switch (method) {
      case "bank":
        return [bankDetails, setBankDetails] as const;
      case "crypto":
        return [cryptoDetails, setCryptoDetails] as const;
      case "wallet":
      default:
        return [walletDetails, setWalletDetails] as const;
    }
  }, [method, bankDetails, cryptoDetails, walletDetails]);

  const [detailsState, setDetailsState] = currentDetails;

  const handleFieldChange = (key: string, value: string) => {
    setDetailsState((prev: Record<string, string>) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !amountValid) {
      setError(`Minimum transfer is £${MIN_WITHDRAWAL} (available £${available.toFixed(2)})`);
      return;
    }
    if (step === 2) {
      const config = payoutConfigs[method];
      const missing = config.fields.filter((field) => field.required && !detailsState[field.key]?.toString().trim());
      if (missing.length) {
        setError(`Fill ${missing.map((f) => f.label).join(", ")}`);
        return;
      }
    }
    setError(null);
    setStep((prev) => Math.min(3, prev + 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (!amountValid) {
      setError(`Amount must be at least £${MIN_WITHDRAWAL} and not exceed £${available.toFixed(2)}`);
      return;
    }
    const config = payoutConfigs[method];
    const missing = config.fields.filter((field) => field.required && !detailsState[field.key]?.toString().trim());
    if (missing.length) {
      setError(`Fill ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const response = await createWithdrawalRequest({
        amount,
        currency: "GBP",
        payoutMethod: method,
        payoutDetails: detailsState,
        note: note.trim() || undefined
      });
      setResult(response.request);
    } catch (err) {
      setError((err as Error).message || "Failed to create withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <section className="space-y-6 px-4 py-10">
        <StateMessage
          title="Sign in required"
          body="Log in to submit a withdrawal request."
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
        <h1 className="text-3xl font-semibold text-white">Withdraw funds</h1>
        <p className="text-sm text-white/70">
          Request a payout to your bank, crypto wallet, or another concierge handle. Ops will verify within 12 hours.
        </p>
      </header>

      <TransferIdNotice transferId={transferId} />

      {balanceError && (
        <StateMessage variant="error" title="Unable to load balance" body={balanceError.message} />
      )}

      <Stepper current={step} />

      {result ? (
        <SuccessCard request={result} />
      ) : (
        <div className="space-y-6 rounded-[32px] border border-white/10 bg-card p-6">
          {step === 1 && (
            <AmountStep
              amount={amountInput}
              onAmountChange={setAmountInput}
              available={available}
              fee={fee}
              receiveAmount={receiveAmount}
            />
          )}
          {step === 2 && (
            <MethodStep
              method={method}
              setMethod={(next) => {
                setMethod(next);
                setError(null);
              }}
              details={detailsState}
              onDetailChange={handleFieldChange}
            />
          )}
          {step === 3 && (
            <ReviewStep
              amount={amount}
              fee={fee}
              receiveAmount={receiveAmount}
              method={method}
              details={detailsState}
              note={note}
              onNoteChange={setNote}
            />
          )}

          {error && <p className="text-sm text-amber-300">{error}</p>}

          <div className="flex flex-wrap items-center gap-3">
            {step > 1 && (
              <Button variant="secondary" onClick={handleBack} disabled={submitting}>
                Back
              </Button>
            )}
            {step < 3 && (
              <Button onClick={handleNext}>Continue</Button>
            )}
            {step === 3 && (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit request"}
              </Button>
            )}
            <Link href="/wallet/withdraw/history" className="ml-auto text-sm text-white/70 underline">
              View history
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

function Stepper({ current }: { current: number }) {
  const steps = ["Amount", "Payout", "Review"];
  return (
    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-white/50">
      {steps.map((label, index) => {
        const idx = index + 1;
        const active = idx === current;
        const done = idx < current;
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                done ? "border-emerald-400 text-emerald-200" : active ? "border-white text-white" : "border-white/30"
              }`}
            >
              {idx}
            </span>
            <span className={active ? "text-white" : "text-white/60"}>{label}</span>
            {idx < steps.length && <div className="h-px w-10 bg-white/15" />}
          </div>
        );
      })}
    </div>
  );
}

function AmountStep({
  amount,
  onAmountChange,
  available,
  fee,
  receiveAmount
}: {
  amount: string;
  onAmountChange: (value: string) => void;
  available: number;
  fee: number;
  receiveAmount: number;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <p className="text-lg font-semibold text-white">1. Choose amount</p>
        <span className="text-sm text-white/60">Available £{available.toFixed(2)}</span>
      </div>
      <Input
        type="number"
        min={MIN_WITHDRAWAL}
        step="5"
        value={amount}
        onChange={(event) => onAmountChange(event.target.value)}
        placeholder="20"
      />
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        <p>Minimum transfer is £{MIN_WITHDRAWAL}. Handling fee {Math.round(FEE_PERCENT * 100)}%.</p>
        <p className="mt-1 text-xs text-white/50">Fee estimate £{fee.toFixed(2)} · You receive £{receiveAmount.toFixed(2)}</p>
      </div>
    </section>
  );
}

function MethodStep({
  method,
  setMethod,
  details,
  onDetailChange
}: {
  method: MethodId;
  setMethod: (value: MethodId) => void;
  details: Record<string, string>;
  onDetailChange: (key: string, value: string) => void;
}) {
  return (
    <section className="space-y-4">
      <p className="text-lg font-semibold text-white">2. Select payout method</p>
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(payoutConfigs) as MethodId[]).map((id) => (
          <button
            key={id}
            className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
              method === id ? "border-white bg-white/10" : "border-white/10 text-white/70 hover:border-white/30"
            }`}
            onClick={() => setMethod(id)}
          >
            <p className="font-semibold text-white">{payoutConfigs[id].label}</p>
            <p className="mt-1 text-xs text-white/60">{payoutConfigs[id].description}</p>
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {payoutConfigs[method].fields.map((field) => (
          <label key={field.key} className="text-sm text-white">
            <span className="font-medium">
              {field.label}
              {field.required && <span className="text-amber-300"> *</span>}
            </span>
            <Input
              className="mt-1"
              value={details[field.key]?.toString() || ""}
              placeholder={field.placeholder}
              onChange={(event) => onDetailChange(field.key, event.target.value)}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function ReviewStep({
  amount,
  fee,
  receiveAmount,
  method,
  details,
  note,
  onNoteChange
}: {
  amount: number;
  fee: number;
  receiveAmount: number;
  method: MethodId;
  details: Record<string, string>;
  note: string;
  onNoteChange: (value: string) => void;
}) {
  const entries = Object.entries(details).filter(([, value]) => value);
  return (
    <section className="space-y-4">
      <p className="text-lg font-semibold text-white">3. Review & confirm</p>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        <p className="text-base font-semibold text-white">£{amount.toFixed(2)} → {payoutConfigs[method].label}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-white/60">
          <li>Fee £{fee.toFixed(2)}</li>
          <li>You receive £{receiveAmount.toFixed(2)}</li>
          <li>Status: pending review (ETA 12h)</li>
        </ul>
      </div>
      {entries.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
          <p className="font-semibold">Payout details</p>
          <dl className="mt-2 grid gap-2 text-xs text-white/70 sm:grid-cols-2">
            {entries.map(([key, value]) => (
              <div key={key}>
                <dt className="uppercase tracking-[0.35em] text-white/40">{key}</dt>
                <dd className="text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      <label className="text-sm text-white">
        <span className="font-medium">Note to ops (optional)</span>
        <Textarea className="mt-1" value={note} onChange={(event) => onNoteChange(event.target.value)} placeholder="Any context for concierge" />
      </label>
    </section>
  );
}

function SuccessCard({ request }: { request: WithdrawalRequest }) {
  return (
    <div className="space-y-4 rounded-[32px] border border-emerald-500/30 bg-emerald-500/5 p-6 text-white">
      <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Request submitted</p>
      <h2 className="text-3xl font-semibold">Reference {request.reference}</h2>
      <p className="text-sm text-white/70">
        Ops will verify and update the status to <strong>approved</strong> once the payout is queued. Expect a DM or email if more information is required.
      </p>
      <dl className="grid gap-2 text-sm text-white/80 sm:grid-cols-2">
        <div>
          <dt className="uppercase text-xs tracking-[0.35em] text-white/40">Amount</dt>
          <dd>£{request.amount.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="uppercase text-xs tracking-[0.35em] text-white/40">Method</dt>
          <dd>{request.payoutMethod}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-3">
        <Link href="/wallet/withdraw/history" className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white hover:border-white/50">
          View history
        </Link>
        <Link href="/wallet" className="text-sm text-white/80 underline">
          Back to wallet
        </Link>
      </div>
    </div>
  );
}
