"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Button from "@/components/ui/button";
import { StateMessage } from "@/components/StateMessage";
import { useAuth } from "@/components/providers/AuthProvider";
import { useNotifications } from "@/components/providers/NotificationProvider";
import {
  getCommissionTransactions,
  getReferralEvents,
  getReferralSummary,
  type CommissionTransaction,
  type ReferralEvent,
  type ReferralSummary,
} from "@/lib/referral-api";
import { consumeClickError, getLastTrackedClickTime } from "@/lib/referral-tracking";

const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

const fallbackSummary: ReferralSummary = {
  code: "LOCKER25",
  link: "https://greenhub420.co.uk/join/LOCKER25",
  totalInvites: 12,
  activeLockers: 5,
  bonusEarned: 180,
  clicks: 320,
  clickPayoutTotal: 96,
  registrations: 18,
  topups: 9,
  conversionRate: 0.28,
  ctr: 0.12,
  impressions: 2600,
  monthCommission: 42,
};

const fallbackInvites: ReferralEvent[] = [
  { id: 1, inviteeEmail: "alice@example.com", status: "locker_active", locker: "BT1-901", createdAt: new Date().toISOString() },
  { id: 2, inviteeEmail: "bob@example.com", status: "pending", locker: "—", createdAt: new Date().toISOString() },
];

const fallbackCommissions: CommissionTransaction[] = [
  { id: 10, amount: 45, status: "paid", reference: "INV-001", createdAt: new Date().toISOString(), type: "Order", sourceInvitee: "alice@example.com" },
  { id: 11, amount: 30, status: "processing", reference: "INV-002", createdAt: new Date().toISOString(), type: "Click", sourceInvitee: "n/a" },
];

export default function ReferralPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [invitePage, setInvitePage] = useState(1);
  const [commissionPage, setCommissionPage] = useState(1);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const { notifications } = useNotifications();
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);
  const [clickWarning, setClickWarning] = useState(false);

  const { data: summaryData, error: summaryError, isLoading: summaryLoading } = useSWR(
    token ? "referral-summary" : null,
    getReferralSummary
  );

  const {
    data: inviteData,
    error: inviteError,
    isLoading: inviteLoading,
  } = useSWR(token ? ["referral-events", invitePage] : null, () => getReferralEvents({ page: invitePage, pageSize: 5 }));

  const {
    data: commissionData,
    error: commissionError,
    isLoading: commissionLoading,
  } = useSWR(token ? ["commission-transactions", commissionPage] : null, () => getCommissionTransactions({ page: commissionPage, pageSize: 5 }));

  const summary = summaryError ? fallbackSummary : summaryData || fallbackSummary;
  const inviteRows = inviteError ? fallbackInvites : inviteData?.data || [];
  const inviteMeta = inviteData?.meta?.pagination;
  const commissionRows = commissionError ? fallbackCommissions : commissionData?.data || [];
  const commissionMeta = commissionData?.meta?.pagination;
  const commissionAlert = notifications.find((notification) => notification.type === "commission_award" && !notification.read);
  const clickCommission = summary.clickPayoutTotal;
  const purchaseCommission = Math.max(0, summary.bonusEarned - summary.clickPayoutTotal);

  const shareText = encodeURIComponent("Join my Bloom locker. Use my invite link for priority drops!");
  const shareUrl = encodeURIComponent(summary.link);
  const telegramShare = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;
  const whatsappShare = `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary.link);
      setCopyToast("Link copied");
      setTimeout(() => setCopyToast(null), 2500);
    } catch {
      setCopyToast("Copy failed");
      setTimeout(() => setCopyToast(null), 2500);
    }
  };


  useEffect(() => {
    const ts = getLastTrackedClickTime();
    if (ts) setLastClickTime(ts);
    const hasError = consumeClickError();
    if (hasError) setClickWarning(true);
  }, []);
  const statCards = useMemo(
    () => [
      { label: "Clicks", value: summary.clicks.toString(), sub: `CTR ${(summary.ctr * 100).toFixed(1)}%` },
      { label: "Registrations / Topups", value: `${summary.registrations} / ${summary.topups}`, sub: `Conversion ${(summary.conversionRate * 100).toFixed(1)}%` },
      { label: "Lifetime commission", value: currency.format(summary.bonusEarned), sub: `£${clickCommission.toFixed(2)} clicks · £${purchaseCommission.toFixed(2)} orders` },
    ],
    [summary, clickCommission, purchaseCommission]
  );

  if (!token) {
    return (
      <StateMessage
        title="Please sign in"
        body="Connect your Bloom account to start sharing referral codes."
        actionLabel="Login"
        onAction={() => router.push("/login")}
      />
    );
  }

  return (
    <section className="space-y-8">
      <header className="rounded-[40px] border border-white/10 bg-night-950/80 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Referral locker</p>
            <h1 className="text-3xl font-semibold text-white">Share your invite, earn commission</h1>
            <p className="text-sm text-white/60">Each locker you activate earns 10% credit after their first drop.</p>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/5 p-4 text-sm text-white/80">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Invite link</p>
            <p className="mt-1 break-words font-mono text-white">{summary.link}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={handleCopy}>
                Copy link
              </Button>
              <Button asChild variant="secondary" size="sm">
                <a href={telegramShare} target="_blank" rel="noreferrer">
                  Share Telegram
                </a>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <a href={whatsappShare} target="_blank" rel="noreferrer">
                  Share WhatsApp
                </a>
              </Button>
            </div>
            {copyToast && <p className="mt-2 text-xs text-emerald-200">{copyToast}</p>}
          </div>
        </div>
      </header>
      {commissionAlert && (
        <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          <p className="font-semibold">{commissionAlert.title}</p>
          <p className="text-white/80">{commissionAlert.message}</p>
        </div>
      )}
      {clickWarning && (
        <div className="rounded-3xl border border-yellow-400/40 bg-yellow-400/10 p-3 text-sm text-yellow-100">
          We couldn’t record the latest click. Please refresh and try again.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/10 bg-card p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
            {card.sub && <p className="text-sm text-white/60">{card.sub}</p>}
          </div>
        ))}
      </div>
      <p className="text-sm text-white/60">Every unique click pays £0.30. Every friend checkout generates 10% wallet credit — rewards never expire.</p>
      {lastClickTime && (
        <p className="text-xs text-white/50">Last click recorded {new Date(lastClickTime).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[40px] border border-white/10 bg-night-950/70 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Invites overview</p>
          </div>
          {inviteLoading && !inviteRows.length ? (
            <p className="text-sm text-white/60">Loading invites…</p>
          ) : (
            <HistoryTable
              rows={inviteRows.map((invite) => ({
                id: invite.id,
                primary: invite.inviteeEmail,
                secondary: invite.locker || "Locker pending",
                status: formatStatus(invite.status),
                timestamp: invite.createdAt,
                amount: null,
              }))}
              meta={inviteMeta}
              page={invitePage}
              onPageChange={setInvitePage}
            />
          )}
        </div>
        <div className="rounded-[40px] border border-white/10 bg-night-950/70 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Commission history</p>
            <Button size="sm" variant="ghost" onClick={() => router.push("/dashboard")}>
              View dashboard
            </Button>
          </div>
          {commissionLoading && !commissionRows.length ? (
            <p className="text-sm text-white/60">Loading commissions…</p>
          ) : (
            <CommissionTable rows={commissionRows} />
          )}
        </div>
      </div>

      <div className="rounded-[40px] border border-white/10 bg-night-950/60 p-6">
        <h2 className="text-2xl font-semibold text-white">How referrals work</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-white/70">
          <li>Share your invite link with trusted friends.</li>
          <li>They verify with concierge, unlocking their first locker.</li>
          <li>After their first successful drop, 10% of their spend appears in your wallet.</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <a href="/contact">Ping concierge</a>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/referral/poster">Poster generator</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}


function CommissionTable({ rows }: { rows: CommissionTransaction[] }) {
  if (rows.length === 0) {
    return <StateMessage variant="empty" title="No commissions yet" body="Share your link or remind friends to top up." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-white/80">
        <thead className="text-white/50">
          <tr>
            <th className="py-2">Amount</th>
            <th>Type</th>
            <th>Friend</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/10">
              <td className="py-2">{currency.format(row.amount)}</td>
              <td>{row.type || "Commission"}</td>
              <td>{row.sourceInvitee || "—"}</td>
              <td>{new Date(row.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HistoryTable({
  rows,
  meta,
  page,
  onPageChange,
}: {
  rows: { id: number; primary: string; secondary: string; status: string; timestamp: string; amount: number | null }[];
  meta?: { page?: number; pageCount?: number };
  page: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="mt-6 space-y-4">
      <div className="divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10">
        {rows.length === 0 ? (
          <StateMessage variant="empty" title="No data yet" body="Share your link to see activity here." />
        ) : (
          rows.map((row) => (
            <article key={row.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-white">{row.primary}</p>
                <p className="text-sm text-white/60">{row.secondary}</p>
              </div>
              <StatusPill status={row.status} />
              <div className="text-sm text-white/60">{new Date(row.timestamp).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</div>
            </article>
          ))
        )}
      </div>
      {meta?.pageCount && meta.pageCount > 1 && (
        <div className="flex items-center gap-2 text-sm text-white/70">
          <button
            className="rounded-full border border-white/15 px-3 py-1 disabled:opacity-40"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span>
            Page {page} / {meta.pageCount}
          </span>
          <button
            className="rounded-full border border-white/15 px-3 py-1 disabled:opacity-40"
            onClick={() => onPageChange(Math.min(meta.pageCount, page + 1))}
            disabled={meta.pageCount ? page >= meta.pageCount : false}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const palette: Record<string, string> = {
    paid: "bg-emerald-400/10 text-emerald-200 border-emerald-400/40",
    locker_active: "bg-brand-500/10 text-brand-200 border-brand-500/40",
    pending: "bg-yellow-400/10 text-yellow-200 border-yellow-400/40",
    processing: "bg-blue-400/10 text-blue-200 border-blue-400/40",
  };
  const key = status?.toLowerCase();
  const classes = palette[key] || "bg-white/5 text-white/70 border-white/20";
  return <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.3em] ${classes}`}>{status}</span>;
}

function formatStatus(label: string) {
  return label
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
