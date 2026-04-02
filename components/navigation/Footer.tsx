import Link from "next/link";
import { footerColumns, footerContact } from "@/data/fixtures/navigation";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-night-950/90">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-500">GreenHub NI</p>
          <p className="text-lg font-semibold text-white">Locker collective</p>
          <p className="text-sm text-ink-400">{footerContact.address}</p>
          <div className="text-sm text-ink-400">
            <a href={`mailto:${footerContact.email}`} className="block hover:text-white">
              {footerContact.email}
            </a>
            <a href={`tel:${footerContact.phone}`} className="block hover:text-white">
              {footerContact.phone}
            </a>
          </div>
        </div>
        {footerColumns.map((column) => (
          <div key={column.title} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-500">
              {column.title}
            </p>
            <div className="flex flex-col gap-2 text-sm">
              {column.links.map((link) => (
                <Link key={link.href} href={link.href} className="text-ink-400 hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 px-4 py-6 text-center text-xs text-ink-500">
        {footerContact.disclaimer}
      </div>
    </footer>
  );
}

export default Footer;
