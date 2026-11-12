import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Route as RouteIcon } from "lucide-react";
import { getContent } from "@/lib/content";
import { PageHero } from "@/components/page-hero";
import { Reveal, Eyebrow } from "@/components/reveal";
import { RouteMap } from "@/components/route-map";
import { Cta } from "@/components/cta";

export const metadata: Metadata = { title: "Routes" };

export default async function RoutesPage() {
  const { fleet: FLEET, routes: ROUTES, pages } = await getContent();
  return (
    <>
      <PageHero
        image={pages.routes.hero}
        eyebrow="Pickup & drop"
        title="Mumbai. Pune."
        accent="Nashik. Door to door."
        text="Airport, station or doorstep — we pick you up on time and drive the ghats so you don't have to."
      />

      <section className="grain bg-ivory py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-2 md:px-10">
          <Reveal>
            <Eyebrow>The network</Eyebrow>
            <h2 className="mt-5 font-display text-5xl font-semibold md:text-6xl">
              Three cities, <span className="italic text-gilded">one trusted driver.</span>
            </h2>
            <p className="mt-6 text-lg text-ink-soft">
              Our most-travelled corridors run through the Sahyadri — Kasara Ghat between Mumbai and Nashik, and the Sangamner highway to Pune.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <RouteMap />
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory pb-28">
        <div className="mx-auto max-w-7xl space-y-10 px-6 md:px-10">
          {ROUTES.map((r, i) => (
            <Reveal key={r.id} delay={0.05}>
              <article id={r.id} className="group grid overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_60px_-30px_rgba(10,40,38,.3)] md:grid-cols-[1.1fr_1fr]">
                <div className={`relative min-h-[300px] overflow-hidden ${i % 2 ? "md:order-2" : ""}`}>
                  <Image src={r.image} alt={`${r.from} to ${r.to}`} fill sizes="50vw" className="object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                  <div className="absolute bottom-6 left-6 font-display text-4xl text-white md:text-5xl">
                    {r.from} <span className="italic text-gold">→</span> {r.to}
                  </div>
                </div>
                <div className="p-8 md:p-12">
                  <div className="flex flex-wrap gap-5 text-sm font-semibold text-ink-soft">
                    <span className="flex items-center gap-2"><RouteIcon className="h-4 w-4 text-bronze" /> {r.km} km</span>
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-bronze" /> {r.time}</span>
                    <span>{r.via}</span>
                  </div>
                  <div className="mt-8 space-y-4">
                    {FLEET.map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-2xl bg-ivory px-5 py-4 transition-colors hover:bg-gold/15">
                        <span className="font-semibold">{c.name}</span>
                        <span className="whitespace-nowrap font-display text-lg font-semibold sm:text-2xl" style={{ color: c.accent }}>{r.prices[c.id]}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={`/contact?from=${r.from}&to=${r.to}`} className="group/b mt-8 inline-flex items-center gap-3 rounded-full bg-royal px-7 py-4 font-bold text-white">
                    Book this route <ArrowRight className="h-5 w-5 transition-transform group-hover/b:translate-x-1" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <Cta image={pages.routes.cta} />
    </>
  );
}
