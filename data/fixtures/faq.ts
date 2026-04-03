export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  keywords?: string[];
};

export type FaqCategory = {
  id: string;
  title: string;
  description: string;
  entries: FaqEntry[];
};

const lockerEntries: FaqEntry[] = [
  {
    id: "locker-access",
    question: "How do I get locker access?",
    answer: "Create an account, verify your ID inside /account, and place your first order. We text the locker PIN + QR right before pickup.",
    keywords: ["verify", "locker"]
  },
  {
    id: "locker-window",
    question: "How long do lockers stay open?",
    answer: "Standard window is 120 minutes after the SMS. Reply BEFORE the timer expires if you need an extension so concierge can reassign inventory.",
    keywords: ["window", "pickup"]
  },
  {
    id: "missed-pickup",
    question: "What if I miss the pickup?",
    answer: "Reply to the locker SMS or Telegram @greenhub_concierge. We can restock or schedule another locker once the courier returns.",
    keywords: ["miss", "pickup"]
  }
];

const paymentEntries: FaqEntry[] = [
  {
    id: "payment-methods",
    question: "What payment methods are supported?",
    answer: "Wallet top-ups (minimum £20), NowPayments card/USDT bridge, and manual bank or direct USDT transfers. Cash on delivery isn’t offered.",
    keywords: ["card", "USDT"]
  },
  {
    id: "transfer-id",
    question: "Why is the Transfer ID important?",
    answer: "It links your payments to the correct account. Add it to every bank/USDT reference and include it when chatting with concierge.",
    keywords: ["transfer id", "reference"]
  },
  {
    id: "nowpayments-issues",
    question: "NowPayments flagged my card—what now?",
    answer: "They run their own risk checks. If the invoice fails twice, switch to wallet/bank or DM concierge so finance can review manually.",
    keywords: ["nowpayments", "card"]
  }
];

const orderEntries: FaqEntry[] = [
  {
    id: "order-status",
    question: "Where can I see order status?",
    answer: "Visit /orders for live tracking. Each card shows locker postcode, payment method, and a link to the detail page.",
    keywords: ["status", "orders"]
  },
  {
    id: "change-locker",
    question: "Can I change lockers after ordering?",
    answer: "Yes—reply to the SMS or ping Telegram @greenhub_concierge with the new postcode. We need ~2h notice to reassign.",
    keywords: ["change", "locker"]
  },
  {
    id: "damaged",
    question: "What if the parcel looks tampered?",
    answer: "Take photos, close the locker, and text HELP + locker ID immediately. Ops will inspect and refund or redeliver.",
    keywords: ["damaged", "parcel"]
  }
];

const walletEntries: FaqEntry[] = [
  {
    id: "wallet-withdraw",
    question: "How do I withdraw funds?",
    answer: "Use /wallet/withdraw to send balance to UK bank, USDT, or another concierge handle. Minimum transfer is £20.",
    keywords: ["withdraw", "wallet"]
  },
  {
    id: "wallet-refund",
    question: "How long do wallet refunds take?",
    answer: "Wallet credits post within 6 hours of approval. Bank cards can take 3–5 working days depending on your issuer.",
    keywords: ["refund", "wallet"]
  }
];

const referralEntries: FaqEntry[] = [
  {
    id: "referral-rewards",
    question: "What do I earn from referrals?",
    answer: "£0.30 per verified click plus 10% of every locker order your friend makes for life.",
    keywords: ["referral", "rewards"]
  },
  {
    id: "share-link",
    question: "Where do I find my invite link?",
    answer: "Visit /referral or /invite?ref=YOURCODE. Copy the link or generate a poster under /referral/poster.",
    keywords: ["invite", "poster"]
  }
];

export const faqCategories: FaqCategory[] = [
  { id: "all", title: "All topics", description: "Every locker + wallet question in one place.", entries: [] },
  { id: "locker", title: "Lockers", description: "Access, pickup windows, and incidents.", entries: lockerEntries },
  { id: "payment", title: "Payments", description: "Wallet, NowPayments, and manual transfers.", entries: paymentEntries },
  { id: "orders", title: "Orders", description: "Tracking, locker changes, damaged parcels.", entries: orderEntries },
  { id: "wallet", title: "Wallet & withdrawals", description: "Credits, refunds, payouts.", entries: walletEntries },
  { id: "referral", title: "Referrals", description: "Earning from invites.", entries: referralEntries }
];

export type FaqEntryWithCategory = FaqEntry & { category: string };

export const flatFaqEntries: FaqEntryWithCategory[] = faqCategories
  .filter((category) => category.id !== "all")
  .flatMap((category) => category.entries.map((entry) => ({ ...entry, category: category.id })));
