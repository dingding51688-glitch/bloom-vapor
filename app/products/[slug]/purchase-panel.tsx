"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/button";
import type { ProductRecord, WeightOption } from "@/lib/types";
import { useRouter } from "next/navigation";

const MIN_QTY = 1;
const MAX_QTY = 5;

const FALLBACK_WEIGHT_OPTIONS: WeightOption[] = [
  { id: 1001, label: "3.5g", price: 35, unitPrice: "£10/g" },
  { id: 1002, label: "7g", price: 60, unitPrice: "£8.57/g" },
  { id: 1003, label: "14g", price: 110, unitPrice: "£7.85/g" },
  { id: 1004, label: "28g", price: 180, unitPrice: "£6.42/g", featured: true }
];

function formatUnitPrice(option: WeightOption) {
  if (option.unitPrice) return option.unitPrice;
  const match = option.label.match(/([\d.]+)\s*g/i);
  if (match) {
    const grams = parseFloat(match[1]);
    if (!Number.isNaN(grams) && grams > 0) {
      return `£${(option.price / grams).toFixed(2)}/g`;
    }
  }
  return "Locker ready";
}

export function ProductDetailPurchase({ product }: { product: ProductRecord }) {
  const router = useRouter();
  const rawOptions = product.weightOptions ?? [];
  const normalizedOptions = rawOptions.length > 0 ? rawOptions : FALLBACK_WEIGHT_OPTIONS;
  const [selectedId, setSelectedId] = useState<number | null>(normalizedOptions[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);

  const displayOptions = normalizedOptions.map((option) => {
    const highlight = option.featured || option.label.toLowerCase().includes("28");
    return {
      ...option,
      displayUnitPrice: formatUnitPrice(option),
      highlight
    };
  });

  const selected = displayOptions.find((option) => option.id === selectedId) ?? displayOptions[0] ?? null;

  const handleCheckout = () => {
    if (!selected) return;
    const params = new URLSearchParams();
    params.set("product", product.slug);
    params.set("weight", selected.label);
    params.set("qty", quantity.toString());
    router.push(`/checkout?${params.toString()}`);
  };

  const adjustQuantity = (delta: number) => {
    setQuantity((prev) => Math.min(MAX_QTY, Math.max(MIN_QTY, prev + delta)));
  };

  return (
    <div className="flex flex-col gap-6 rounded-[40px] border border-night-100 bg-white p-6 text-night-900 shadow-card">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-night-400">Weight</p>
        <h2 className="text-2xl font-semibold">Choose your weight</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {displayOptions.map((option) => {
          const isActive = selected?.id === option.id;
          const showMostChosen = option.highlight;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedId(option.id)}
              className={clsx(
                "relative rounded-[32px] border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5",
                showMostChosen ? "border-emerald-300" : "border-night-100",
                isActive && "border-emerald-500 shadow-lg"
              )}
            >
              {showMostChosen && (
                <span className="absolute left-5 top-5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-600">
                  Most chosen
                </span>
              )}
              {isActive && (
                <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-night-900">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                    <path d="M20 6.5L9.5 17l-5.5-5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
              <div className="flex flex-col gap-4 pt-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-night-500">{option.label}</p>
                  <p className="text-3xl font-semibold">£{option.price.toFixed(2)}</p>
                </div>
                <p className="text-sm text-night-500">{option.displayUnitPrice}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between rounded-[32px] border border-night-100 bg-night-50 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-night-500">Quantity</p>
          <p className="text-3xl font-semibold">{quantity}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-night-200 text-2xl font-semibold text-night-900 disabled:opacity-40"
            onClick={() => adjustQuantity(-1)}
            disabled={quantity === MIN_QTY}
            aria-label="Decrease quantity"
          >
            –
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-night-200 text-2xl font-semibold text-night-900 disabled:opacity-40"
            onClick={() => adjustQuantity(1)}
            disabled={quantity === MAX_QTY}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <Button
        onClick={handleCheckout}
        disabled={!selected}
        className="w-full border border-emerald-500 bg-none bg-emerald-400 text-night-900 hover:bg-emerald-300"
      >
        ADD TO CART
      </Button>
      <Link
        href="/locker-eta"
        className="text-center text-xs font-semibold uppercase tracking-[0.35em] text-night-500 hover:text-night-700"
      >
        LOCKER ETA SHEET →
      </Link>

      <div className="rounded-[32px] border border-night-100 bg-night-50/80 p-5 text-sm text-night-700">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-night-500">Where we ship</p>
        <p className="mt-1 text-base font-semibold text-night-900">We ship across the United Kingdom.</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-night-800">
          <li>England</li>
          <li>Scotland</li>
          <li>Wales</li>
        </ul>
        <p className="mt-3 text-sm text-night-600">We do NOT ship to Northern Ireland.</p>
        <p className="text-sm text-night-600">Orders are vacuum-sealed and discreetly packaged. Tracking number will be provided within 24 hours.</p>
      </div>
    </div>
  );
}
