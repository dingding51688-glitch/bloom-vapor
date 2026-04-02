import { ProductCardData } from "@/lib/types";

export type HeroLink = {
  label: string;
  href: string;
};

export const heroClassicContent = {
  eyebrow: "GreenHub NI · Premium Lockers",
  title: "Cannabis you can count on, 24/7 lockers in Belfast",
  subtitle:
    "Reserve curated flower, carts, and edibles online — collect from climate-controlled lockers the moment you're ready.",
  primaryCta: { label: "Browse products", href: "/" } satisfies HeroLink,
  secondaryCta: { label: "How lockers work", href: "/#lockers" } satisfies HeroLink,
  highlight: "Now shipping subscription refills across NI",
  stats: [
    { label: "Locker pickup", value: "24/7" },
    { label: "Members served", value: "3.1k" },
    { label: "Avg. rating", value: "4.9/5" }
  ]
};

export const homeHeroContent = {
  highlight: "HOME",
  eyebrow: "Online order · Locker pickup",
  title: "Order Online & Pick Up at InPost Lockers",
  subtitle: "According to the postcode you provide, the parcel will be delivered to the nearest InPost locker.",
  bullets: [
    "24-hour dispatch with real-time tracking updates",
    "Sealed disguise packaging with scent & appearance masking",
    "Privacy-safe delivery straight to the locker"
  ],
  primaryCta: { label: "Shop now", href: "/search" } satisfies HeroLink,
  secondaryCta: { label: "How it works", href: "/how-it-works" } satisfies HeroLink,
  alignment: "left" as const
};

export type LockerStep = {
  icon: string;
  title: string;
  description: string;
};

export const lockerFlow = {
  title: "How the smart lockers work",
  steps: [
    {
      icon: "①",
      title: "Place your order online",
      description: "Browse the menu, choose the locker that suits your route, and confirm the pickup window."
    },
    {
      icon: "②",
      title: "We prep + text your code",
      description: "Concierge weighs, seals, and books the InPost slot before texting you the QR + PIN."
    },
    {
      icon: "③",
      title: "Collect at the locker",
      description: "Swing by whenever you're ready—scan the QR, grab your parcel, and reply DONE so we can reset it."
    }
  ] satisfies LockerStep[],
  tip: {
    label: "Locker coverage",
    content: "Belfast + Derry lockers stay live 24/7 with concierge relocation if you ping us 2 hours ahead."
  }
};

export const featuredProducts: ProductCardData[] = [
  {
    id: "cereal-milk",
    title: "Cereal Milk",
    category: "Hybrid flower",
    description: "Creamy, uplifting hybrid sourced from Bay Area craft growers.",
    price: "£45",
    badge: "Top pick",
    imageUrl: "/images/products/cereal-milk.png"
  },
  {
    id: "ice-pop",
    title: "Ice Pop 1g Cart",
    category: "Live resin",
    description: "Single source live resin cart with bright sherbet notes.",
    price: "£38",
    imageUrl: "/images/products/ice-pop.png"
  },
  {
    id: "sativa-flight",
    title: "Sativa Flight",
    category: "Starter pack",
    description: "Three 3.5g jars of daytime favorites, ready for rotation.",
    price: "£95",
    imageUrl: "/images/products/sativa-flight.png"
  },
  {
    id: "night-bites",
    title: "Night Bites",
    category: "Edibles",
    description: "5 mg micro-dose chews infused with indica live rosin.",
    price: "£22",
    imageUrl: "/images/products/night-bites.png"
  }
];

export type PaymentPlan = {
  title: string;
  description: string;
  price: string;
  frequency: string;
  badge?: string;
  features: string[];
  cta: HeroLink;
};

export const paymentRecommendations = {
  recommendation: {
    title: "Locker Reserve+",
    description: "Weekly locker allocation, refills, and SMS pickup assistance",
    price: "£49",
    frequency: "/ month",
    badge: "Most popular",
    features: [
      "Dedicated 24-hour locker hold",
      "Express customer care",
      "Bonus 10% off refills"
    ],
    cta: { label: "Start Reserve+", href: "/reserve" }
  } satisfies PaymentPlan,
  secondary: [
    {
      title: "Pay as you go",
      description: "No subscription — book slots whenever you need",
      price: "£0",
      frequency: "/ booking",
      features: ["Standard locker access", "Pickup within 12 hrs"] ,
      cta: { label: "View menu", href: "/" }
    },
    {
      title: "Refill Club",
      description: "Monthly curated drop shipped to your locker",
      price: "£85",
      frequency: "/ month",
      features: ["3 premium eighths", "Auto locker assignment"],
      cta: { label: "Join Club", href: "/club" }
    }
  ] satisfies PaymentPlan[]
};

export type FeaturedCollection = {
  title: string;
  href: string;
  imageUrl: string;
  label?: string;
  subtitle?: string;
  imageAlt?: string;
  tone?: "green" | "orange" | "cream";
};

export const featuredCollectionsContent: FeaturedCollection[] = [
  {
    title: "Flowers",
    label: "Now shipping",
    subtitle: "New batches across NI lockers",
    href: "/search/flower",
    imageUrl: "https://cms.greenhub420.co.uk/uploads/Rainbow_Runtz_07747a3ee4.jpg",
    imageAlt: "Curated flower jars",
    tone: "green"
  },
  {
    title: "Pre-rolls",
    label: "Infused minis",
    subtitle: "Five-pack slow burn cones",
    href: "/search/pre-rolls",
    imageUrl: "https://cms.greenhub420.co.uk/uploads/20260312152800_3_2_ec9202b7d0.jpg",
    imageAlt: "Infused pre-roll tins",
    tone: "orange"
  },
  {
    title: "Vapes",
    label: "Locker ready",
    subtitle: "Live resin carts in stock",
    href: "/search/Vapes",
    imageUrl: "https://cms.greenhub420.co.uk/uploads/123_3e71adf87c.jpg",
    imageAlt: "Gold vaporizer carts",
    tone: "cream"
  }
];

export type HowItWorksFaq = {
  question: string;
  answer: string;
};

export const howItWorksFaq: HowItWorksFaq[] = [
  {
    question: "How do I get locker access?",
    answer: "Create an account, verify your details, and place your first order. We SMS locker credentials right before pickup."
  },
  {
    question: "Can I pay with card?",
    answer: "Preferred method is USDT via NowPayments. Wallet top-ups and debit/credit bridge are available for verified members."
  },
  {
    question: "How long is the locker hold?",
    answer: "Standard hold is 2 hours. Reserve+ subscribers can extend holds or request concierge assistance via chat."
  },
  {
    question: "What if I miss my pickup?",
    answer: "Message concierge before the window expires. We can reassign a locker or restock your order depending on courier schedules."
  }
];

export type ContactHeroDetail = {
  label: string;
  value: string;
  href?: string;
};

export type ContactChannel = {
  title: string;
  detail: string;
  description?: string;
  href?: string;
  badge?: string;
};

export const contactHeroDetails = [
  { label: "Email", value: "support@greenhub.app", href: "mailto:support@greenhub.app" },
  { label: "Secure chat", value: "In-app encrypted messenger" },
  { label: "Operating hours", value: "09:00–21:00 GMT · Mon–Sun" }
];

export const contactChannels: ContactChannel[] = [
  {
    title: "Telegram concierge",
    detail: "@greenhub_concierge",
    description: "Fastest replies between 09:00–21:00 GMT. Share your order reference for priority handling.",
    href: "https://t.me/greenhub_concierge",
    badge: "< 5 min"
  },
  {
    title: "Email support",
    detail: "support@greenhub.app",
    description: "Best for locker reschedules, payment confirmations, and general support threads.",
    href: "mailto:support@greenhub.app"
  },
  {
    title: "Wholesale & media",
    detail: "partners@greenhub.app",
    description: "For corporate refills, influencer drops, or urgent press enquiries.",
    href: "mailto:partners@greenhub.app"
  },
  {
    title: "SMS hotline",
    detail: "+44 7441 902134",
    description: "Locker pickup or code issues only. Text HELP + your locker code for the on-call agent.",
    href: "sms:+447441902134"
  }
];

export const inPostFlow = {
  title: "InPost & locker reminders",
  steps: [
    { icon: "①", title: "Pick the locker", description: "Choose the location that suits your route; concierge can relocate with 2h notice." },
    { icon: "②", title: "Verify payment", description: "Wallet or USDT confirmation triggers the InPost QR + PIN message." },
    { icon: "③", title: "Collect & confirm", description: "Scan the QR, grab your parcel, and reply DONE so we can reset the locker." }
  ],
  tip: { label: "InPost", content: "Most Belfast lockers sit inside 24/7 petrol stations for easier pickup." }
};


export type TermsSection = {
  id: string;
  title: string;
  summary: string;
  body: string[];
  bullets?: string[];
};

// TODO: replace placeholder copy once Legal supplies the final Terms version.
export const termsSections: TermsSection[] = [
  {
    id: "eligibility",
    title: "Eligibility & membership",
    summary: "Placeholder copy outlining who can create or keep a locker membership.",
    body: [
      "Members must be 21+ and reside within areas covered by the locker network. A government-issued ID and proof of address are reviewed before any order is dispatched.",
      "Accounts flagged for duplicate IDs or suspicious activity may be paused while support re-validates the identity on file."
    ],
    bullets: [
      "One account per member; sharing QR codes voids locker access until reverified.",
      "Concierge may request a selfie with ID for manual reviews.",
      "Members agree to update their address within 24 hours of moving."
    ]
  },
  {
    id: "payments",
    title: "Payments & billing",
    summary: "Placeholder text describing accepted payment methods and settlement timing.",
    body: [
      "Card payments process via the NowPayments bridge; crypto submissions settle once one confirmation is observed. Wallet credits remain valid for 12 months.",
      "Chargebacks or disputed transfers may result in immediate suspension pending finance review."
    ],
    bullets: [
      "Visa / Mastercard via bridge checkout (limits apply).",
      "USDT (TRC20) with on-chain confirmations.",
      "Manual bank transfers for wholesale partners upon request."
    ]
  },
  {
    id: "compliance",
    title: "Compliance & locker conduct",
    summary: "Placeholder obligations covering lawful use of lockers and parcel handling.",
    body: [
      "Members agree not to tamper with lockers, resell access codes, or interfere with couriers. Any misuse may be reported to local authorities.",
      "All products remain sealed; opening parcels inside the InPost site breaches terms and voids support."
    ],
    bullets: [
      "Collect parcels within the stated 2-hour window unless concierge extends it.",
      "Do not leave waste, packaging, or personal items in lockers.",
      "Report damaged parcels within 4 hours via support@greenhub.app."
    ]
  },
  {
    id: "privacy",
    title: "Privacy & data handling",
    summary: "Placeholder statements covering how personal data, IDs, and chat logs are stored.",
    body: [
      "ID uploads and locker history are encrypted at rest. Access is restricted to vetted concierge leads for verification purposes only.",
      "Support transcripts are retained for 30 days before anonymisation unless a regulatory request requires longer retention."
    ],
    bullets: [
      "Members may request data export or deletion via privacy@greenhub.app.",
      "Operational alerts (locker codes, delivery ETA) are transactional and cannot be unsubscribed from.",
      "Marketing preferences can be updated inside /account at any time."
    ]
  }
];

export type FaqGroup = {
  title: string;
  description: string;
  entries: HowItWorksFaq[];
};

export const faqGroups: FaqGroup[] = [
  {
    title: "Lockers & verification",
    description: "Checklist before you collect or change an InPost slot.",
    entries: [
      {
        question: "How do I verify my account?",
        answer:
          "Upload photo ID once inside /account. Concierge approves within 1-2 hours so you can reserve lockers the same day."
      },
      {
        question: "Can I change lockers after ordering?",
        answer:
          "Yes—reply to the locker SMS or ping Telegram @greenhub_concierge. We need 2 hours notice to reassign inventory."
      },
      {
        question: "What happens if I miss the pickup window?",
        answer:
          "Let concierge know before the 2h timer expires. We can restock or schedule another locker once the courier returns."
      }
    ]
  },
  {
    title: "Payments & refunds",
    description: "Supported methods, billing limits, and wallet credits.",
    entries: [
      {
        question: "What payment methods are supported?",
        answer:
          "USDT (TRC20) via NowPayments is instant. Wallet top-ups and Visa/Mastercard bridge work once your billing profile is verified."
      },
      {
        question: "How do wallet credits or refunds work?",
        answer:
          "Approved refunds return to your wallet within 6 hours. Bank cards can take 3-5 working days depending on your issuer."
      }
    ]
  },
  {
    title: "Coverage & support",
    description: "Where we currently deliver and how fast concierge responds.",
    entries: [
      {
        question: "Do you ship outside Belfast/Derry?",
        answer:
          "Lockers currently cover Belfast + Derry. Refill Club ships statewide; join the waitlist inside /contact."
      },
      {
        question: "How fast does concierge reply?",
        answer:
          "Telegram replies usually arrive in under 5 minutes from 09:00–21:00 GMT. Email support@greenhub.app for long-form requests."
      }
    ]
  }
];

export type ShippingMilestone = {
  icon: string;
  title: string;
  description: string;
  window: string;
};

export const shippingTimeline: ShippingMilestone[] = [
  {
    icon: "①",
    title: "Order cutoff",
    description: "Place orders before 8pm to guarantee same-evening locker allocation.",
    window: "Cutoff 20:00"
  },
  {
    icon: "②",
    title: "Courier prep",
    description: "Team weighs, seals, and books an InPost slot. Expect status updates in the app.",
    window: "Prep 20:00-22:00"
  },
  {
    icon: "③",
    title: "Locker SMS",
    description: "We send SMS + email with QR/PIN once the parcel is loaded and sensors verify it.",
    window: "Pickup 22:00-00:00"
  }
];

export const lockerUsageTips = {
  title: "Locker etiquette & late fees",
  steps: [
    { icon: "①", title: "Arrive within 2h", description: "Lockers auto-reset after 120 minutes to keep the queue fair." },
    { icon: "②", title: "Bring ID", description: "Concierge may request photo proof if sensors flag anomalies." },
    { icon: "③", title: "Report issues", description: "Message concierge immediately if the locker is jammed or empty." }
  ],
  tip: { label: "Late policy", content: "No-shows are restocked after 2h and incur £15 restocking fee unless you contact us." }
};

export type ReturnPolicyItem = {
  icon: string;
  title: string;
  description: string;
};

export const returnPolicies: ReturnPolicyItem[] = [
  {
    icon: "🕒",
    title: "2-hour locker window",
    description: "Refunds only apply before lockers auto-reset. Contact us before the window closes."
  },
  {
    icon: "📦",
    title: "Seal + photo required",
    description: "Send a photo of the unopened parcel + locker bay so we can investigate courier errors."
  },
  {
    icon: "💳",
    title: "Wallet credits",
    description: "Approved refunds return to your wallet within 6 hours; banks may take 3-5 days."
  },
  {
    icon: "🚫",
    title: "Non-refundable",
    description: "Opened products or missed locker pickups without notice fall outside refund scope."
  }
];

export const supportSteps = [
  { title: "Message concierge", detail: "Use Telegram or email within 2 hours, include order reference." },
  { title: "Provide evidence", detail: "Photo/video of parcel, locker, and any damage helps us escalate." },
  { title: "Wait for update", detail: "We confirm within 4 hours and credit wallet or schedule a replacement." }
];

export type AboutHighlight = {
  icon: string;
  title: string;
  description: string;
};

export const aboutHighlights: AboutHighlight[] = [
  { icon: "🔒", title: "Private lockers", description: "50+ Belfast & Derry lockers with 24/7 CCTV and PIN access." },
  { icon: "⚡", title: "Same-evening drops", description: "Order by 8pm, collect before midnight with live SMS tracking." },
  { icon: "🤝", title: "Human concierge", description: "NI-based team on Telegram + email every day 10:00-00:00." },
  { icon: "🌿", title: "Curated flower", description: "We partner with EU craft growers and test every batch." }
];

export const coverageStats = [
  { label: "Locker cities", value: "2", description: "Belfast & Derry" },
  { label: "Postcodes served", value: "47", description: "Titanic Quarter → Lisburn" },
  { label: "Partners", value: "3", description: "InPost, Rapid courier, NowPayments" }
];

export const supportCommitments = [
  { title: "Telegram concierge", detail: "@greenhub_concierge · replies < 5 min" },
  { title: "Email", detail: "concierge@greenhub420.co.uk · 4h resolution" },
  { title: "Ticket SLA", detail: "Refunds processed in 4h, replacements scheduled same evening" }
];
