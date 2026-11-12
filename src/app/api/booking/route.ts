// Booking form endpoint: validates the enquiry, stores it in the database (shown in /admin/enquiries)
// and returns a reference code. Accepted fields: name, phone (required), pickupCity, destination,
// date, carType, message, and `company` — a hidden honeypot that only bots fill in.
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// ponytail: in-memory per-connection limit (resets on restart, per server process); use a shared store if scaled out
const recent = new Map<string, number[]>();
function tooMany(key: string) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < 10 * 60_000);
  hits.push(now);
  recent.set(key, hits);
  return hits.length > 5;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });

  const ref = "AAS-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  if (text(body.company, 100)) return Response.json({ ok: true, ref }); // bot: pretend success, store nothing

  const name = text(body.name, 100);
  const phone = text(body.phone, 30);
  if (!name || !phone) return Response.json({ ok: false, error: "Name and phone are required." }, { status: 400 });
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) return Response.json({ ok: false, error: "Please enter a valid phone number." }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  if (tooMany(ip)) return Response.json({ ok: false, error: "Too many requests — please call or WhatsApp us instead." }, { status: 429 });

  getDb()
    .prepare("INSERT INTO enquiries (ref, name, phone, pickup, destination, travel_date, car, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(ref, name, phone, text(body.pickupCity, 200), text(body.destination, 200), text(body.date, 20), text(body.carType, 60), text(body.message, 2000));

  return Response.json({ ok: true, ref });
}
