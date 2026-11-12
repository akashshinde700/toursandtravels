import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, CarFront, MapPin, MessageCircle, Phone, Trash2 } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getDb, type Enquiry } from "@/lib/db";
import { waLink } from "@/lib/whatsapp";
import { AdminHeader } from "../admin-nav";
import { deleteEnquiry, setEnquiryStatus } from "../actions";

export const metadata: Metadata = { title: "Enquiries", robots: { index: false, follow: false } };

const FILTERS = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "done", label: "Done" },
  { key: "all", label: "All" },
] as const;

const STATUS_STYLE = { new: "bg-gold text-ink", contacted: "bg-teal/15 text-deep", done: "bg-sand text-ink-soft" };

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  if (!(await isAdmin())) redirect("/admin");
  const { status } = await searchParams;
  const filter = FILTERS.find((f) => f.key === status)?.key ?? "new";
  const db = getDb();
  const rows = (
    filter === "all"
      ? db.prepare("SELECT *, datetime(created_at, '+5 hours', '+30 minutes') AS created_at FROM enquiries ORDER BY id DESC LIMIT 500").all()
      : db.prepare("SELECT *, datetime(created_at, '+5 hours', '+30 minutes') AS created_at FROM enquiries WHERE status = ? ORDER BY id DESC LIMIT 500").all(filter)
  ) as unknown as Enquiry[];
  const counts = Object.fromEntries(
    (db.prepare("SELECT status, COUNT(*) AS n FROM enquiries GROUP BY status").all() as { status: string; n: number }[]).map((r) => [r.status, r.n])
  );
  const total = Object.values(counts).reduce((a, b) => a + Number(b), 0);

  return (
    <div className="min-h-svh bg-ivory">
      <AdminHeader active="enquiries" newEnquiries={counts.new ?? 0} title="Enquiries" />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <p className="rounded-2xl bg-teal/10 px-4 py-3 text-sm text-deep">
          Every booking form sent from the website appears here. Call or reply on WhatsApp, then mark it <b>Contacted</b> or <b>Done</b>.
        </p>

        <nav className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={`/admin/enquiries?status=${f.key}`}
              className={`rounded-full px-4 py-2 text-sm font-bold ${filter === f.key ? "bg-ink text-white" : "bg-white text-ink-soft hover:bg-sand"}`}
            >
              {f.label} <span className="opacity-70">({f.key === "all" ? total : counts[f.key] ?? 0})</span>
            </Link>
          ))}
        </nav>

        {rows.length === 0 && <div className="rounded-3xl bg-white p-10 text-center text-ink-soft">No {filter === "all" ? "" : filter} enquiries yet.</div>}

        <div className="space-y-4">
          {rows.map((e) => {
            const reply = waLink(e.phone, `Namaste ${e.name}! Thank you for your enquiry (${e.ref}) with Aaisaheb Tours & Travels${e.destination ? ` for ${e.destination}` : ""}. `);
            return (
              <article key={e.id} className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_-30px_rgba(10,40,38,.35)]">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="mr-auto">
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-2xl font-semibold">{e.name}</h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${STATUS_STYLE[e.status]}`}>{e.status}</span>
                    </div>
                    <div className="mt-1 text-sm text-ink-soft">
                      {e.ref} · received {new Date(e.created_at.replace(" ", "T")).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  </div>
                  <a href={`tel:${e.phone}`} className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white">
                    <Phone className="h-4 w-4" /> {e.phone}
                  </a>
                  <a href={reply} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-[#25d366] px-4 py-2 text-sm font-bold text-white">
                    <MessageCircle className="h-4 w-4" /> Reply on WhatsApp
                  </a>
                </div>

                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <Detail icon={MapPin} label="From" value={e.pickup} />
                  <Detail icon={MapPin} label="To" value={e.destination} />
                  <Detail icon={Calendar} label="Travel date" value={e.travel_date && new Date(e.travel_date).toLocaleDateString("en-IN", { dateStyle: "medium" })} />
                  <Detail icon={CarFront} label="Car" value={e.car} />
                </dl>
                {e.message && <p className="mt-4 whitespace-pre-line rounded-2xl bg-ivory px-4 py-3 text-sm">{e.message}</p>}

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-sand pt-4 text-sm">
                  <span className="mr-1 font-semibold text-ink-soft">Mark as:</span>
                  {(["new", "contacted", "done"] as const).map((s) => (
                    <form key={s} action={setEnquiryStatus.bind(null, e.id, s)}>
                      <button disabled={e.status === s} className="rounded-full border border-sand px-3 py-1.5 font-bold capitalize transition hover:bg-sand disabled:bg-ink disabled:text-white">
                        {s}
                      </button>
                    </form>
                  ))}
                  <form action={deleteEnquiry.bind(null, e.id)} className="ml-auto">
                    <button className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-bold text-ink-soft hover:bg-wine/10 hover:text-wine">
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value?: string }) {
  return (
    <div className="rounded-2xl bg-ivory px-4 py-3">
      <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-ink-soft">
        <Icon className="h-3.5 w-3.5" /> {label}
      </dt>
      <dd className="mt-1 font-semibold">{value || "—"}</dd>
    </div>
  );
}
