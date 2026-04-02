"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWRInfinite from "swr/infinite";
import { useAuth } from "@/components/providers/AuthProvider";
import { StateMessage } from "@/components/StateMessage";
import { ordersFixture } from "@/data/fixtures/orders";
import type { OrderRecord } from "@/lib/types";
import { listMyOrders } from "@/lib/orders-api";

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const DATE_FMT = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });
const PAGE_SIZE = 10;

const FILTERS = [
  { id: "all", label: "All", match: () => true },
  { id: "active", label: "Active", statuses: ["pending", "paid", "processing", "awaiting_confirmations"] },
  { id: "fulfilled", label: "Fulfilled", statuses: ["dispatched", "delivered", "completed"] },
  { id: "canceled", label: "Canceled", statuses: ["canceled", "rejected", "refunded"] }
] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-200",
  paid: "bg-blue-500/10 text-blue-200",
  processing: "bg-blue-500/10 text-blue-200",
  awaiting_confirmations: "bg-orange-500/10 text-orange-200",
  dispatched: "bg-emerald-500/10 text-emerald-200",
  delivered: "bg-emerald-500/10 text-emerald-200",
  completed: "bg-emerald-500/10 text-emerald-200",
  canceled: "bg-red-500/10 text-red-200",
  rejected: "bg-red-500/10 text-red-200",
  refunded: "bg-red-500/10 text-red-200"
};

export default function OrdersPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [filterId, setFilterId] = useState<(typeof FILTERS)[number]["id"]>("all");

  const {
    data,
    error,
    size,
    setSize,
    isValidating,
    mutate
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (!token) return null;
      if (previousPageData && previousPageData.data.length === 0) return null;
      return ["orders", pageIndex + 1];
    },
    async ([, page]) => listMyOrders({ page, pageSize: PAGE_SIZE }),
    { revalidateFirstPage: true }
  );

  const loadingInitial = !!token && !data && !error;
  const orders = useMemo(() => (data ? data.flatMap((page) => page.data ?? []) : []), [data]);
  const hasMore = Boolean(data && data[data.length - 1]?.data?.length === PAGE_SIZE);

  const selectedFilter = FILTERS.find((filter) => filter.id === filterId) ?? FILTERS[0];
  const filteredOrders = useMemo(() => {
    if (selectedFilter.id === "all") return orders;
    const statuses = new Set(selectedFilter.statuses);
    return orders.filter((order) => statuses.has(order.status));
  }, [orders, selectedFilter]);

  const summarySource = orders.length ? orders : ordersFixture;
  const totalOrders = summarySource.length;
  const totalSpend = summarySource.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const latestOrder = summarySource
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0];

  const lastLocker = latestOrder?.lockerPostcode || "Assigned on pickup";
  const lastOrderAt = latestOrder?.createdAt ? DATE_FMT.format(new Date(latestOrder.createdAt)) : "—";

  if (!token) {
    return (
      <section className="space-y-6 px-4 py-10">
        <StateMessage
          title="Please sign in"
          body="Log in to review locker orders and invoices."
          actionLabel="Go to login"
          onAction={() => router.push("/login")}
        />
      </section>
    );
  }

  return (
    <section className="space-y-8 px-4 py-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Orders</p>
        <h1 className="text-3xl font-semibold text-white">Locker history</h1>
        <p className="text-sm text-white/70">Track every locker booking, payment, and dispatch in one place.</p>
      </header>

      <SummaryRow totalOrders={totalOrders} totalSpend={totalSpend} lastLocker={lastLocker} lastOrderAt={lastOrderAt} />

      <FilterRow
        filterId={filterId}
        setFilterId={setFilterId}
        onRefresh={() => mutate()}
      />

      {loadingInitial ? (
        <SkeletonList />
      ) : error && orders.length === 0 ? (
        <div className="space-y-6">
          <StateMessage
            variant="error"
            title="Unable to load orders"
            body={error.message}
            actionLabel="Retry"
            onAction={() => mutate()}
          />
          <OrderList
            orders={ordersFixture}
            filterLabel="Sample data"
            showLoadMore={false}
            loadingMore={false}
          />
        </div>
      ) : filteredOrders.length === 0 ? (
        <StateMessage
          variant="empty"
          title={filterId === "all" ? "No orders yet" : "Nothing matches this filter"}
          body="Browse the menu to start a locker order."
          actionLabel="Shop now"
          onAction={() => router.push("/products")}
        />
      ) : (
        <OrderList
          orders={filteredOrders}
          filterLabel={selectedFilter.label}
          showLoadMore={hasMore}
          loadingMore={isValidating && !!data}
          onLoadMore={() => setSize(size + 1)}
        />
      )}
    </section>
  );
}

function SummaryRow({
  totalOrders,
  totalSpend,
  lastLocker,
  lastOrderAt
}: {
  totalOrders: number;
  totalSpend: number;
  lastLocker: string;
  lastOrderAt: string;
}) {
  const cards = [
    { label: "Total orders", value: totalOrders.toString() },
    { label: "Wallet spend", value: GBP.format(totalSpend) },
    { label: "Last locker", value: `${lastLocker} · ${lastOrderAt}` }
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-3xl border border-white/10 bg-card p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function FilterRow({
  filterId,
  setFilterId,
  onRefresh
}: {
  filterId: (typeof FILTERS)[number]["id"];
  setFilterId: (value: (typeof FILTERS)[number]["id"]) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          onClick={() => setFilterId(filter.id)}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            filterId === filter.id
              ? "border-white bg-white/10 text-white"
              : "border-white/10 text-white/70 hover:border-white/30"
          }`}
        >
          {filter.label}
        </button>
      ))}
      <button
        onClick={onRefresh}
        className="ml-auto rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:border-white/40"
      >
        Refresh
      </button>
    </div>
  );
}

function OrderList({
  orders,
  filterLabel,
  showLoadMore,
  loadingMore,
  onLoadMore
}: {
  orders: OrderRecord[];
  filterLabel: string;
  showLoadMore: boolean;
  loadingMore: boolean;
  onLoadMore?: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">
        Showing {orders.length} {filterLabel.toLowerCase()} orders
      </p>
      {orders.map((order) => (
        <OrderCard key={order.reference} order={order} />
      ))}
      {showLoadMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          disabled={loadingMore}
          className="w-full rounded-full border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:border-white/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: OrderRecord }) {
  const statusClass = STATUS_COLORS[order.status] || "bg-white/10 text-white";
  const items = order.items || [];
  const preview = items.slice(0, 2);
  const extraCount = Math.max(0, items.length - preview.length);

  return (
    <article className="space-y-4 rounded-3xl border border-white/10 bg-card p-5 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">#{order.reference}</p>
          <h3 className="text-2xl font-semibold text-white">
            {GBP.format(order.totalAmount)}
            <span className="ml-2 text-sm text-white/50">{order.currency}</span>
          </h3>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/60">
          {order.createdAt && <span>{DATE_FMT.format(new Date(order.createdAt))}</span>}
          <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass}`}>
            {order.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {preview.map((item) => (
          <div key={`${order.reference}-${item.productId}-${item.weight}`} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80">
            <p className="font-semibold text-white">{item.title}</p>
            <p className="text-xs text-white/60">
              Qty {item.quantity}
              {item.weight ? ` · ${item.weight}` : ""}
            </p>
            <p className="text-xs text-white/60">{GBP.format(item.lineTotal)}</p>
          </div>
        ))}
        {extraCount > 0 && (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/20 text-sm text-white/60">
            +{extraCount} more item{extraCount > 1 ? "s" : ""}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
        <span>Pickup: {order.lockerPostcode || "Assigned"}</span>
        {order.paymentOption && <span>Payment: {order.paymentOption}</span>}
        <Link
          href={`/orders/${order.reference}`}
          className="ml-auto rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-white/50"
        >
          View details
        </Link>
      </div>
    </article>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="h-36 animate-pulse rounded-3xl bg-white/5" />
      ))}
    </div>
  );
}
