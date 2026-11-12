"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, MapPin, Users, Briefcase } from "lucide-react";
import { useContent } from "./content-provider";
import { Eyebrow, Reveal } from "./reveal";
import { Car } from "./car";

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 18 });
  return (
    <motion.div
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FleetShowcase() {
  const { fleet: FLEET } = useContent();
  return (
    <section id="fleet" className="mesh-warm overflow-hidden py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>The fleet</Eyebrow>
            <h2 className="mt-5 max-w-2xl font-display text-5xl font-semibold leading-[0.95] md:text-7xl">
              Real cars. <span className="italic text-gilded">Real comfort.</span>
            </h2>
          </div>
          <Link href="/fleet" className="group flex items-center gap-2 font-bold text-bronze">
            See every car <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {FLEET.map((car, i) => (
            <Reveal key={car.id} delay={i * 0.12}>
              <TiltCard className="group relative overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_60px_-30px_rgba(10,40,38,.35)]">
                <div className="relative h-64 overflow-hidden" style={{ background: `radial-gradient(120% 90% at 50% 100%, ${car.accent}55, transparent 60%), linear-gradient(160deg, #fff8ef, ${car.accent}22)` }}>
                  <div className="absolute inset-x-0 bottom-10 h-px bg-ink/10" />
                  <div className="absolute bottom-6 left-1/2 w-[86%] -translate-x-1/2 transition-transform duration-[1.2s] ease-out-expo group-hover:translate-x-[-38%]">
                    <div className="absolute -bottom-2 left-[6%] right-[6%] h-5 rounded-[50%] bg-ink/40 blur-md" />
                    <Car id={car.cut} alt={car.model} className="spin-on-hover w-full drop-shadow-xl" />
                  </div>
                  <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold backdrop-blur" style={{ color: car.accent }}>
                    Local {car.local}
                  </span>
                </div>
                <div className="p-7">
                  <h3 className="font-display text-3xl font-semibold">{car.name}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{car.tagline}</p>
                  <div className="mt-5 flex gap-5 text-sm font-semibold text-ink-soft">
                    <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {car.seats}</span>
                    <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {car.bags}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-ivory px-4 py-3 text-sm">
                    <span className="text-ink-soft">Outstation</span>
                    <span className="font-display text-lg font-semibold" style={{ color: car.accent }}>{car.perKm} / km</span>
                  </div>
                </div>
                <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100" style={{ background: car.accent }} />
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RoutesTeaser() {
  const { fleet: FLEET, routes: ROUTES } = useContent();
  return (
    <section id="routes" className="relative overflow-hidden bg-deep py-28 text-white md:py-36">
      <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-mint/30 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <Eyebrow light>Pickup & drop</Eyebrow>
          <h2 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[0.95] md:text-7xl">
            The golden triangle of <span className="italic text-gold">Maharashtra.</span>
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {ROUTES.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.1} className="min-w-0">
              <Link href="/routes" className="group block rounded-[2rem] border border-white/15 bg-white/5 p-7 backdrop-blur transition-all duration-500 hover:-translate-y-2 hover:border-gold/60 hover:bg-white/10">
                <div className="flex items-center justify-between gap-2 font-display text-xl sm:text-2xl">
                  <span>{r.from}</span>
                  <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="h-3 w-full min-w-0 flex-1 text-gold">
                    <line x1="0" y1="5" x2="100" y2="5" stroke="currentColor" strokeWidth="2" className="route-dash" />
                  </svg>
                  <span>{r.to}</span>
                </div>
                <div className="mt-2 text-sm text-white/60">{r.km} km · {r.time}</div>
                <div className="mt-6 space-y-2 text-sm">
                  {FLEET.map((c) => (
                    <div key={c.id} className="flex justify-between gap-3 border-t border-white/10 pt-2">
                      <span className="text-white/70">{c.name}</span>
                      <span className="whitespace-nowrap font-bold">{r.prices[c.id]}</span>
                    </div>
                  ))}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DestinationStrip() {
  const { destinations: DESTINATIONS } = useContent();
  const items = [...DESTINATIONS, ...DESTINATIONS];
  return (
    <section id="destinations" className="overflow-hidden bg-sand py-28">
      <Reveal className="mx-auto max-w-7xl px-6 md:px-10">
        <Eyebrow>All over India</Eyebrow>
        <h2 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[0.95] md:text-7xl">
          Name a horizon. <span className="italic text-gilded">We'll drive you there.</span>
        </h2>
      </Reveal>
      <div className="mt-16 flex w-max gap-6 marquee">
        {items.map((d, i) => (
          <Link href="/destinations" key={i} className="group relative h-[420px] w-[320px] shrink-0 overflow-hidden rounded-[2rem]">
            <Image src={d.image} alt={d.title} fill sizes="320px" className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <div className="absolute bottom-0 p-6 text-white">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-gold">
                <MapPin className="h-3.5 w-3.5" /> {d.region}
              </div>
              <div className="mt-2 font-display text-3xl">{d.title}</div>
              <p className="mt-2 max-h-0 overflow-hidden text-sm text-white/80 transition-all duration-500 group-hover:max-h-20">{d.blurb}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
