"use client";

import Link from "next/link";
import useSWR from "swr";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { StateMessage } from "@/components/StateMessage";
import { Button } from "@/components/ui";
import { TransferIdNotice } from "@/components/wallet/TransferIdNotice";
import { swrFetcher } from "@/lib/api";
import type { WalletBalanceResponse, WalletTransaction, WalletTransactionsResponse } from "@/lib/types";
import { deriveTransferId } from "@/lib/wallet-utils";

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const TIMESTAMP = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

const FALLBACK_BALANCE: WalletBalanceResponse = {
  success: true,
  balance: 240,
  lifetimeTopUp: 1800,
  bonusAwarded: 95
};

const FALLBACK_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 1,
    type: "topup",
    amount: 150,
    balanceAfter: 640,
    currency: "GBP",
    reference: "mock-topup-001",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    type: "purchase",
    amount: -80,
    balanceAfter: 560,
    currency: "GBP",
    reference: "mock-order-420",
    createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString()
  },
  {
    id: 3,
    type: "bonus",
    amount: 20,
    balanceAfter: 580,
    currency: "GBP",
    reference: "mock-bonus",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString()
  }
];

export default function WalletPage() {
  const router = useRouter();
  const { token, profile } = useAuth();

  const {
    data: balanceData,
    error: balanceError,
    isLoading: balanceLoading,
    mutate: refreshBalance
  } = useSWR<WalletBalanceResponse>(token ? "/api/wallet/balance" : null, swrFetcher, {
    refreshInterval: 60_000
  });

  const {
    data: txData,
    error: txError,
    isLoading: txLoading,
    mutate: refreshTransactions
  } = useSWR<WalletTransactionsResponse>(
    token ? "/api/wallet/transactions?page=1&pageSize=20" : null,
    swrFetcher,
    { refreshInterval: 90_000 }
  );

  const transactionsSection = useMemo(() => {
    if (txLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      );
    }

    if (txError) {
      return (
        <div className="space-y-4">
          <StateMessage
            variant="error"
            title="Unable to load transactions"
            body={txError.message}
            actionLabel="Retry"
            onAction={() => refreshTransactions()}
          />
          <FallbackTransactions />
        </div>
      );
    }

    const rows = txData?.data || [];
    if (rows.length === 0) {
      return <StateMessage variant="empty" title="No wallet activity yet" body="Top up or place an order to see history." />;
    }

    return <TransactionList rows={rows} />;
  }, [txData, txError, txLoading, refreshTransactions]);

  if (!token) {
    return (
      <section className="space-y-6 px-4 py-10">
        <StateMessage
          title="Please sign in"
          body="Log in to see your wallet balance and start a top-up."
          actionLabel="Go to login"
          onAction={() => router.push("/login")}
        />
      </section>
    );
  }

  const balanceCard = (() => {
    if (balanceLoading) {
      return <div className="h-48 animate-pulse rounded-3xl bg-white/5" />;
    }

    if (balanceError) {
      return (
        <div className="space-y-4">
          <StateMessage
            variant="error"
            title="Unable to load balance"
            body={balanceError.message}
            actionLabel="Retry"
            onAction={() => refreshBalance()}
          />
          <BalanceCard data={FALLBACK_BALANCE} showFallback />
        </div>
      );
    }

    if (!balanceData) return null;
    return <BalanceCard data={balanceData} />;
  })();

  return (
    <section className="space-y-8 px-4 py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Wallet</p>
          <h1 className="text-3xl font-semibold text-white">Balance & history</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/wallet/withdraw">
            <Button variant="secondary" size="md">
              Withdraw
            </Button>
          </Link>
          <Link href="/wallet/topup">
            <Button size="md">Top up wallet</Button>
          </Link>
        </div>
      </header>

      <TransferIdNotice transferId={deriveTransferId(profile)} />

      <div className="rounded-3xl border border-white/10 bg-night-950/60 p-4 text-sm text-white/70">
        <p className="font-semibold text-white">New to payments?</p>
        <p className="mt-1">Read the payment guide for wallet top-ups, NowPayments, and manual bank/USDT instructions.</p>
        <Button asChild variant="ghost" size="sm" className="mt-3">
          <Link href="/guide/payment">Open payment guide</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {balanceCard}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
          <p className="font-semibold text-white">How top-ups work</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Select a tier or enter your own amount.</li>
            <li>Choose NowPayments for instant card/Apple Pay or follow bank / USDT instructions.</li>
            <li>We credit your wallet as soon as the payment status turns <strong>confirmed</strong>.</li>
          </ul>
          <p className="mt-3 text-xs text-white/60">
            Need concierge help? Ping us on Telegram @greenhub when referencing your order code.
          </p>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent activity</h2>
          <button
            onClick={() => refreshTransactions()}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 hover:border-white/50"
          >
            Refresh
          </button>
        </div>
        {transactionsSection}
      </section>
    </section>
  );
}

function BalanceCard({ data, showFallback = false }: { data: WalletBalanceResponse; showFallback?: boolean }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-card p-6 shadow-card">
      <p className="text-xs uppercase tracking-[0.3em] text-white/60">Available</p>
      <p className="mt-3 text-4xl font-semibold text-white">{GBP.format(data.balance)}</p>
      <p className="mt-2 text-sm text-white/70">
        Lifetime top-up {GBP.format(data.lifetimeTopUp)} · Bonus {GBP.format(data.bonusAwarded)}
      </p>
      {showFallback && <p className="mt-3 text-xs text-amber-300">Showing cached sample due to API outage.</p>}
      <Link
        href="/wallet/topup"
        className="mt-4 inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white/80 hover:border-white/50"
      >
        Start a top-up
      </Link>
    </div>
  );
}

function TransactionList({ rows }: { rows: WalletTransaction[] }) {
  return (
    <div className="divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/10 bg-card">
      {rows.map((tx) => (
        <div key={tx.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold capitalize text-white">{tx.type.replace(/_/g, " ")}</p>
            <p className="text-xs text-white/50">{tx.reference}</p>
          </div>
          <div className="text-sm text-white/60">
            {tx.createdAt ? TIMESTAMP.format(new Date(tx.createdAt)) : "—"}
          </div>
          <div className="text-right">
            <p className={tx.amount >= 0 ? "text-emerald-300" : "text-red-300"}>
              {tx.amount >= 0 ? "+" : ""}
              {GBP.format(tx.amount)}
            </p>
            <p className="text-xs text-white/50">
              Balance {tx.balanceAfter !== undefined ? GBP.format(tx.balanceAfter) : "—"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FallbackTransactions() {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-white/70">
      <p className="font-semibold text-white">Sample activity</p>
      <TransactionList rows={FALLBACK_TRANSACTIONS} />
    </div>
  );
}
