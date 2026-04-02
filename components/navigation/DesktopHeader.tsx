"use client";

import { useState } from "react";
import Link from "next/link";
import {
  drawerSections,
  drawerQuickLinks,
  ctaButtons
} from "@/data/fixtures/navigation";
import { MobileDrawer } from "./MobileDrawer";
import { LogoMark } from "./LogoMark";

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white transition hover:border-white/40"
    >
      {children}
    </Link>
  );
}

function IconButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white transition hover:border-white/40"
    >
      {children}
    </button>
  );
}

const iconStroke = "stroke-white";

function AccountIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={iconStroke}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 20c1.5-3 4.5-4.5 8-4.5s6.5 1.5 8 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={iconStroke}>
      <path
        d="M6.5 8.5h11l1 11a1.5 1.5 0 0 1-1.5 1.5h-10a1.5 1.5 0 0 1-1.5-1.5l1-11Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M9 8.5C9 6.567 10.567 5 12.5 5s3.5 1.567 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={iconStroke}>
      <path d="M4 7h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DesktopHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#050505]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center">
            <LogoMark />
          </Link>
          <div className="flex items-center gap-2">
            <IconLink href="/login" label="Account">
              <AccountIcon />
            </IconLink>
            <IconLink href="/checkout" label="Shopping bag">
              <BagIcon />
            </IconLink>
            <IconButton onClick={() => setDrawerOpen(true)} label="Open menu">
              <MenuIcon />
            </IconButton>
          </div>
        </div>
      </header>
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sections={drawerSections}
        quickLinks={drawerQuickLinks}
        ctas={ctaButtons}
      />
    </>
  );
}

export default DesktopHeader;
