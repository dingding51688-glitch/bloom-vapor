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
  { label: "Home", href: "/", match: "exact" },
  { label: "Shop all", href: "/products", match: "prefix" },
  { label: "Flowers", href: "/products?category=flowers" },
  { label: "Pre-rolls", href: "/products?category=pre-rolls" },
  { label: "Vapes", href: "/products?category=vapes" },
  { label: "How it works?", href: "/how-it-works", match: "exact" },
  { label: "Contact", href: "/contact", match: "exact" }
];

export const ctaButtons: { primary: NavigationCTA; secondary: NavigationCTA } = {
  primary: { label: "Browse products", href: "/products" },
  secondary: { label: "Book a locker", href: "/checkout" }
};

export type DrawerSection = {
  title: string;
  links: NavItem[];
};

export const marketingLinks: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Terms", href: "/terms" }
];

export const drawerSections: DrawerSection[] = [
  {
    title: "Menu",
    links: primaryNav
  },
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
  { label: "Returns", href: "/returns" },
  { label: "Contact", href: "/contact" }
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
      { label: "Shipping", href: "/shipping" }
    ]
  },
  {
    title: "Policies",
    links: [
      { label: "Returns", href: "/returns" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" }
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
