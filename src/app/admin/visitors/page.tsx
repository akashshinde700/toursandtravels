import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { AdminHeader, newEnquiryCount } from "../admin-nav";

export const metadata: Metadata = { title: "Visitors", robots: { index: false, follow: false } };

const PERIODS = [
  { days: 1, label: "Today" },
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
] as const;

const PAGE_NAMES: Record<string, string> = { "/": "Home", "/fleet": "Fleet", "/tariffs": "Tariff", "/routes": "Routes", "/destinations": "Destinations", "/about": "About", "/contact": "Contact / booking" };
const pageName = (p: string) => PAGE_NAMES[p.split("?")[0]] ?? p;

type Row = Record<string, string | number | null>;

export default async function VisitorsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  if (!(await isAdmin())) redirect("/admin");
  const params = await searchParams;
  const days = PERIODS.find((p) => String(p.days) === params.days)?.days ?? 7;
  const db = getDb();
  // India dates; `since` = first day of the period
  const today = new Date(Date.now() + 5.5 * 3600_000);
  const dayList = Array.from({ length: days }, (_, i) => new Date(today.getTime() - (days - 1 - i) * 86400_000).toISOString().slice(0, 10));
  const since = dayList[0];
  const q = <T = Row,>(sql: string) => db.prepare(sql).all(since) as unknown as T[];
  const one = (sql: string) => Number(Object.values(db.prepare(sql).get(since) as Row)[0] ?? 0);

  const views = one("SELECT COUNT(*) FROM visits WHERE event = 'pageview' AND day >= ?");
  const uniques = one("SELECT COUNT(DISTINCT visitor) FROM visits WHERE event = 'pageview' AND day >= ?");
  const whatsapp = one("SELECT COUNT(*) FROM visits WHERE event = 'whatsapp' AND day >= ?");
  const calls = one("SELECT COUNT(*) FROM visits WHERE event = 'call' AND day >= ?");
  const enquiries = one("SELECT COUNT(*) FROM enquiries WHERE date(created_at, '+5 hours', '+30 minutes') >= ?");

  const perDay = new Map(q<{ day: string; views: number; uniques: number }>("SELECT day, COUNT(*) AS views, COUNT(DISTINCT visitor) AS uniques FROM visits WHERE event = 'pageview' AND day >= ? GROUP BY day").map((r) => [r.day, r]));
  const series = dayList.map((d) => ({ day: d, views: perDay.get(d)?.views ?? 0, uniques: perDay.get(d)?.uniques ?? 0 }));
  const maxViews = Math.max(1, ...series.map((s) => s.views));

  const pages = q<{ path: string; n: number }>("SELECT path, COUNT(*) AS n FROM visits WHERE event = 'pageview' AND day >= ? GROUP BY path ORDER BY n DESC LIMIT 8");
  const sources = q<{ source: string; n: number }>("SELECT source, COUNT(*) AS n FROM visits WHERE source IS NOT NULL AND day >= ? GROUP BY source ORDER BY n DESC LIMIT 8");
  const devices = q<{ device: string; n: number }>("SELECT device, COUNT(DISTINCT visitor) AS n FROM visits WHERE event = 'pageview' AND day >= ? GROUP BY device ORDER BY n DESC");
  const recent = q<{ ts: string; path: string; source: string | null; device: string; browser: string; event: string }>(
    "SELECT datetime(ts, '+5 hours', '+30 minutes') AS ts, path, source, device, browser, event FROM visits WHERE day >= ? ORDER BY id DESC LIMIT 40"
  );

  return (
    <div className="min-h-svh bg-ivory">
      <AdminHeader active="visitors" newEnquiries={newEnquiryCount(db)} title="Visitors" />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center gap-2">
          {PERIODS.map((p) => (
            <Link key={p.days} href={`/admin/visitors?days=${p.days}`} className={`rounded-full px-4 py-2 text-sm font-bold ${days === p.days ? "bg-ink text-white" : "bg-white text-ink-soft hover:bg-sand"}`}>
              {p.label}
            </Link>
          ))}
          <span className="ml-auto text-xs text-ink-soft">Bots are ignored. No IP addresses or personal data are stored.</span>
        </div>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <Stat label="Page views" value={views} />
          <Stat label="Unique visitors" value={uniques} hint={days > 1 ? "counted per day" : undefined} />
          <Stat label="Enquiries" value={enquiries} href="/admin/enquiries?status=all" />
          <Stat label="WhatsApp clicks" value={whatsapp} />
          <Stat label="Call clicks" value={calls} />
        </section>

        {days > 1 && (
          <section className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_-30px_rgba(10,40,38,.35)]">
            <h2 className="font-display text-xl font-semibold">Page views per day</h2>
            <div className="mt-6 flex h-48 items-end gap-[2px] border-b border-sand">
              {series.map((s) => (
                <div key={s.day} className="group relative flex h-full flex-1 items-end">
                  {/* hit area is the full column; the mark itself stays thin */}
                  <div className="mx-auto w-full max-w-8 rounded-t bg-teal transition-colors group-hover:bg-deep" style={{ height: `${(s.views / maxViews) * 100}%`, minHeight: s.views ? 2 : 0 }} />
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-ink px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                    <b>{new Date(s.day).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</b> · {s.views} views · {s.uniques} visitors
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-ink-soft">
              <span>{new Date(series[0].day).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              <span>Today</span>
            </div>
          </section>
        )}

        <section className="grid gap-4 lg:grid-cols-3">
          <Ranked title="Most viewed pages" rows={pages.map((r) => [pageName(r.path), r.n])} />
          <Ranked title="Where visitors came from" rows={sources.map((r) => [r.source, r.n])} empty="Shows once visitors arrive" />
          <Ranked title="Devices" rows={devices.map((r) => [r.device, r.n])} />
        </section>

        <section className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_-30px_rgba(10,40,38,.35)]">
          <h2 className="px-6 pt-6 font-display text-xl font-semibold">Recent activity</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-ivory text-xs uppercase tracking-[0.12em] text-ink-soft">
                <tr>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Activity</th>
                  <th className="px-6 py-3">Came from</th>
                  <th className="px-6 py-3">Device</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-ink-soft">No visits in this period yet.</td>
                  </tr>
                )}
                {recent.map((r, i) => (
                  <tr key={i} className="border-t border-sand">
                    <td className="whitespace-nowrap px-6 py-3 text-ink-soft">{new Date(r.ts.replace(" ", "T")).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</td>
                    <td className="px-6 py-3 font-semibold">
                      {r.event === "whatsapp" ? "💬 Clicked WhatsApp" : r.event === "call" ? "📞 Clicked call" : `Viewed ${pageName(r.path)}`}
                      {r.event !== "pageview" && <span className="font-normal text-ink-soft"> on {pageName(r.path)}</span>}
                    </td>
                    <td className="px-6 py-3">{r.source ?? <span className="text-ink-soft">—</span>}</td>
                    <td className="px-6 py-3 text-ink-soft">
                      {r.device} · {r.browser}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, hint, href }: { label: string; value: number; hint?: string; href?: string }) {
  const body = (
    <>
      <div className="text-xs font-bold uppercase tracking-[0.15em] text-ink-soft">{label}</div>
      <div className="mt-2 font-display text-4xl font-semibold tabular-nums">{value.toLocaleString("en-IN")}</div>
      {hint && <div className="mt-1 text-xs text-ink-soft">{hint}</div>}
    </>
  );
  const cls = "block rounded-3xl bg-white p-5 shadow-[0_20px_50px_-30px_rgba(10,40,38,.35)]";
  return href ? (
    <Link href={href} className={`${cls} transition hover:-translate-y-0.5`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function Ranked({ title, rows, empty = "No data yet" }: { title: string; rows: [string, number][]; empty?: string }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <div className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_-30px_rgba(10,40,38,.35)]">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {rows.length === 0 && <p className="mt-4 text-sm text-ink-soft">{empty}</p>}
      <ul className="mt-4 space-y-3">
        {rows.map(([label, n]) => (
          <li key={label} title={`${label}: ${n}`}>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{label}</span>
              <span className="tabular-nums text-ink-soft">{n.toLocaleString("en-IN")}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-sand">
              <div className="h-full rounded-full bg-teal" style={{ width: `${(n / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
