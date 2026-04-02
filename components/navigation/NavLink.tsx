"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/data/fixtures/navigation";

type NavLinkProps = NavItem & {
  onClick?: () => void;
  variant?: "desktop" | "drawer";
};

export function NavLink({ label, href, onClick, variant = "desktop" }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "transition-colors",
        variant === "desktop" && "text-sm font-medium",
        variant === "drawer" && "text-base font-semibold",
        isActive
          ? "text-white"
          : variant === "desktop"
          ? "text-ink-400 hover:text-white"
          : "text-ink-300 hover:text-white"
      )}
    >
      {label}
    </Link>
  );
}

export default NavLink;
