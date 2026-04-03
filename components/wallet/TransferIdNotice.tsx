"use client";

import clsx from "clsx";
import { useState } from "react";

export function TransferIdNotice({ transferId, className }: { transferId?: string | null; className?: string }) {
  const [copied, setCopied] = useState(false);

  if (!transferId) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transferId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn("Copy failed", error);
    }
  };

  return (
    <div
      className={clsx(
        "flex flex-wrap items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80",
        className
      )}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">Your Transfer ID</p>
        <p className="font-mono text-lg text-white">{transferId}</p>
        <p className="text-xs text-white/60">Include this ID in bank/USDT references so ops can match your transfer.</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="ml-auto rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white hover:border-white/50"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export default TransferIdNotice;
