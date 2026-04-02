import Link from "next/link";
import { footerColumns, footerContact, socialLinks, marketingLinks } from "@/data/fixtures/navigation";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 bg-[rgba(5,5,5,0.92)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 md:flex-row">
        <div className="flex-1 space-y-3">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[rgba(255,255,255,0.6)]">GreenHub NI</p>
          <p className="text-xl font-semibold text-white">Locker collective</p>
          <p className="text-sm text-[rgba(255,255,255,0.75)]">{footerContact.address}</p>
          <div className="text-sm text-[rgba(255,255,255,0.75)]">
            <a href={`mailto:${footerContact.email}`} className="block hover:text-white">
              {footerContact.email}
            </a>
            <a href={`tel:${footerContact.phone}`} className="block hover:text-white">
              {footerContact.phone}
            </a>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 text-[11px] uppercase tracking-[0.3em] text-[rgba(255,255,255,0.6)]">
            {marketingLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-pill border border-white/10 px-3 py-1 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-6 text-sm sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[rgba(255,255,255,0.6)]">
                {column.title}
              </p>
              <div className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-[rgba(255,255,255,0.75)] hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[rgba(255,255,255,0.6)]">Social</p>
            <div className="flex flex-col gap-2">
              {socialLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-[rgba(255,255,255,0.75)] hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-6 text-center text-xs text-[rgba(255,255,255,0.6)]">
        {footerContact.disclaimer}
      </div>
    </footer>
  );
}

export default Footer;
