import Link from "next/link";
import { CREDITS, NAV } from "@/lib/data";
import { getContent } from "@/lib/content";

export async function Footer() {
  const { contact: CONTACT } = await getContent();
  return (
    <footer id="footer" className="bg-ink text-white/80">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1.5fr_1fr_1fr] md:px-10">
        <div>
          {/* the logo's dark-green lettering needs a light card on the dark footer */}
          <div className="inline-block rounded-3xl bg-[#f6efe3] p-4 shadow-xl">
            <img src="/images/brand/logo-full.webp" alt="Aaisaheb Tours and Travels — The world. Without limits." className="h-44 w-auto" />
          </div>
          <p className="mt-6 max-w-sm">Premium cabs from Nashik — local, intercity and all-India road trips with experienced drivers.</p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Explore</div>
          <ul className="mt-4 space-y-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="transition-colors hover:text-gold">{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-gold">Reach us</div>
          <ul className="mt-4 space-y-2">
            <li><a href={`tel:${CONTACT.phone}`} className="hover:text-gold">{CONTACT.phoneDisplay}</a></li>
            <li><a href={`mailto:${CONTACT.email}`} className="hover:text-gold">{CONTACT.email}</a></li>
            <li>{CONTACT.city}</li>
          </ul>
        </div>
      </div>
      <details className="mx-auto max-w-7xl px-6 pb-4 text-xs text-white/40 md:px-10">
        <summary className="cursor-pointer">Photo credits</summary>
        <p className="mt-2">Landscape photography via Unsplash. Car photos via Wikimedia Commons:</p>
        <p className="mt-2 leading-relaxed">{CREDITS.map(([what, who, lic]) => `${what} — ${who} (${lic})`).join(" · ")}</p>
      </details>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">© {new Date().getFullYear()} Aaisaheb Tours & Travels</div>
    </footer>
  );
}
