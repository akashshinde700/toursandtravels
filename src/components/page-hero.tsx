"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Eyebrow } from "./reveal";

// Inner-page hero: full-bleed photo that you "drive into" as you scroll.
export function PageHero({ image, eyebrow, title, accent, text }: { image: string; eyebrow: string; title: string; accent: string; text: string }) {
  const ref = useRef<HTMLElement>(null);
  const scrollYProgress = useTransform(useScroll({ target: ref, offset: ["start start", "end start"] }).scrollYProgress, (v) => v); // see journey.tsx
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative flex h-[88svh] min-h-[560px] items-end overflow-hidden">
      <motion.div style={{ scale }} className="absolute inset-0">
        <Image src={image} alt="" fill priority sizes="100vw" className="kenburns object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/10" />
      <motion.div style={{ y, opacity: fade }} className="relative mx-auto w-full max-w-7xl px-6 pb-20 md:px-10">
        <Eyebrow light>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-[0.95] text-white md:text-8xl">
          {title.split(" ").map((w, i) => (
            <span key={i} className="-my-[0.2em] inline-block overflow-hidden py-[0.2em] align-bottom">
              <motion.span className="inline-block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.5 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}>
                {w}&nbsp;
              </motion.span>
            </span>
          ))}
          <motion.span className="block italic text-gilded" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.9 }}>
            {accent}
          </motion.span>
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-6 max-w-xl text-lg text-white/80">
          {text}
        </motion.p>
      </motion.div>
    </section>
  );
}
