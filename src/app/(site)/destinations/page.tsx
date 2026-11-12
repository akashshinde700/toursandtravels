import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { getContent } from "@/lib/content";
import { PageHero } from "@/components/page-hero";
import { Reveal, Eyebrow } from "@/components/reveal";
import { Cta } from "@/components/cta";

export const metadata: Metadata = { title: "Destinations" };

// Bento sizes, repeating
const SPAN = ["md:col-span-2 md:row-span-2", "", "", "md:row-span-2", "", "md:col-span-2", "", ""];

export default async function DestinationsPage() {
  const { destinations: DESTINATIONS, pages } = await getContent();
  return (
    <>
      <PageHero
        image={pages.destinations.hero}
        eyebrow="All over India"
        title="From the Himalaya"
        accent="to the backwaters."
        text="Multi-day road trips across India in a car that's yours for the whole journey — with a driver who knows the way."
      />
      <section id="destinations" className="grain bg-ivory py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <Reveal>
            <Eyebrow>Where shall we go?</Eyebrow>
            <h2 className="mt-5 max-w-3xl font-display text-5xl font-semibold md:text-7xl">
              Postcards you can <span className="italic text-gilded">drive into.</span>
            </h2>
          </Reveal>
          <div className="mt-16 grid auto-rows-[280px] gap-5 md:grid-cols-4">
            {DESTINATIONS.map((d, i) => (
              <Reveal key={d.title} delay={(i % 4) * 0.08} className={SPAN[i % SPAN.length]}>
                <Link href={`/contact?to=${encodeURIComponent(d.title)}`} className="group relative block h-full overflow-hidden rounded-[2rem]">
                  <Image src={d.image} alt={d.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-110 group-hover:rotate-1" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent transition-opacity duration-500 group-hover:from-wine/80" />
                  <span className="absolute right-5 top-5 grid h-11 w-11 scale-0 place-items-center rounded-full bg-white text-wine transition-transform duration-500 group-hover:scale-100">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                  <div className="absolute bottom-0 p-6 text-white">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-gold">
                      <MapPin className="h-3.5 w-3.5" /> {d.region}
                    </div>
                    <div className="mt-2 font-display text-3xl md:text-4xl">{d.title}</div>
                    <p className="mt-1 max-w-sm translate-y-3 text-sm text-white/85 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">{d.blurb}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <Cta image={pages.destinations.cta} />
    </>
  );
}
