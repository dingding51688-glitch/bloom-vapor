"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { StateMessage } from "@/components/StateMessage";
import Button from "@/components/ui/button";
import { leaderboardFixture, type LeaderboardEntry } from "@/data/fixtures/referralLeaderboard";

const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const ranges = [
  { id: "month", label: "This month" },
  { id: "quarter", label: "This quarter" },
  { id: "year", label: "This year" }
];

export default function ReferralLeaderboardPage() {
  const { token } = useAuth();
  const [range, setRange] = useState<typeof ranges[number]["id"]>("month");

  // TODO: replace with `GET /api/referral/leaderboard?range=` when backend available
  const leaderboard = leaderboardFixture;
  const topTen = leaderboard.slice(0, 10);
  const rising = leaderboard.slice(10, 20);

  const heroCopy = {
    title: "Top ambassadors",
    body: "Every quarter we spotlight the members who activate the most lockers. Top 3 receive a concierge bonus and limited merch drop.",
    nextReset: "Reset April 30, 2026"
  };

  return (
    <section className="space-y-8 px-4 py-10">
      <header className="rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,#050505,#0e1017)] p-6 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Referral leaderboard</p>
            <h1 className="text-3xl font-semibold">{heroCopy.title}</h1>
            <p className="text-sm text-white/70">{heroCopy.body}</p>
            <p className="text-xs text-white/50">{heroCopy.nextReset}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            {ranges.map((option) => (
              <button
                key={option.id}
                onClick={() => setRange(option.id)}
                className={`rounded-full border px-4 py-2 ${range === option.id ? "border-white bg-white/10 text-white" : "border-white/15 text-white/70 hover:border-white/40"}`}
              >
                {option.label}
              </button>
            ))}
            <Button asChild>
              <Link href="/referral">Go to referral tools</Link>
            </Button>
          </div>
        </div>
      </header>

      {!token && (
        <StateMessage
          variant="info"
          title="Want to climb the board?"
          body="Log in or create an account to start sharing your locker invite link."
          actionLabel="Start earning"
          onAction={() => (window.location.href = "/login")}
        />
      )}

      <LeaderboardTable rows={topTen} rangeLabel={ranges.find((r) => r.id === range)?.label || "This month"} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-card p-4 text-sm text-white/80">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Rising stars</p>
          <ul className="mt-3 space-y-2">
            {rising.map((entry) => (
              <li key={entry.rank} className="flex items-center justify-between text-white/80">
                <span>
                  #{entry.rank} {entry.userAlias} <span className="text-white/50">· {entry.city}</span>
                </span>
                <span>{currency.format(entry.lastMonthCommission)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-card p-4 text-sm text-white/80">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Programme rules</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Only genuine invites count (no coupon dumps, no paid ads).</li>
            <li>Commission posts within 12h of locker delivery.</li>
            <li>Top 3 each month receive £150 bonus; top 10 qualify for merch drop.</li>
            <li>Accounts abusing the system will be removed from the leaderboard.</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-card p-4 text-sm text-white/80">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">FAQ</p>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="font-semibold text-white">How often is data refreshed?</dt>
              <dd className="text-white/70">Every six hours. Use the range selector to view monthly, quarterly, or yearly stats.</dd>
            </div>
            <div>
              <dt className="font-semibold text-white">What if I tie with someone?</dt>
              <dd className="text-white/70">Tie-breakers look at lifetime commission, then earliest join date.</dd>
            </div>
            <div>
              <dt className="font-semibold text-white">How do I cash out?</dt>
              <dd className="text-white/70">Same flow as other rewards — Wallet → Withdraw (min £20 via bank or USDT).</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

type LeaderboardTableProps = {
  rows: LeaderboardEntry[];
  rangeLabel: string;
};

function LeaderboardTable({ rows, rangeLabel }: LeaderboardTableProps) {
  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <section className="rounded-[40px] border border-white/10 bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Top 10</p>
          <h2 className="text-2xl font-semibold text-white">{rangeLabel} ranking</h2>
        </div>
        <p className="text-xs text-white/60">Commission shown is lifetime (right column shows recent)</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {podium.map((entry) => (
          <PodiumCard key={entry.rank} entry={entry} />
        ))}
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="text-white/50">
            <tr>
              <th className="py-2">Rank</th>
              <th>Ambassador</th>
              <th>City</th>
              <th>Orders</th>
              <th>Lifetime</th>
              <th>Last month</th>
            </tr>
          </thead>
          <tbody>
            {rest.map((entry) => (
              <tr key={entry.rank} className="border-t border-white/10">
                <td className="py-2">#{entry.rank}</td>
                <td>{entry.userAlias}</td>
                <td>{entry.city}</td>
                <td>{entry.ordersDriven}</td>
                <td>{currency.format(entry.lifetimeCommission)}</td>
                <td>{currency.format(entry.lastMonthCommission)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PodiumCard({ entry }: { entry: LeaderboardEntry }) {
  const colors = ["#ffd166", "#cfd8dc", "#ffa69e"];
  const color = colors[entry.rank - 1] || "#ffffff";
  return (
    <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.3em]" style={{ color }}>#{entry.rank}</p>
      <h3 className="text-xl font-semibold text-white">{entry.userAlias}</h3>
      <p className="text-sm text-white/60">{entry.city}</p>
      <p className="text-sm text-white/80">Orders driven: {entry.ordersDriven}</p>
      <p className="text-sm text-white/80">Lifetime: {currency.format(entry.lifetimeCommission)}</p>
      <p className="text-xs text-white/50">Last month: {currency.format(entry.lastMonthCommission)}</p>
    </div>
  );
}
