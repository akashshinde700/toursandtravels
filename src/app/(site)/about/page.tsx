import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, Clock, Sparkles, HeartHandshake } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Reveal, Eyebrow } from "@/components/reveal";
import { Cta } from "@/components/cta";
import { getContent } from "@/lib/content";

export const metadata: Metadata = { title: "About" };

const VALUES = [
  { icon: Clock, title: "On time, every time", text: "Your driver is at the door before you are." },
  { icon: ShieldCheck, title: "Safe hands", text: "Experienced drivers who know the ghats and the highways." },
  { icon: Sparkles, title: "Spotless cars", text: "Cleaned and checked before every single trip." },
  { icon: HeartHandshake, title: "Fair fares", text: "Clear prices up front — confirmed before you travel." },
];

export default async function AboutPage() {
  const { pages } = await getContent();
  return (
    <>
      <PageHero
        image={pages.about.hero}
        eyebrow="Our story"
        title="Travel with"
        accent="a mother's care."
        text="Aaisaheb Tours & Travels is a Nashik cab service that treats every passenger like family."
      />
      <section className="grain bg-ivory py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-2 md:px-10">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl">
              <Image src={pages.about.photo} alt="Aaisaheb Tours & Travels" fill sizes="50vw" className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <Eyebrow>Why Aaisaheb</Eyebrow>
            <h2 className="mt-5 font-display text-5xl font-semibold leading-[0.95] md:text-6xl">
              The road is long. <span className="italic text-gilded">The ride shouldn't feel it.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              "Aai" means mother in Marathi — and that's the care we promise. Whether it's an early-morning airport drop in Mumbai, a family
              darshan at Trimbakeshwar, or a fortnight across Rajasthan, we bring the same clean car, the same patient driver and the same honest fare.
            </p>
          </Reveal>
        </div>
      </section>
      <section className="bg-sand py-28">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.1}>
              <div className="group h-full rounded-[2rem] bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-bronze/20">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-royal text-white transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
                  <v.icon className="h-7 w-7" />
                </span>
                <h3 className="mt-6 font-display text-2xl font-semibold">{v.title}</h3>
                <p className="mt-2 text-ink-soft">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <Cta image={pages.about.cta} />
    </>
  );
}
