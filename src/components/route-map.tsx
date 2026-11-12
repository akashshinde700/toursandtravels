"use client";

import { motion } from "framer-motion";

// Rough geography: Nashik NE of Mumbai, Pune SE of Mumbai.
const CITIES = [
  { name: "Mumbai", x: 70, y: 210 },
  { name: "Nashik", x: 300, y: 70 },
  { name: "Pune", x: 290, y: 330 },
];
const PATHS = [
  { id: "mn", d: "M70 210 C 140 170, 200 80, 300 70", dur: "5s" },
  { id: "np", d: "M300 70 C 360 150, 340 260, 290 330", dur: "6s" },
  { id: "pm", d: "M290 330 C 200 320, 120 280, 70 210", dur: "5.5s" },
];

export function RouteMap() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-deep p-6 shadow-2xl">
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:22px_22px]" />
      <svg viewBox="0 0 400 400" className="relative w-full">
        {PATHS.map((p, i) => (
          <g key={p.id}>
            <motion.path
              id={p.id}
              d={p.d}
              fill="none"
              stroke="url(#sunset)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, delay: 0.3 + i * 0.5, ease: "easeInOut" }}
            />
            <circle r="6" fill="#fff" filter="url(#glow)">
              <animateMotion dur={p.dur} repeatCount="indefinite" begin={`${2 + i * 0.6}s`}>
                <mpath href={`#${p.id}`} />
              </animateMotion>
            </circle>
          </g>
        ))}
        {CITIES.map((c, i) => (
          <motion.g key={c.name} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.4, duration: 0.6 }}>
            <circle cx={c.x} cy={c.y} r="22" fill="#e0bd6a" opacity=".25">
              <animate attributeName="r" values="14;28;14" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx={c.x} cy={c.y} r="9" fill="#e0bd6a" stroke="#fff" strokeWidth="3" />
            <text x={c.x} y={c.y - 22} textAnchor="middle" fill="#fff" fontSize="18" fontFamily="var(--font-fraunces)" fontWeight="600">
              {c.name}
            </text>
          </motion.g>
        ))}
        <defs>
          <linearGradient id="sunset" x1="0" x2="1">
            <stop offset="0" stopColor="#e9c979" />
            <stop offset="1" stopColor="#c99a3e" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}
