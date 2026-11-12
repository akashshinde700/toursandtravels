import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], style: ["normal", "italic"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Aaisaheb Tours & Travels — Drive into the soul of India", template: "%s · Aaisaheb Tours & Travels" },
  description:
    "Premium cabs from Nashik — Sedan, Ertiga/XUV and Innova Crysta. Nashik local packages, per-km outstation rates, Mumbai · Pune · Nashik pickup & drop, and road trips all over India.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: extensions like Grammarly inject attributes on <html>/<body> before React loads
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-ivory text-ink" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
