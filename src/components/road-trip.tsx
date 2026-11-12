"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame, useMotionValueEvent, useScroll, useTransform, useVelocity, type MotionValue } from "framer-motion";
import { ArrowRight, CarFront } from "lucide-react";
import { DEFAULT_CONTENT } from "@/lib/data";
import { useContent } from "./content-provider";
import { Car } from "./car";

const N = DEFAULT_CONTENT.journey.length; // fixed: the admin edits stop text, not the number of stops
// Real body lengths (m) so the cars visibly grow: Swift 3.85 → Innova Crysta 4.73.
const LENGTH = { swift: 3.85, city: 4.55, ertiga: 4.4, "innova-crysta": 4.73 } as const;
const EASE = [0.16, 1, 0.3, 1] as const;

// Side-view road trip. Scroll moves you through five stops; scroll speed is the car's speed.
export function RoadTrip() {
  const { journey: JOURNEY, fleet } = useContent();
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const lane = useRef<HTMLDivElement>(null);
  const posts = useRef<HTMLDivElement>(null);
  const stone = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const wind = useRef<HTMLDivElement>(null);
  const needle = useRef<SVGGElement>(null);
  const speedTxt = useRef<HTMLSpanElement>(null);
  const odoTxt = useRef<HTMLSpanElement>(null);

  const { scrollYProgress, scrollY } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // JS transform: opts out of framer's native scroll-timeline path, which didn't clamp ranges.
  const p = useTransform(scrollYProgress, (v) => v);
  const velocity = useVelocity(scrollY);
  const km = useTransform(p, JOURNEY.map((_, i) => i / (N - 1)), JOURNEY.map((j) => j.km));

  const [idx, setIdx] = useState(0);
  useMotionValueEvent(p, "change", (v) => setIdx(Math.min(N - 1, Math.floor(v * N))));
  const stop = JOURNEY[idx];
  const car = fleet.find((f) => f.cut === stop.car);
  const price = car && `${car.local} / day · ${car.perKm} / km`;

  const sim = useRef({ speed: 0, dist: 0 });
  useAnimationFrame((t, delta) => {
    const s = sim.current;
    const dt = Math.min(delta, 50) / 1000;
    const target = 46 + Math.min(Math.abs(velocity.get()) / 9, 134); // cruise when idle, faster as you scroll
    s.speed += (target - s.speed) * Math.min(1, dt * 2.2);
    s.dist += s.speed * 16 * dt; // px travelled
    const W = window.innerWidth;

    // ~1 turn/s at cruise: slow enough per frame (≈6°) that spokes never strobe backwards
    stage.current?.style.setProperty("--spin", `${(s.dist * 0.5) % 360}deg`);
    stage.current?.style.setProperty("--wheel-blur", String(Math.min(0.75, Math.max(0, (s.speed - 70) / 80))));
    if (lane.current) lane.current.style.backgroundPositionX = `${-(s.dist % 260)}px`;
    if (posts.current) {
      const x = -((s.dist * 0.8) % 340);
      posts.current.style.backgroundPositionX = `${x}px, ${x}px`;
    }
    if (stone.current) {
      const loop = W * 1.7 + 300;
      stone.current.style.transform = `translateX(${W + 120 - ((s.dist * 0.8) % loop)}px)`;
    }
    if (body.current) {
      const k = s.speed / 100;
      body.current.style.transform = `translateY(${(Math.sin(t / 95) * 0.8 + Math.sin(t / 41) * 0.6) * k}px) rotate(${Math.sin(t / 160) * 0.12 * k}deg)`;
    }
    if (wind.current) wind.current.style.opacity = String(Math.max(0, Math.min(1, (s.speed - 70) / 80)));
    if (needle.current) needle.current.setAttribute("transform", `rotate(${-120 + (s.speed / 180) * 240} 60 60)`);
    if (speedTxt.current) speedTxt.current.textContent = String(Math.round(s.speed));
    if (odoTxt.current) odoTxt.current.textContent = Math.round(km.get() + s.dist / 6000).toLocaleString("en-IN");
  });

  return (
    <section ref={ref} style={{ height: `${N * 100 + 60}vh` }} className="relative bg-ink">
      <div ref={stage} className="sticky top-0 h-svh overflow-hidden" style={{ ["--accent" as string]: stop.accent }}>
        {/* Landscapes */}
        {JOURNEY.map((j, i) => (
          <Scene key={j.place} i={i} p={p} active={i === idx} image={j.image} grade={j.grade} />
        ))}

        {/* Giant place name */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={stop.place}
            initial={{ opacity: 0, x: 120 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -200 }}
            transition={{ duration: 1.2, ease: EASE }}
            // scale to word length so long names (SAHYADRI) still fit the screen
            style={{ fontSize: `min(22vw, ${112 / stop.place.length}vw)` }}
            className="pointer-events-none absolute inset-x-0 top-[22%] hidden select-none xl:block whitespace-nowrap text-center font-display font-semibold leading-none tracking-tight text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,.4)] md:top-[14%]"
          >
            {stop.place.toUpperCase()}
          </motion.div>
        </AnimatePresence>

        {/* Road */}
        <div className="absolute inset-x-0 bottom-0 h-[19vh]">
          {/* far shoulder: reflector posts + highway milestone */}
          <div ref={posts} className="absolute inset-x-0 -top-[34px] h-[40px] opacity-85" style={{ backgroundImage: "linear-gradient(90deg,#e8333a 0 6px,transparent 6px), linear-gradient(90deg,#fafafa 0 6px,transparent 6px)", backgroundSize: "340px 7px, 340px 100%", backgroundPositionY: "6px, 0", backgroundRepeat: "repeat-x" }} />
          <div ref={stone} className="absolute -top-[66px] left-0 w-[58px]">
            <div className="h-[30px] rounded-t-full bg-[#f6c21c] shadow-inner" />
            <div className="flex h-[42px] flex-col items-center justify-center bg-white text-center text-[8px] font-extrabold leading-tight text-ink shadow-[0_6px_14px_rgba(0,0,0,.35)]">
              {stop.milestone.split(" ").map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#8a7a63_0,#8a7a63_10px,#f2f2f2_10px,#f2f2f2_14px,#3b3e46_14px,#2b2d33_70%,#24262b_100%)]" />
          <div className="grain absolute inset-0" />
          <div ref={lane} className="absolute inset-x-0 top-[34%] h-[7px] blur-[0.6px] [background-image:linear-gradient(90deg,#f4f4f4_0_110px,transparent_110px_260px)] [background-size:260px_100%]" />
          <div className="absolute inset-x-0 bottom-[8%] h-[5px] bg-white/80" />
        </div>

        {/* Wind streaks at speed */}
        <div ref={wind} className="pointer-events-none absolute inset-x-0 bottom-[15vh] h-[18vh] opacity-0">
          {[12, 30, 46, 63, 80].map((top, i) => (
            <span key={top} className="lane-x absolute h-px w-[30vw] bg-gradient-to-r from-transparent via-white/70 to-transparent" style={{ top: `${top}%`, animationDelay: `${i * 0.17}s` }} />
          ))}
        </div>

        {/* The car */}
        <div className="absolute bottom-[5.6vh] left-1/2 w-[80vw] -translate-x-1/2 md:left-[58%] md:w-[min(58vw,640px)] lg:left-[60%] lg:w-[min(40vw,640px)]">
          <div ref={body} className="relative">
            <AnimatePresence initial={false}>
              <motion.div
                key={stop.car}
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
                style={{ width: `${(LENGTH[stop.car] / 4.73) * 100}%` }}
                initial={{ opacity: 0, x: -60, scale: 0.94, filter: "blur(12px) brightness(3)" }}
                animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px) brightness(1)" }}
                exit={{ opacity: 0, x: 90, filter: "blur(10px) brightness(2.5)" }}
                transition={{ duration: 1, ease: EASE }}
              >
                <div className="absolute -bottom-[4%] left-[4%] right-[4%] h-[14%] rounded-[50%] bg-black/60 blur-[10px]" />
                <Car id={stop.car} alt={stop.carLabel} className="w-full drop-shadow-[0_18px_25px_rgba(0,0,0,.35)]" />
              </motion.div>
            </AnimatePresence>
            {/* light sweep when the car transforms */}
            <motion.div
              key={`sweep-${idx}`}
              initial={{ x: "-60%", opacity: 0 }}
              animate={{ x: "400%", opacity: [0, 0.9, 0] }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
              className="pointer-events-none absolute bottom-0 left-0 h-[min(34vh,320px)] w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-md"
            />
          </div>
        </div>

        {/* Copy */}
        <div className="relative z-10 mx-auto h-full max-w-7xl px-6 pt-28 md:px-10 md:pt-36">
          <AnimatePresence mode="wait">
            <motion.div key={idx} exit={{ opacity: 0, y: -30, transition: { duration: 0.35 } }} className="max-w-2xl text-white">
              <Rise d={0}>
                <span className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.35em]" style={{ color: stop.accent }}>
                  <span className="h-px w-10 bg-current" />
                  {idx === 0 ? "Nashik · Mumbai · Pune · All India" : `Stop 0${idx + 1} · ${stop.region}`}
                </span>
              </Rise>
              {idx === 0 ? (
                <>
                  <Rise d={0.08}>
                    <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.92] tracking-tight drop-shadow-lg md:text-8xl">
                      Drive into the soul of <span className="italic text-gilded">India.</span>
                    </h1>
                  </Rise>
                  <Rise d={0.2}>
                    <div className="mt-8 flex flex-wrap gap-4">
                      <Link href="/contact" className="group flex items-center gap-3 rounded-full bg-royal px-7 py-4 font-bold shadow-xl shadow-bronze/40 transition-transform hover:scale-105">
                        Plan my trip <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                      <Link href="/fleet" className="glass rounded-full px-7 py-4 font-bold transition-colors hover:bg-white/25">
                        Explore the fleet
                      </Link>
                    </div>
                  </Rise>
                </>
              ) : (
                <>
                  <Rise d={0.08}>
                    <h2 className="mt-4 font-display text-6xl font-semibold leading-[0.9] drop-shadow-lg md:text-9xl">{stop.place}</h2>
                  </Rise>
                  <Rise d={0.16}>
                    <p className="mt-4 font-display text-2xl italic text-white/90 drop-shadow md:text-3xl">{stop.line}</p>
                  </Rise>
                </>
              )}
              <Rise d={0.28}>
                <div className="glass mt-8 inline-flex items-center gap-4 rounded-2xl py-3 pl-3 pr-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: stop.accent }}>
                    <CarFront className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">Now driving</span>
                    <span className="block font-bold">
                      {stop.carLabel}
                      {price && <span className="font-semibold text-white/75"> · {price}</span>}
                    </span>
                  </span>
                </div>
              </Rise>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dashboard: speedometer + odometer */}
        <div className="glass absolute right-10 top-28 z-10 hidden items-center gap-4 rounded-3xl p-4 pr-6 text-white xl:flex">
          <svg viewBox="0 0 120 100" className="h-20 w-24">
            <path d="M14 88 A52 52 0 1 1 106 88" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="7" strokeLinecap="round" />
            <path d="M14 88 A52 52 0 1 1 106 88" fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" strokeDasharray="4 6" />
            <g ref={needle}>
              <line x1="60" y1="60" x2="60" y2="16" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            </g>
            <circle cx="60" cy="60" r="6" fill="#fff" />
          </svg>
          <div>
            <div className="font-display text-4xl font-semibold tabular-nums leading-none">
              <span ref={speedTxt}>0</span>
              <span className="ml-1 text-sm text-white/60">km/h</span>
            </div>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">Odometer</div>
            <div className="font-semibold tabular-nums">
              <span ref={odoTxt}>0</span> km
            </div>
          </div>
        </div>

        {/* Route progress */}
        <div className="absolute bottom-[1.6vh] left-1/2 z-10 flex w-[min(92vw,760px)] -translate-x-1/2 items-center justify-between text-[10px] font-bold uppercase tracking-[0.25em] text-white/75 md:text-xs">
          {JOURNEY.map((j, i) => (
            <span key={j.place} className="flex items-center gap-2 transition-colors duration-500" style={{ color: i === idx ? j.accent : undefined }}>
              <span className="h-2 w-2 rounded-full bg-current" />
              {j.place}
            </span>
          ))}
        </div>

        {idx === 0 && (
          <div className="absolute bottom-[22vh] left-6 z-10 hidden animate-pulse md:left-10 text-[10px] font-bold uppercase tracking-[0.4em] text-white/80 md:block">
            Scroll to drive ↓
          </div>
        )}
      </div>
    </section>
  );
}

function Scene({ i, p, active, image, grade }: { i: number; p: MotionValue<number>; active: boolean; image: string; grade: string }) {
  const x = useTransform(p, [i / N - 0.1, (i + 1) / N + 0.1], ["4%", "-4%"]);
  return (
    <motion.div className="absolute inset-0" initial={false} animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 1.08 }} transition={{ duration: 1.4, ease: EASE }}>
      <motion.div style={{ x }} className="absolute -inset-[6%]">
        <Image src={image} alt="" fill sizes="100vw" priority={i < 2} className="object-cover object-[center_60%]" />
      </motion.div>
      <div className="absolute inset-0" style={{ background: grade }} />
    </motion.div>
  );
}

function Rise({ children, d }: { children: React.ReactNode; d: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: d, ease: EASE }}>
      {children}
    </motion.div>
  );
}
