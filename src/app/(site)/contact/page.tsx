import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getContent } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import { PageHero } from "@/components/page-hero";
import { Reveal, Eyebrow } from "@/components/reveal";
import { BookingForm } from "@/components/booking-form";

export const metadata: Metadata = { title: "Book a Car" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { contact: CONTACT, pages } = await getContent();
  const q = await searchParams;
  const items = [
    { icon: Phone, label: "Call", value: CONTACT.phoneDisplay, href: `tel:${CONTACT.phone}` },
    { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: waLink(CONTACT.whatsapp) },
    { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { icon: MapPin, label: "Based in", value: CONTACT.city },
  ];

  return (
    <>
      <PageHero
        image={pages.contact.hero}
        eyebrow="Book a car"
        title="Tell us where."
        accent="We'll handle the road."
        text="Share your trip details and we'll confirm the car, the driver and the fare — usually within minutes."
      />
      <section id="contact-details" className="grain bg-ivory py-28">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:px-10 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <Eyebrow>Get in touch</Eyebrow>
            <h2 className="mt-5 font-display text-5xl font-semibold leading-[0.95]">
              Prefer to <span className="italic text-gilded">just talk?</span>
            </h2>
            <ul className="mt-10 space-y-4">
              {items.map((it) => {
                const body = (
                  <>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-royal text-white transition-transform group-hover:scale-110">
                      <it.icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-[0.25em] text-ink-soft">{it.label}</span>
                      <span className="block text-lg font-semibold">{it.value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={it.label}>
                    {it.href ? (
                      <a href={it.href} target={it.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group flex items-center gap-4 rounded-2xl bg-white p-4 transition-shadow hover:shadow-xl">
                        {body}
                      </a>
                    ) : (
                      <div className="group flex items-center gap-4 rounded-2xl bg-white p-4">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>
          <Reveal delay={0.15}>
            <BookingForm car={q.car} from={q.from} to={q.to} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
