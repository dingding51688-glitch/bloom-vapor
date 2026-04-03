"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/data/fixtures/navigation";

type NavLinkProps = NavItem & {
  onClick?: () => void;
  variant?: "desktop" | "drawer";
};

function isActivePath(pathname: string, href: string, match?: "exact" | "prefix") {
  if (match === "prefix") {
    return pathname.startsWith(href);
  }
  return pathname === href;
}

export function NavLink({ label, href, match, onClick, variant = "desktop" }: NavLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href, match);

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "transition-colors",
        variant === "desktop" &&
          clsx(
            "text-[11px] uppercase tracking-[0.2em] pb-1.5 border-b-2 border-transparent",
            active
              ? "text-white border-white"
              : "text-[rgba(255,255,255,0.55)] hover:text-white"
          ),
        variant === "drawer" &&
          clsx(
            "text-sm font-semibold uppercase tracking-[0.15em]",
            active ? "text-white" : "text-[rgba(255,255,255,0.65)]"
          )
      )}
    >
      {label}
    </Link>
  );
}

export default NavLink;
