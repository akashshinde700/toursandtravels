"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Car } from "./car";

// Page progress as a road along the top edge, with a little Swift driving it.
export function ScrollCar() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(useTransform(scrollYProgress, (v) => v), { stiffness: 120, damping: 24 });
  const left = useTransform(p, (v) => `calc(${v * 100}% - ${v * 44}px)`);
  const width = useTransform(p, (v) => `${v * 100}%`);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[18px]">
      <div className="absolute inset-x-0 top-[15px] h-[3px] bg-ink/10" />
      <motion.div style={{ width }} className="absolute left-0 top-[15px] h-[3px] bg-royal" />
      <motion.div style={{ left }} className="absolute top-0 w-11">
        <Car id="swift" className="spin-wheels w-full" />
      </motion.div>
    </div>
  );
}
