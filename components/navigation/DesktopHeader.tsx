"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui";
import {
  primaryNav,
  drawerSections,
  ctaButtons
} from "@/data/fixtures/navigation";
import { MobileDrawer } from "./MobileDrawer";
import { NavLink } from "./NavLink";

export function DesktopHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { token, userEmail, logout } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/5 bg-night-950/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              className="rounded-full border border-white/10 p-2 text-white md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <span className="inline-block text-lg leading-none">≡</span>
            </button>
            <Link href="/" className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.3em] text-ink-500">GreenHub NI</span>
              <span className="text-lg font-semibold text-white">Locker Network</span>
            </Link>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            {primaryNav.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href={ctaButtons.secondary.href}>{ctaButtons.secondary.label}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={ctaButtons.primary.href}>{ctaButtons.primary.label}</Link>
            </Button>
            {token ? (
              <div className="hidden items-center gap-3 rounded-full border border-white/10 px-3 py-1 text-sm text-ink-300 md:flex">
                <span>{userEmail || "Member"}</span>
                <button
                  onClick={logout}
                  className="text-xs uppercase tracking-wide text-plum-300 hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-3 text-sm text-ink-300 md:flex">
                <Link href="/login" className="hover:text-white">
                  Login
                </Link>
                <span className="text-ink-600">/</span>
                <Link href="/register" className="hover:text-white">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sections={drawerSections}
        ctas={ctaButtons}
      />
    </>
  );
}

export default DesktopHeader;
