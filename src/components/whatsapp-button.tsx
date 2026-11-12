"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useContent } from "./content-provider";
import { waLink } from "@/lib/whatsapp";

// Floating WhatsApp chat button on every page. A small card asks what they need, then opens WhatsApp
// with that message already typed to the business number (set in /admin → Contact).
const QUICK = ["I want to book a car", "Nashik local package", "Mumbai / Pune pickup & drop", "All-India tour"];

export function WhatsAppButton() {
  const { contact } = useContent();
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHint(true), 6000); // gentle nudge once, after they've looked around
    const h = setTimeout(() => setHint(false), 14000);
    return () => {
      clearTimeout(t);
      clearTimeout(h);
    };
  }, []);

  const link = (text: string) => waLink(contact.whatsapp, `Hi Aaisaheb Tours & Travels! ${text}.`);

  return (
    <div className="fixed bottom-5 right-5 z-[65] flex flex-col items-end gap-3 md:bottom-8 md:right-8">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-[min(88vw,320px)] origin-bottom-right overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-center gap-3 bg-[#075e54] px-5 py-4 text-white">
              <img src="/images/brand/logo-mark-192.webp" alt="" className="h-10 w-auto rounded-full bg-white/90 p-0.5" />
              <div className="mr-auto">
                <div className="font-bold">Aaisaheb Tours & Travels</div>
                <div className="text-xs text-white/80">Usually replies within minutes</div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1 hover:bg-white/15">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2 bg-[#ece5dd] p-4">
              <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-ink shadow-sm">Namaste! 🙏 How can we help you with your trip?</div>
              {QUICK.map((q) => (
                <a key={q} href={link(q)} target="_blank" rel="noreferrer" className="block rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#075e54] shadow-sm transition hover:bg-[#dcf8c6]">
                  {q} →
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hint && !open && (
          <motion.button
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-ink shadow-xl"
          >
            Chat with us on WhatsApp
          </motion.button>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat on WhatsApp"
        className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_10px_30px_-5px_rgba(37,211,102,.6)] transition-transform hover:scale-110"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25d366] opacity-30" />
        <svg viewBox="0 0 32 32" className="relative h-8 w-8" fill="currentColor" aria-hidden>
          <path d="M16.04 3C8.86 3 3.02 8.82 3.02 15.98c0 2.29.6 4.52 1.75 6.49L3 29l6.72-1.76a13 13 0 0 0 6.31 1.61h.01c7.17 0 13.01-5.82 13.02-12.98A12.9 12.9 0 0 0 16.04 3Zm0 23.66h-.01a10.8 10.8 0 0 1-5.5-1.5l-.4-.24-3.99 1.04 1.07-3.88-.26-.4a10.7 10.7 0 0 1-1.66-5.7c0-5.95 4.86-10.8 10.84-10.8a10.79 10.79 0 0 1 10.82 10.82c0 5.95-4.86 10.8-10.9 10.8Zm5.94-8.08c-.33-.16-1.93-.95-2.23-1.06-.3-.11-.52-.16-.73.16-.22.33-.84 1.06-1.03 1.27-.19.22-.38.24-.71.08-.33-.16-1.38-.51-2.63-1.62-.97-.87-1.62-1.93-1.81-2.26-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.33.33-.54.11-.22.05-.41-.03-.57-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.55-.73-.56h-.62c-.22 0-.57.08-.87.41-.3.33-1.14 1.11-1.14 2.71 0 1.6 1.17 3.14 1.33 3.36.16.22 2.3 3.5 5.57 4.91.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.93-.79 2.2-1.55.27-.76.27-1.41.19-1.55-.08-.13-.3-.21-.62-.37Z" />
        </svg>
      </button>
    </div>
  );
}
