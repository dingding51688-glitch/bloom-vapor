"use client";

import clsx from "clsx";
import type { NavItem } from "@/data/fixtures/navigation";
import { NavLink } from "./NavLink";
import { Button } from "@/components/ui";

export type DrawerSection = {
  title: string;
  links: NavItem[];
};

export type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  sections: DrawerSection[];
  ctas: { primary: NavItem; secondary: NavItem };
};

export function MobileDrawer({ open, onClose, sections, ctas }: MobileDrawerProps) {
  return (
    <div
      className={clsx(
        "fixed inset-0 z-40 transition duration-300",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <div
        className={clsx(
          "absolute inset-0 bg-black/50 transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={clsx(
          "absolute inset-y-0 right-0 flex w-80 max-w-full flex-col gap-6 border-l border-white/10 bg-night-950 p-6 shadow-surface transition-transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Menu</p>
          <button
            className="rounded-full border border-white/10 p-2 text-white"
            onClick={onClose}
            aria-label="Close menu"
          >
            <span className="inline-block text-lg leading-none">×</span>
          </button>
        </div>
        <div className="flex flex-col gap-6 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-500">
                {section.title}
              </p>
              <div className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <NavLink
                    key={link.href}
                    {...link}
                    variant="drawer"
                    onClick={onClose}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto space-y-3">
          <Button asChild fullWidth>
            <a href={ctas.primary.href} onClick={onClose}>
              {ctas.primary.label}
            </a>
          </Button>
          <Button variant="secondary" asChild fullWidth>
            <a href={ctas.secondary.href} onClick={onClose}>
              {ctas.secondary.label}
            </a>
          </Button>
        </div>
      </aside>
    </div>
  );
}

export default MobileDrawer;
