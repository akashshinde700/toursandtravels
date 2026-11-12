import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { PageHero } from "@/components/page-hero";
import { Reveal, Eyebrow } from "@/components/reveal";
import { Cta } from "@/components/cta";

export const metadata: Metadata = { title: "Tariff" };

export default async function TariffsPage() {
  const { fleet: FLEET, routes: ROUTES, pages } = await getContent();
  return (
    <>
      <PageHero
        image={pages.tariffs.hero}
        eyebrow="Tariff"
        title="Honest fares,"
        accent="no surprises."
        text="Local packages within Nashik, per-km rates for outstation trips, and fixed pickup & drop fares between Mumbai, Pune and Nashik."
      />

      <section id="local" className="grain bg-ivory py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <Reveal>
            <Eyebrow>Nashik local · within the city · per day</Eyebrow>
            <h2 className="mt-5 font-display text-5xl font-semibold md:text-7xl">Choose your ride.</h2>
            <p className="mt-4 max-w-2xl text-lg text-ink-soft">For travel around Nashik — Trimbakeshwar, Panchavati, Sula, temples, shopping and errands — with the car and driver for the day.</p>
          </Reveal>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {FLEET.map((car, i) => {
              const featured = car.id === "innova";
              return (
                <Reveal key={car.id} delay={i * 0.12}>
                  <div
                    className={`group relative h-full overflow-hidden rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-3 ${
                      featured ? "bg-royal text-white shadow-2xl shadow-bronze/40" : "bg-white shadow-[0_30px_60px_-30px_rgba(10,40,38,.3)]"
                    }`}
                  >
                    {featured && <span className="absolute right-6 top-6 rounded-full bg-white/25 px-3 py-1 text-xs font-bold backdrop-blur">Most popular</span>}
                    <div className="relative -mx-8 -mt-8 mb-8 h-48 overflow-hidden">
                      <Image src={car.images[0]} alt={car.model} fill sizes="33vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
                    </div>
                    <h3 className="font-display text-3xl font-semibold">{car.name}</h3>
                    <p className={featured ? "text-white/80" : "text-ink-soft"}>{car.seats} · {car.bags}</p>
                    <div className="mt-6 font-display text-5xl font-semibold">{car.local}</div>
                    <div className={`text-sm ${featured ? "text-white/80" : "text-ink-soft"}`}>per day · within Nashik</div>
                    <div className={`mt-5 flex items-center justify-between rounded-2xl px-4 py-3 text-sm ${featured ? "bg-white/15" : "bg-ivory"}`}>
                      <span className={featured ? "text-white/80" : "text-ink-soft"}>Outstation</span>
                      <span className="font-display text-lg font-semibold">{car.perKm} / km</span>
                    </div>
                    <Link
                      href={`/contact?car=${car.id}`}
                      className={`mt-8 block rounded-full py-3.5 text-center font-bold transition-transform hover:scale-[1.03] ${featured ? "bg-white text-wine" : "bg-ink text-white"}`}
                    >
                      Book now
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="per-km" className="bg-deep relative overflow-hidden py-28 text-white">
        <div className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-gold/20 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <Reveal>
            <Eyebrow light>Outstation & all-India · per km</Eyebrow>
            <h2 className="mt-5 font-display text-5xl font-semibold md:text-7xl">
              Going further? <span className="italic text-gilded">Pay by the km.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-white/75">For trips outside Nashik — weekend getaways, pilgrimages and road trips anywhere in India.</p>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {FLEET.map((car, i) => (
              <Reveal key={car.id} delay={i * 0.1}>
                <div className="rounded-[2rem] border border-white/15 bg-white/5 p-8 backdrop-blur transition-all duration-500 hover:-translate-y-2 hover:border-gold/60">
                  <div className="text-sm font-bold uppercase tracking-[0.25em] text-gold">{car.name}</div>
                  <div className="mt-4 whitespace-nowrap font-display text-5xl font-semibold sm:text-6xl">
                    {car.perKm}
                    <span className="ml-1 text-2xl text-white/70">/ km</span>
                  </div>
                  <div className="mt-2 text-sm text-white/70">{car.seats} · {car.bags}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-sm text-white/60">Final fare confirmed when you book.</p>
        </div>
      </section>

      <section id="fare-chart" className="bg-sand py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <Reveal>
            <Eyebrow>Pickup & drop · one way</Eyebrow>
            <h2 className="mt-5 font-display text-5xl font-semibold md:text-7xl">Intercity fare chart.</h2>
          </Reveal>
          {/* phones: one card per route */}
          <div className="mt-12 space-y-5 md:hidden">
            {ROUTES.map((r) => (
              <Reveal key={r.id}>
                <div className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_-25px_rgba(10,40,38,.3)]">
                  <div className="font-display text-2xl font-semibold">{r.from} → {r.to}</div>
                  <div className="text-sm text-ink-soft">{r.km} km · {r.time}</div>
                  <div className="mt-4 space-y-2">
                    {FLEET.map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-2xl bg-ivory px-4 py-3">
                        <span className="text-sm font-semibold">{c.name}</span>
                        <span className="font-display text-lg font-semibold" style={{ color: c.accent }}>{r.prices[c.id]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1} className="mt-12 hidden overflow-x-auto rounded-[2rem] bg-white shadow-[0_30px_60px_-30px_rgba(10,40,38,.3)] md:block">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="bg-ink text-white">
                  <th className="px-8 py-5 font-display text-lg font-medium">Route</th>
                  {FLEET.map((c) => (
                    <th key={c.id} className="px-8 py-5 font-display text-lg font-medium">{c.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROUTES.map((r) => (
                  <tr key={r.id} className="border-t border-sand transition-colors hover:bg-gold/10">
                    <td className="px-8 py-6">
                      <div className="font-bold">{r.from} → {r.to}</div>
                      <div className="text-sm text-ink-soft">{r.km} km · {r.time}</div>
                    </td>
                    {FLEET.map((c) => (
                      <td key={c.id} className="px-8 py-6 font-display text-xl font-semibold">{r.prices[c.id]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
          <p className="mt-6 text-sm text-ink-soft">Fares are indicative ranges. Your exact fare is confirmed when you book.</p>
        </div>
      </section>
      <Cta image={pages.tariffs.cta} />
    </>
  );
}
