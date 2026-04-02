export type NavMatch = "exact" | "prefix";

export type NavItem = {
  label: string;
  href: string;
  match?: NavMatch;
};

export type NavigationCTA = {
  label: string;
  href: string;
};

export const primaryNav: NavItem[] = [
  { label: "Products", href: "/", match: "exact" },
  { label: "Orders", href: "/orders", match: "prefix" },
  { label: "Notifications", href: "/notifications", match: "prefix" },
  { label: "How it works", href: "/how-it-works", match: "exact" },
  { label: "Checkout", href: "/checkout", match: "exact" }
];

export const ctaButtons: { primary: NavigationCTA; secondary: NavigationCTA } = {
  primary: { label: "Browse products", href: "/" },
  secondary: { label: "Book a locker", href: "/lockers" }
};

export type DrawerSection = {
  title: string;
  links: NavItem[];
};

export const drawerSections: DrawerSection[] = [
  {
    title: "Account",
    links: [
      { label: "Overview", href: "/account", match: "prefix" },
      { label: "Wallet", href: "/wallet", match: "prefix" },
      { label: "Rewards", href: "/rewards", match: "prefix" }
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

export const drawerQuickLinks: NavItem[] = [
  { label: "FAQ", href: "/faq" },
  { label: "Shipping", href: "/shipping" },
  { label: "Contact", href: "/support" }
];

export type FooterColumn = {
  title: string;
  links: NavItem[];
};

export const footerColumns: FooterColumn[] = [
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
  }
];

export const socialLinks: NavItem[] = [
  { label: "Instagram", href: "https://instagram.com/greenhub" },
  { label: "Telegram", href: "https://t.me/greenhub" },
  { label: "Email", href: "mailto:hi@greenhub.co.uk" }
];

export const footerContact = {
  address: "Belfast City Centre · NI",
  email: "hi@greenhub.co.uk",
  phone: "+44 28 1234 5678",
  disclaimer: "Cannabis products sold in compliance with NI regulations. 21+ only."
};
