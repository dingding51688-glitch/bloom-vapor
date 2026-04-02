import Link from "next/link";
import { footerColumns, footerContact, socialLinks } from "@/data/fixtures/navigation";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-night-950/90">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row">
        <div className="flex-1 space-y-3">
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
        <div className="grid flex-1 grid-cols-2 gap-6 text-sm md:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-500">
                {column.title}
              </p>
              <div className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-ink-400 hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-500">Social</p>
            <div className="flex flex-col gap-2">
              {socialLinks.map((social) => (
                <Link key={social.href} href={social.href} className="text-ink-400 hover:text-white">
                  {social.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-6 text-center text-xs text-ink-500">
        {footerContact.disclaimer}
      </div>
    </footer>
  );
}

export default Footer;
