"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Reports page views and WhatsApp / call clicks to /api/track (see that route for what's stored).
const send = (data: Record<string, unknown>) => {
  const body = JSON.stringify(data);
  if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" })))
    fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
};

let last = { path: "", at: 0 };

export function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.self !== window.top) return; // the admin's live preview isn't a visit
    // React dev mode runs effects twice; count one view per page per second at most
    if (last.path === pathname && Date.now() - last.at < 1000) return;
    last = { path: pathname, at: Date.now() };
    let entry = false;
    try {
      entry = !sessionStorage.getItem("aas-visit");
      sessionStorage.setItem("aas-visit", "1");
    } catch {}
    send({ event: "pageview", path: pathname, entry, referrer: entry ? document.referrer : "" });
  }, [pathname]);

  useEffect(() => {
    if (window.self !== window.top) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      const href = a?.getAttribute("href") ?? "";
      if (href.startsWith("https://wa.me/")) send({ event: "whatsapp", path: location.pathname });
      else if (href.startsWith("tel:")) send({ event: "call", path: location.pathname });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
