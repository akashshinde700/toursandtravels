"use client";

import { motion } from "framer-motion";
import { Car } from "@/components/car";

const NO_ANIMATION = { duration: 0 };

// Re-mounts on every navigation: an Innova drives across a teal curtain, which then lifts.
export default function Template({ children }: { children: React.ReactNode }) {
  // Inside the admin's live-preview iframe, skip it so edits reload fast.
  // Only timings differ, so the server-rendered markup still matches.
  const instant = typeof window !== "undefined" && window.self !== window.top;
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] overflow-hidden bg-royal"
        initial={{ y: "0%" }}
        animate={{ y: "-100%" }}
        transition={instant ? NO_ANIMATION : { duration: 0.8, delay: 0.55, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="absolute inset-x-0 top-1/2 h-[3px] translate-y-[60px] bg-white/30" />
        <motion.div
          className="absolute left-0 top-1/2 w-[min(60vw,520px)] -translate-y-1/2"
          initial={{ x: "-110%", filter: "blur(6px)" }}
          animate={{ x: "110vw", filter: "blur(2px)" }}
          transition={instant ? NO_ANIMATION : { duration: 1.1, ease: [0.45, 0, 0.2, 1] }}
        >
          <Car id="innova-crysta" className="spin-wheels w-full drop-shadow-2xl" />
        </motion.div>
      </motion.div>
      {/* opacity only: a lingering transform here would break sticky/pinned sections */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={instant ? NO_ANIMATION : { duration: 0.8, delay: 0.5 }}>
        {children}
      </motion.div>
    </>
  );
}
