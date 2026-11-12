// Privacy-friendly visit counter. Stores page, entry source, device and browser — never an IP address.
// `visitor` is a hash that changes every day, so it counts unique visitors without following anyone.
import { createHash } from "crypto";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const BOTS = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp\/|headless|lighthouse|preview|curl|wget|python|node-fetch/i;

const SOURCES: [RegExp, string][] = [
  [/google\./, "Google"],
  [/bing\.|duckduckgo|yahoo\./, "Other search"],
  [/whatsapp|wa\.me|l\.wl\.co/, "WhatsApp"],
  [/facebook|fb\.|instagram|t\.co|twitter|x\.com|linkedin|youtube/, "Social media"],
];

function sourceOf(referrer: string, host: string) {
  if (!referrer) return "Direct";
  try {
    const r = new URL(referrer).hostname;
    if (r === host) return "Direct";
    return SOURCES.find(([re]) => re.test(r))?.[1] ?? r.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}

const deviceOf = (ua: string) => (/iPad|Tablet/i.test(ua) ? "Tablet" : /Mobi|Android|iPhone/i.test(ua) ? "Mobile" : "Desktop");
const browserOf = (ua: string) =>
  /Edg\//.test(ua) ? "Edge" : /OPR\/|Opera/.test(ua) ? "Opera" : /SamsungBrowser/.test(ua) ? "Samsung" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Other";

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOTS.test(ua)) return new Response(null, { status: 204 });

  const body = (await req.json().catch(() => null)) as { path?: unknown; referrer?: unknown; entry?: unknown; event?: unknown } | null;
  const path = typeof body?.path === "string" ? body.path.slice(0, 300) : "";
  const event = body?.event === "whatsapp" || body?.event === "call" ? body.event : "pageview";
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) return new Response(null, { status: 204 });

  const host = req.headers.get("host") ?? "";
  const source = event === "pageview" && body?.entry === true ? sourceOf(typeof body.referrer === "string" ? body.referrer : "", host.split(":")[0]) : null;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  const day = new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10); // India date
  const visitor = createHash("sha256").update(`${day}|${ip}|${ua}|${process.env.ADMIN_SECRET ?? ""}`).digest("hex").slice(0, 16);

  getDb()
    .prepare("INSERT INTO visits (day, event, path, source, device, browser, visitor) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(day, event, path, source, deviceOf(ua), browserOf(ua), visitor);
  return new Response(null, { status: 204 });
}
