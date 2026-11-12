"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import { NAV } from "@/lib/data";
import { useContent } from "./content-provider";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { contact: CONTACT } = useContent();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8">
      <nav
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 md:px-6",
          scrolled ? "bg-ivory/80 text-ink shadow-[0_10px_40px_-15px_rgba(10,40,38,.35)] backdrop-blur-xl" : "text-white"
        )}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/images/brand/logo-mark-192.webp" alt="" className="h-12 w-auto drop-shadow-md" />
          <span className="leading-none">
            <span className="block font-display text-lg font-semibold tracking-tight">Aaisaheb</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] opacity-70">Tours & Travels</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 xl:flex">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <li key={n.href}>
                <Link href={n.href} className="group relative block px-3.5 py-2 text-sm font-semibold">
                  {active && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-royal" transition={{ type: "spring", bounce: 0.25, duration: 0.6 }} />
                  )}
                  <span className={cn("relative transition-opacity", active ? "text-white" : "opacity-80 group-hover:opacity-100")}>{n.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <a href={`tel:${CONTACT.phone}`} className="hidden items-center gap-2 rounded-full bg-royal px-5 py-2.5 text-sm whitespace-nowrap font-bold text-white shadow-lg shadow-bronze/30 transition-transform hover:scale-105 md:flex">
            <Phone className="h-4 w-4" /> Call to book
          </a>
          <button onClick={() => setOpen((o) => !o)} className="rounded-full p-2 xl:hidden" aria-label="Menu" aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "circle(0% at 95% 5%)" }}
            animate={{ clipPath: "circle(150% at 95% 5%)" }}
            exit={{ clipPath: "circle(0% at 95% 5%)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 -z-10 flex flex-col justify-center gap-2 bg-royal px-8 xl:hidden"
          >
            {NAV.map((n, i) => (
              <motion.div key={n.href} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                <Link href={n.href} onClick={() => setOpen(false)} className="font-display text-4xl font-semibold text-white">
                  {n.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
