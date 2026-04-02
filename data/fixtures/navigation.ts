export type NavItem = {
  label: string;
  href: string;
};

export const primaryNav: NavItem[] = [
  { label: "Products", href: "/" },
  { label: "Orders", href: "/orders" },
  { label: "Notifications", href: "/notifications" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Checkout", href: "/checkout" }
];

export const ctaButtons = {
  primary: { label: "Browse products", href: "/" },
  secondary: { label: "Book a locker", href: "/lockers" }
};

export const drawerSections = [
  {
    title: "Account",
    links: [
      { label: "Overview", href: "/account" },
      { label: "Wallet", href: "/wallet" },
      { label: "Rewards", href: "/rewards" }
    ]
  },
  {
    title: "Locker network",
    links: [
      { label: "Titanic Quarter", href: "/lockers/titanic" },
      { label: "Cathedral Quarter", href: "/lockers/cathedral" },
      { label: "Ormeau", href: "/lockers/ormeau" }
    ]
  }
];

export const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Locker partners", href: "/lockers" },
      { label: "Press", href: "/press" }
    ]
  },
  {
    title: "Help",
    links: [
      { label: "Support", href: "/support" },
      { label: "FAQ", href: "/faq" },
      { label: "Terms", href: "/terms" }
    ]
  },
  {
    title: "Connect",
    links: [
      { label: "Instagram", href: "https://instagram.com/greenhub" },
      { label: "Telegram", href: "https://t.me/greenhub" },
      { label: "Email", href: "mailto:hi@greenhub.co.uk" }
    ]
  }
];

export const footerContact = {
  address: "Belfast City Centre · NI",
  email: "hi@greenhub.co.uk",
  phone: "+44 28 1234 5678",
  disclaimer: "Cannabis products sold in compliance with NI regulations. 21+ only."
};
