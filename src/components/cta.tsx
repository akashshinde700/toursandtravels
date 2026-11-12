import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { getContent } from "@/lib/content";
import { waLink } from "@/lib/whatsapp";
import { Reveal } from "./reveal";

export async function Cta({ image }: { image: string }) {
  const { contact: CONTACT } = await getContent();
  return (
    <section id="book" className="relative overflow-hidden py-36 text-white">
      <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-deep/90 via-teal/75 to-bronze/45" />
      <Reveal className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-display text-5xl font-semibold leading-[0.95] md:text-8xl">
          Your seat is <span className="italic">waiting.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/85">One call or message — we'll confirm the car, the driver and the fare in minutes.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a href={`tel:${CONTACT.phone}`} className="flex items-center gap-2 rounded-full bg-white px-7 py-4 font-bold text-deep transition-transform hover:scale-105">
            <Phone className="h-5 w-5" /> {CONTACT.phoneDisplay}
          </a>
          <a href={waLink(CONTACT.whatsapp)} target="_blank" rel="noreferrer" className="glass flex items-center gap-2 rounded-full px-7 py-4 font-bold transition-colors hover:bg-white/25">
            <MessageCircle className="h-5 w-5" /> WhatsApp us
          </a>
          <Link href="/contact" className="rounded-full border border-white/60 px-7 py-4 font-bold transition-colors hover:bg-white hover:text-deep">
            Booking form
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
