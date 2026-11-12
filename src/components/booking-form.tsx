"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useContent } from "./content-provider";
import { waLink } from "@/lib/whatsapp";

const field =
  "w-full rounded-2xl border border-sand bg-ivory px-5 py-4 font-semibold outline-none transition-all placeholder:font-normal placeholder:text-ink-soft/60 focus:border-bronze focus:bg-white focus:ring-4 focus:ring-bronze/15";

export function BookingForm({ car, from, to }: { car?: string; from?: string; to?: string }) {
  const { contact: CONTACT, fleet: FLEET } = useContent();
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [ref, setRef] = useState("");
  const [waUrl, setWaUrl] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setState("sending");
    setError("");
    const res = await fetch("/api/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).catch(() => null);
    const json = await res?.json().catch(() => null);
    if (!json?.ok) {
      setState("idle");
      setError(json?.error ?? "Couldn't send — please call or WhatsApp us instead.");
      return;
    }
    setRef(json.ref);
    const msg = [
      `New booking request (${json.ref})`,
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `From: ${data.pickupCity}`,
      `To: ${data.destination}`,
      `Date: ${data.date}`,
      `Car: ${data.carType}`,
      data.message && `Note: ${data.message}`,
    ]
      .filter(Boolean)
      .join("\n");
    setWaUrl(waLink(CONTACT.whatsapp, msg));
    setState("done");
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-[0_40px_80px_-40px_rgba(10,40,38,.4)] md:p-12">
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
      <AnimatePresence mode="wait">
        {state === "done" ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative py-16 text-center">
            <CheckCircle2 className="mx-auto h-20 w-20 text-forest" />
            <h3 className="mt-6 font-display text-4xl font-semibold">Request received!</h3>
            <p className="mt-3 text-ink-soft">
              Reference <b className="text-ink">{ref}</b>. Send it to us on WhatsApp for an instant confirmation.
            </p>
            <a href={waUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-7 py-4 font-bold text-white transition-transform hover:scale-105">
              <Send className="h-5 w-5" /> Send on WhatsApp
            </a>
            <br />
            <button onClick={() => setState("idle")} className="mt-8 font-bold text-bronze">Book another trip</button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} exit={{ opacity: 0 }} className="relative grid gap-5 sm:grid-cols-2">
            <h3 className="font-display text-3xl font-semibold sm:col-span-2">Trip details</h3>
            {/* honeypot: hidden from people, bots fill it in and get silently ignored */}
            <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px opacity-0" />
            <input name="name" required placeholder="Your name" autoComplete="name" className={field} />
            <input name="phone" required type="tel" placeholder="Phone number" autoComplete="tel" className={field} />
            <input name="pickupCity" required defaultValue={from} placeholder="Pickup (city / address)" className={field} />
            <input name="destination" required defaultValue={to} placeholder="Destination" className={field} />
            <input name="date" required type="date" className={field} />
            <select name="carType" defaultValue={FLEET.find((c) => c.id === car)?.name ?? FLEET[0].name} className={field}>
              {FLEET.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
            <textarea name="message" rows={4} placeholder="Anything else? (return trip, number of passengers, luggage…)" className={`${field} sm:col-span-2`} />
            {error && <p className="font-semibold text-bronze sm:col-span-2">{error}</p>}
            <button
              disabled={state === "sending"}
              className="group flex items-center justify-center gap-3 rounded-full bg-royal px-8 py-4 text-lg font-bold text-white shadow-xl shadow-bronze/30 transition-transform hover:scale-[1.02] disabled:opacity-70 sm:col-span-2"
            >
              {state === "sending" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
              Send booking request
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
