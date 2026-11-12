import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Users, Briefcase, ArrowRight } from "lucide-react";
import { getContent } from "@/lib/content";
import { PageHero } from "@/components/page-hero";
import { Reveal, Eyebrow } from "@/components/reveal";
import { Cta } from "@/components/cta";
import { Car } from "@/components/car";

export const metadata: Metadata = { title: "Our Fleet" };

export default async function FleetPage() {
  const { fleet: FLEET, routes: ROUTES, pages } = await getContent();
  return (
    <>
      <PageHero
        image={pages.fleet.hero}
        eyebrow="The fleet"
        title="Three cars, every"
        accent="kind of journey."
        text="From a quick temple run in Nashik to a two-week Himalayan expedition — pick the car that fits your people and your road."
      />
      <div className="grain bg-ivory">
        {FLEET.map((car, i) => (
          <section key={car.id} id={`car-${car.id}`} className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2 md:gap-20 md:px-10 md:py-32">
            <Reveal className={i % 2 ? "md:order-2" : ""}>
              <div className="group relative">
                <div className="absolute -inset-4 rounded-[2.5rem] opacity-30 blur-2xl transition-opacity duration-700 group-hover:opacity-60" style={{ background: car.accent }} />
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-2xl" style={{ background: `radial-gradient(110% 80% at 50% 100%, ${car.accent}66, transparent 60%), linear-gradient(170deg, #fff8ef 0%, ${car.accent}26 100%)` }}>
                  <div className="absolute inset-x-0 bottom-[16%] h-[18%] bg-[#2b2d33]" />
                  <div className="absolute inset-x-0 bottom-[24%] h-[3px] bg-[linear-gradient(90deg,#fff_0_40px,transparent_40px_90px)] [background-size:90px_100%] opacity-80 transition-[background-position] duration-[1.4s] group-hover:[background-position:-270px_0]" />
                  <div className="absolute bottom-[20%] left-1/2 w-[82%] -translate-x-1/2 transition-transform duration-[1.4s] ease-out-expo group-hover:translate-x-[-42%]">
                    <div className="absolute -bottom-1 left-[6%] right-[6%] h-6 rounded-[50%] bg-black/50 blur-md" />
                    <Car id={car.cut} alt={car.model} className="spin-on-hover w-full drop-shadow-2xl" />
                  </div>
                  <span className="absolute left-5 top-5 hidden rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-ink backdrop-blur [@media(hover:hover)]:block">Hover to drive</span>
                </div>
                {car.images[0] && (
                  <div className="absolute -bottom-10 -right-4 aspect-[4/3] w-2/5 overflow-hidden rounded-2xl border-4 border-ivory shadow-xl transition-transform duration-700 group-hover:-translate-y-3 md:-right-10">
                    <Image src={car.images[0]} alt={car.model} fill sizes="20vw" className="object-cover" />
                  </div>
                )}
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <Eyebrow>0{i + 1} · {car.model}</Eyebrow>
              <h2 className="mt-4 font-display text-5xl font-semibold md:text-6xl">{car.name}</h2>
              <p className="mt-2 font-display text-2xl italic" style={{ color: car.accent }}>{car.tagline}</p>
              <p className="mt-6 text-lg leading-relaxed text-ink-soft">{car.description}</p>
              <div className="mt-6 flex gap-6 font-semibold">
                <span className="flex items-center gap-2"><Users className="h-5 w-5" /> {car.seats}</span>
                <span className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> {car.bags}</span>
              </div>
              <ul className="mt-6 grid grid-cols-2 gap-3">
                {car.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm font-semibold">
                    <span className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: car.accent }}><Check className="h-3.5 w-3.5" /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-3xl bg-white p-6 shadow-[0_20px_50px_-25px_rgba(10,40,38,.3)]">
                <div className="flex items-baseline justify-between border-b border-sand pb-3">
                  <span className="font-semibold">Nashik local / day</span>
                  <span className="font-display text-2xl font-semibold">{car.local}</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-sand py-3">
                  <span className="font-semibold">Outstation / km</span>
                  <span className="font-display text-2xl font-semibold" style={{ color: car.accent }}>{car.perKm}</span>
                </div>
                {ROUTES.map((r) => (
                  <div key={r.id} className="flex justify-between pt-3 text-sm">
                    <span className="text-ink-soft">{r.from} → {r.to}</span>
                    <span className="font-bold">{r.prices[car.id]}</span>
                  </div>
                ))}
              </div>
              <Link href={`/contact?car=${car.id}`} className="group mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 font-bold text-white transition-colors hover:bg-bronze">
                Book the {car.name} <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </section>
        ))}
      </div>
      <Cta image={pages.fleet.cta} />
    </>
  );
}
