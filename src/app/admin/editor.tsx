"use client";

import { createContext, useContext, useEffect, useImperativeHandle, useRef, useState, useTransition } from "react";
import { CheckCircle2, Eye, ImageUp, Loader2, MapPin, Monitor, RotateCcw, Smartphone, UploadCloud, X } from "lucide-react";
import type { Content } from "@/lib/data";
import { discardChanges, previewDraft, save, type SaveState } from "./actions";
import { AdminNav } from "./admin-nav";

// A place on the website that a section of the editor changes. `stop` = road-trip stop on the home page.
type Spot = { label: string; path: string; id?: string; stop?: number };

const TABS = ["Contact", "Prices", "Cars", "Routes", "Home hero", "Destinations", "Page photos"] as const;
type Tab = (typeof TABS)[number];

const SPOTS = {
  contact: [
    { label: "Contact page", path: "/contact", id: "contact-details" },
    { label: "Footer (every page)", path: "/", id: "footer" },
    { label: "Call / WhatsApp buttons (bottom of every page)", path: "/", id: "book" },
    { label: "'Call to book' button in the top menu", path: "/" },
  ],
  localKm: [
    { label: "Tariff page · Nashik local cards", path: "/tariffs", id: "local" },
    { label: "Tariff page · per-km section", path: "/tariffs", id: "per-km" },
    { label: "Home page · fleet cards", path: "/", id: "fleet" },
    { label: "Fleet page · price box", path: "/fleet", id: "car-sedan" },
    { label: "Home page · road-trip 'Now driving' card", path: "/", stop: 1 },
  ],
  routePrices: (id: string) => [
    { label: "Tariff page · intercity fare chart", path: "/tariffs", id: "fare-chart" },
    { label: "Routes page", path: "/routes", id },
    { label: "Home page · pickup & drop section", path: "/", id: "routes" },
  ],
  car: (id: string) => [
    { label: "Fleet page", path: "/fleet", id: `car-${id}` },
    { label: "Home page · fleet cards", path: "/", id: "fleet" },
    { label: "Tariff page · Nashik local cards", path: "/tariffs", id: "local" },
  ],
  route: (id: string) => [
    { label: "Routes page", path: "/routes", id },
    { label: "Home page · pickup & drop section", path: "/", id: "routes" },
    { label: "Tariff page · intercity fare chart", path: "/tariffs", id: "fare-chart" },
  ],
  stop: (i: number) => [{ label: `Home page · top, stop ${i + 1} of the road trip`, path: "/", stop: i }],
  destinations: [
    { label: "Destinations page", path: "/destinations", id: "destinations" },
    { label: "Home page · photo strip", path: "/", id: "destinations" },
  ],
  page: (path: string, name: string, hasHero: boolean, hasCta: boolean) => [
    ...(hasHero ? [{ label: `${name} · top banner`, path }] : []),
    ...(hasCta ? [{ label: `${name} · bottom 'Your seat is waiting' banner`, path, id: "book" }] : []),
  ],
};

const PAGE_NAMES = { home: ["Home page", "/"], fleet: ["Fleet page", "/fleet"], tariffs: ["Tariff page", "/tariffs"], routes: ["Routes page", "/routes"], destinations: ["Destinations page", "/destinations"], about: ["About page", "/about"], contact: ["Contact page", "/contact"] } as const;

const inputCls =
  "w-full rounded-xl border border-sand bg-ivory px-4 py-3 text-sm font-semibold outline-none transition focus:border-teal focus:bg-white focus:ring-4 focus:ring-teal/15";

// A section of the form. Hovering it for a moment, or focusing anything inside, points the preview at where it shows.
let hoverTimer: ReturnType<typeof setTimeout> | undefined;
function Card({ title, spots, help, current, onSpot, onOpen, children }: { title: string; spots: Spot[]; help?: string; current: Spot; onSpot: (s: Spot) => void; onOpen: () => void; children: React.ReactNode }) {
  return (
    <section
      onFocusCapture={() => !spots.some((x) => same(x, current)) && onSpot(spots[0])}
      onMouseEnter={() => {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => !spots.some((x) => same(x, current)) && onSpot(spots[0]), 350);
      }}
      onMouseLeave={() => clearTimeout(hoverTimer)}
      className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_-30px_rgba(10,40,38,.35)]">
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {help && <p className="mt-1 text-sm text-ink-soft">{help}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-ink-soft">Shown on:</span>
        {spots.map((s) => (
          <button
            type="button"
            key={s.label}
            onClick={() => {
              onSpot(s);
              onOpen();
            }}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition ${same(s, current) ? "bg-teal text-white" : "bg-sand text-ink hover:bg-gold/40"}`}
          >
            <MapPin className="h-3 w-3" /> {s.label}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

// Lets every field reach the preview without threading props through each card.
type PreviewApi = {
  point: (text: string) => void;
  type: (from: string, to: string) => void;
  pointImage: (src: string) => void;
  swapImage: (from: string, to: string) => void;
};
const PreviewContext = createContext<React.RefObject<PreviewApi | null> | null>(null);

// In a multi-line field (car features), the preview works on the line the cursor is in.
const lineAt = (text: string, pos: number) => text.split("\n")[text.slice(0, pos).split("\n").length - 1] ?? "";
function changedLine(before: string, after: string): [string, string] {
  const a = before.split("\n");
  const b = after.split("\n");
  if (a.length !== b.length) return [before, after];
  const i = a.findIndex((line, k) => line !== b[k]);
  return i < 0 ? [before, after] : [a[i], b[i]];
}

type FieldEl = HTMLInputElement & HTMLTextAreaElement;

function Field({ label, value, onChange, hint, multiline, type = "text" }: { label: string; value: string | number; onChange: (v: string) => void; hint?: string; multiline?: boolean; type?: string }) {
  const preview = useContext(PreviewContext);
  const text = String(value);
  // "point" = show me where this is on the website; "type" = change it there instantly
  const point = (el?: FieldEl) => preview?.current?.point(multiline ? lineAt(text, el?.selectionStart ?? 0) : text);
  const events = {
    onFocus: (e: React.FocusEvent<FieldEl>) => point(e.currentTarget),
    onClick: (e: React.MouseEvent<FieldEl>) => point(e.currentTarget),
    onKeyUp: (e: React.KeyboardEvent<FieldEl>) => multiline && e.key.startsWith("Arrow") && point(e.currentTarget),
    onMouseEnter: () => point(),
    onChange: (e: React.ChangeEvent<FieldEl>) => {
      const v = e.target.value;
      const [from, to] = multiline ? changedLine(text, v) : [text, v];
      preview?.current?.type(from, to);
      onChange(v);
    },
  };
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.15em] text-ink-soft">{label}</span>
      {multiline ? (
        <textarea rows={3} value={value} {...events} className={`${inputCls} mt-1.5`} />
      ) : (
        <input type={type} value={value} {...events} className={`${inputCls} mt-1.5`} />
      )}
      {hint && <span className="mt-1 block text-xs text-ink-soft">{hint}</span>}
    </label>
  );
}

// A photo slot: shows the current photo; "Change photo" uploads a new one (resized + converted on the server).
function ImageField({ label, value, onChange, hint, wide }: { label: string; value: string; onChange: (v: string) => void; hint?: string; wide?: boolean }) {
  const preview = useContext(PreviewContext);
  const picker = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    const body = new FormData();
    body.set("file", file);
    const res = await fetch("/api/upload", { method: "POST", body }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { url?: string; error?: string } | null;
    setBusy(false);
    if (!json?.url) return setError(json?.error ?? "Upload failed — please try again.");
    preview?.current?.swapImage(value, json.url);
    onChange(json.url);
  };

  return (
    <div className={wide ? "sm:col-span-2" : ""} onMouseEnter={() => preview?.current?.pointImage(value)}>
      <span className="text-xs font-bold uppercase tracking-[0.15em] text-ink-soft">{label}</span>
      <div className="mt-1.5 flex items-center gap-4 rounded-xl border border-sand bg-ivory p-2">
        <img src={value} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover sm:h-20 sm:w-28" />
        <div className="min-w-0">
          <button
            type="button"
            disabled={busy}
            onClick={() => picker.current?.click()}
            onFocus={() => preview?.current?.pointImage(value)}
            className="flex items-center gap-2 whitespace-nowrap rounded-full bg-ink px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />} {busy ? "Uploading…" : "Change photo"}
          </button>
          <span className="mt-1 block text-xs text-ink-soft">{hint ?? "JPG, PNG or WebP · landscape works best"}</span>
          {error && <span className="mt-1 block text-xs font-semibold text-wine">{error}</span>}
        </div>
      </div>
      <input
        ref={picker}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) upload(f);
        }}
      />
    </div>
  );
}

export function Editor({ initial, hasDraft, newEnquiries }: { initial: Content; hasDraft: boolean; newEnquiries: number }) {
  const [c, setC] = useState(initial);
  const [tab, setTab] = useState<Tab>("Prices");
  const [dirty, setDirty] = useState(hasDraft);
  const [state, setState] = useState<SaveState>();
  const [pending, startTransition] = useTransition();
  const [spot, setSpot] = useState<Spot>(SPOTS.localKm[0]);
  const [version, setVersion] = useState(0); // bump = reload the preview
  const [syncing, setSyncing] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const previewApi = useRef<PreviewApi>(null);

  // Every edit: the preview text changes instantly (see Field); 1.2 s after the last keystroke the
  // draft is stored — owner-only — and the preview reloads to show the real rendered result.
  const edit = (fn: (draft: Content) => void) => {
    const draft = structuredClone(c);
    fn(draft);
    setC(draft);
    setDirty(true);
    setSyncing(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await previewDraft(JSON.stringify(draft));
      setSyncing(false);
      setVersion((v) => v + 1);
    }, 1200);
  };

  const publishNow = () =>
    startTransition(async () => {
      clearTimeout(timer.current);
      const fd = new FormData();
      fd.set("content", JSON.stringify(c));
      const result = await save(undefined, fd);
      setState(result);
      if (result?.ok) {
        setDirty(false);
        setSyncing(false);
        setVersion((v) => v + 1);
      }
    });

  const discard = async () => {
    if (!dirty) return;
    clearTimeout(timer.current);
    const published = await discardChanges();
    if (!published) return;
    setC(published);
    setDirty(false);
    setSyncing(false);
    setState(undefined);
    setVersion((v) => v + 1);
  };

  const status = pending
    ? "Publishing…"
    : state?.error
      ? state.error
      : dirty
        ? syncing
          ? "Updating preview…"
          : "Unpublished changes — only you can see them in the preview"
        : state?.ok
          ? `Published at ${state.savedAt} — live for all visitors`
          : "Everything is published";

  const cardProps = { current: spot, onSpot: setSpot, onOpen: () => setMobilePreview(true) };

  return (
    <div className="min-h-svh bg-ivory">
      <PreviewContext value={previewApi}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          publishNow();
        }}
      >

        <header className="sticky top-0 z-30 border-b border-sand bg-white/95 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 lg:flex-nowrap">
            <img src="/images/brand/logo-mark-192.webp" alt="" className="h-10 w-auto" />
            <div className="mr-auto min-w-0">
              <div className="font-display text-lg font-semibold leading-tight">Admin panel</div>
              <div className={`truncate text-xs ${state?.error ? "font-semibold text-wine" : dirty ? "font-semibold text-bronze" : "text-ink-soft"}`}>{status}</div>
            </div>
            <AdminNav active="content" newEnquiries={newEnquiries} />
            <button type="button" onClick={discard} disabled={!dirty || pending} className="flex items-center gap-1.5 rounded-full border border-sand px-4 py-2 text-sm font-bold disabled:opacity-40">
              <RotateCcw className="h-4 w-4" /> Discard changes
            </button>
            <button disabled={pending || !dirty} className="flex items-center gap-2 rounded-full bg-royal px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : !dirty && state?.ok ? <CheckCircle2 className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />} Publish changes
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-2">
            {TABS.map((t) => (
              <button type="button" key={t} onClick={() => setTab(t)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${tab === t ? "bg-ink text-white" : "text-ink-soft hover:bg-sand"}`}>
                {t}
              </button>
            ))}
          </nav>
        </header>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <main className="space-y-6 px-4 py-6">
            <p className="rounded-2xl bg-teal/10 px-4 py-3 text-sm text-deep">
              Edit on the left — the website on the right updates as you type. Visitors only see your changes after you press <b>Publish changes</b>.
            </p>

            {tab === "Contact" && (
              <Card {...cardProps} title="Contact details" spots={SPOTS.contact} help="Used everywhere people call, WhatsApp or email you — including booking requests from the contact form.">
                <Field label="Phone shown on site" value={c.contact.phoneDisplay} onChange={(v) => edit((d) => { d.contact.phoneDisplay = v; })} hint="How the number is written, e.g. +91 98765 43210" />
                <Field label="Phone for calling" value={c.contact.phone} onChange={(v) => edit((d) => { d.contact.phone = v; })} hint="With country code, no spaces, e.g. +919876543210" />
                <Field label="WhatsApp number" value={c.contact.whatsapp} onChange={(v) => edit((d) => { d.contact.whatsapp = v; })} hint="Digits only with country code, e.g. 919876543210" />
                <Field label="Email" type="email" value={c.contact.email} onChange={(v) => edit((d) => { d.contact.email = v; })} />
                <Field label="City / address" value={c.contact.city} onChange={(v) => edit((d) => { d.contact.city = v; })} />
              </Card>
            )}

            {tab === "Prices" && (
              <>
                <Card {...cardProps} title="Nashik local (per day) & outstation (per km)" spots={SPOTS.localKm} help="Local = travel within Nashik for the day. Per km = trips outside Nashik.">
                  {c.fleet.map((car, i) => (
                    <div key={car.id} className="space-y-3 rounded-2xl bg-ivory p-4">
                      <div className="font-bold">{car.name}</div>
                      <Field label="Local / day" value={car.local} onChange={(v) => edit((d) => { d.fleet[i].local = v; })} hint="e.g. ₹2,500 – 3,000" />
                      <Field label="Outstation / km" value={car.perKm} onChange={(v) => edit((d) => { d.fleet[i].perKm = v; })} hint="e.g. ₹12 – 14" />
                    </div>
                  ))}
                </Card>
                {c.routes.map((r, ri) => (
                  <Card key={r.id} {...cardProps} title={`Pickup & drop: ${r.from} → ${r.to}`} spots={SPOTS.routePrices(r.id)}>
                    {c.fleet.map((car) => (
                      <Field key={car.id} label={car.name} value={r.prices[car.id]} onChange={(v) => edit((d) => { d.routes[ri].prices[car.id] = v; })} />
                    ))}
                  </Card>
                ))}
              </>
            )}

            {tab === "Cars" &&
              c.fleet.map((car, i) => (
                <Card key={car.id} {...cardProps} title={car.name} spots={SPOTS.car(car.id)}>
                  {car.images.map((src, k) => (
                    <ImageField
                      key={k}
                      label={k === 0 ? "Main photo" : "Second photo (small, Fleet page)"}
                      hint={k === 0 ? "Shown on Fleet & Tariff pages" : undefined}
                      value={src}
                      onChange={(v) => edit((d) => { d.fleet[i].images[k] = v; })}
                    />
                  ))}
                  <Field label="Name" value={car.name} onChange={(v) => edit((d) => { d.fleet[i].name = v; })} />
                  <Field label="Model" value={car.model} onChange={(v) => edit((d) => { d.fleet[i].model = v; })} />
                  <Field label="Tagline" value={car.tagline} onChange={(v) => edit((d) => { d.fleet[i].tagline = v; })} />
                  <Field label="Seats" value={car.seats} onChange={(v) => edit((d) => { d.fleet[i].seats = v; })} />
                  <Field label="Luggage" value={car.bags} onChange={(v) => edit((d) => { d.fleet[i].bags = v; })} />
                  <div className="sm:col-span-2">
                    <Field label="Description" multiline value={car.description} onChange={(v) => edit((d) => { d.fleet[i].description = v; })} />
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Features" multiline hint="One per line" value={car.features.join("\n")} onChange={(v) => edit((d) => { d.fleet[i].features = v.split("\n"); })} />
                  </div>
                </Card>
              ))}

            {tab === "Routes" &&
              c.routes.map((r, i) => (
                <Card key={r.id} {...cardProps} title={`${r.from} → ${r.to}`} spots={SPOTS.route(r.id)} help="Prices for this route are in the Prices tab.">
                  <ImageField wide label="Route photo (Routes page)" value={r.image} onChange={(v) => edit((d) => { d.routes[i].image = v; })} />
                  <Field label="From" value={r.from} onChange={(v) => edit((d) => { d.routes[i].from = v; })} />
                  <Field label="To" value={r.to} onChange={(v) => edit((d) => { d.routes[i].to = v; })} />
                  <Field label="Distance (km)" type="number" value={r.km} onChange={(v) => edit((d) => { d.routes[i].km = Number(v); })} />
                  <Field label="Travel time" value={r.time} onChange={(v) => edit((d) => { d.routes[i].time = v; })} />
                  <div className="sm:col-span-2">
                    <Field label="Via" value={r.via} onChange={(v) => edit((d) => { d.routes[i].via = v; })} />
                  </div>
                </Card>
              ))}

            {tab === "Home hero" &&
              c.journey.map((j, i) => (
                <Card key={i} {...cardProps} title={`Stop ${i + 1}: ${j.place}`} spots={SPOTS.stop(i)} help="The hero section at the top of the home page. As visitors scroll, the background changes through these 4 photos while the car drives along the road. Prices come from the Prices tab.">
                  <ImageField wide label="Hero background photo" hint="Wide landscape photo, sky at the top — the car (not changeable) drives across the bottom" value={j.image} onChange={(v) => edit((d) => { d.journey[i].image = v; })} />
                  <Field label="Place (big title)" value={j.place} onChange={(v) => edit((d) => { d.journey[i].place = v; })} />
                  <Field label="Region (small line above)" value={j.region} onChange={(v) => edit((d) => { d.journey[i].region = v; })} />
                  <Field label="Car label ('Now driving' card)" value={j.carLabel} onChange={(v) => edit((d) => { d.journey[i].carLabel = v; })} />
                  <Field label="Yellow milestone sign" value={j.milestone} onChange={(v) => edit((d) => { d.journey[i].milestone = v; })} />
                  <div className="sm:col-span-2">
                    <Field label="Line under the title" value={j.line} onChange={(v) => edit((d) => { d.journey[i].line = v; })} />
                  </div>
                </Card>
              ))}

            {tab === "Destinations" &&
              c.destinations.map((x, i) => (
                <Card key={i} {...cardProps} title={x.title} spots={SPOTS.destinations}>
                  <ImageField wide label="Photo" value={x.image} onChange={(v) => edit((d) => { d.destinations[i].image = v; })} />
                  <Field label="Title" value={x.title} onChange={(v) => edit((d) => { d.destinations[i].title = v; })} />
                  <Field label="Region" value={x.region} onChange={(v) => edit((d) => { d.destinations[i].region = v; })} />
                  <div className="sm:col-span-2">
                    <Field label="Description" value={x.blurb} onChange={(v) => edit((d) => { d.destinations[i].blurb = v; })} />
                  </div>
                </Card>
              ))}
            {tab === "Page photos" &&
              (Object.keys(PAGE_NAMES) as (keyof typeof PAGE_NAMES)[]).map((key) => {
                const [name, path] = PAGE_NAMES[key];
                const pg = c.pages[key] as { hero?: string; photo?: string; cta?: string };
                const set = (field: "hero" | "photo" | "cta") => (v: string) => edit((d) => { (d.pages[key] as Record<string, string>)[field] = v; });
                return (
                  <Card key={key} {...cardProps} title={name} spots={SPOTS.page(path, name, !!pg.hero || !!pg.photo, !!pg.cta)}>
                    {pg.hero && <ImageField label="Hero background (top banner)" value={pg.hero} onChange={set("hero")} hint="Big photo behind the page title" />}
                    {pg.photo && <ImageField label="Story photo" value={pg.photo} onChange={set("photo")} hint="Tall photo next to 'Why Aaisaheb'" />}
                    {pg.cta && <ImageField label="Bottom banner" value={pg.cta} onChange={set("cta")} hint="Behind 'Your seat is waiting'" />}
                  </Card>
                );
              })}
          </main>

          <aside className={`${mobilePreview ? "fixed inset-0 z-40 flex" : "hidden"} flex-col bg-ink lg:sticky lg:top-[113px] lg:z-auto lg:flex lg:h-[calc(100svh-113px)]`}>
            <Preview apiRef={previewApi} spot={spot} version={version} onClose={() => setMobilePreview(false)} />
          </aside>
        </div>
      </form>
      </PreviewContext>

      <button type="button" onClick={() => setMobilePreview(true)} className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-royal px-5 py-3 font-bold text-white shadow-xl lg:hidden">
        <Eye className="h-5 w-5" /> Preview
      </button>

    </div>
  );
}

const same = (a: Spot, b: Spot) => a.path === b.path && a.id === b.id && a.stop === b.stop;

// The real website in an iframe (draft mode on), scaled to fit, scrolled to the spot being edited.
function Preview({ apiRef, spot, version, onClose }: { apiRef: React.Ref<PreviewApi>; spot: Spot; version: number; onClose: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [size, setSize] = useState({ w: 600, h: 600 });
  const keepY = useRef<number | null>(null); // on an edit-reload, keep the owner's scroll position
  const loadedSpot = useRef<Spot>(spot); // the iframe's initial src already points here
  const active = useRef<{ nodes: Text[]; val: string } | null>(null); // the text currently outlined
  const lastPoint = useRef(""); // re-outlined after each reload

  const outline = (d: Document, nodes: Text[]) => {
    d.querySelectorAll<HTMLElement>("[data-aas-hl]").forEach((el) => {
      el.style.outline = "";
      el.style.outlineOffset = "";
      el.removeAttribute("data-aas-hl");
    });
    for (const n of nodes) {
      const el = n.parentElement;
      if (!el || !el.getClientRects().length) continue;
      el.setAttribute("data-aas-hl", "");
      el.style.outline = "3px solid #e0bd6a";
      el.style.outlineOffset = "4px";
    }
  };

  // Outline every place on the page showing `text`, and scroll the best one into view.
  const point = (text: string) => {
    lastPoint.current = text;
    const d = frame.current?.contentDocument;
    const win = frame.current?.contentWindow;
    if (!d || !win) return;
    if (text.trim().length < 2) {
      active.current = null;
      outline(d, []);
      return;
    }
    const nodes: Text[] = [];
    const walk = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (n.nodeValue?.includes(text) && !n.parentElement?.closest("script,style,[aria-hidden]")) nodes.push(n as Text);
    }
    active.current = { nodes, val: text };
    outline(d, nodes);
    const shown = nodes.map((n) => n.parentElement!).filter((el) => el.getClientRects().length);
    const section = spot.id ? d.getElementById(spot.id) : null;
    const pick = shown.find((el) => section?.contains(el)) ?? shown[0]; // prefer the section being edited
    if (!pick) return;
    const r = pick.getBoundingClientRect();
    if (r.top < 90 || r.bottom > win.innerHeight - 20) win.scrollTo(0, r.top + win.scrollY - win.innerHeight / 3);
  };

  // Change the outlined text in place, letter by letter, before the real reload catches up.
  const type = (from: string, to: string) => {
    const d = frame.current?.contentDocument;
    if (!d) return;
    if (!active.current || active.current.val !== from) point(from);
    const a = active.current;
    lastPoint.current = to;
    if (!a || !a.nodes.length) return;
    const next = to || "​"; // zero-width placeholder keeps the spot findable while the field is empty
    for (const n of a.nodes) if (n.nodeValue?.includes(a.val)) n.nodeValue = n.nodeValue.replace(a.val, next);
    a.val = next;
    outline(d, a.nodes);
  };

  // Photos render through next/image, so their src/srcset contain the path URL-encoded.
  const imagesFor = (d: Document, src: string) =>
    [...d.querySelectorAll("img")].filter((img) => {
      const s = `${img.getAttribute("src")} ${img.getAttribute("srcset")}`;
      return s.includes(src) || s.includes(encodeURIComponent(src));
    });

  const outlineImages = (d: Document, imgs: HTMLImageElement[]) => {
    outline(d, []);
    for (const img of imgs) {
      img.setAttribute("data-aas-hl", "");
      img.style.outline = "5px solid #e0bd6a";
      img.style.outlineOffset = "-5px"; // inside, since photos sit in clipped frames
    }
  };

  const pointImage = (src: string) => {
    lastPoint.current = `img:${src}`;
    active.current = null;
    const d = frame.current?.contentDocument;
    const win = frame.current?.contentWindow;
    if (!d || !win) return;
    const imgs = imagesFor(d, src).filter((el) => el.getClientRects().length);
    outlineImages(d, imgs);
    const section = spot.id ? d.getElementById(spot.id) : null;
    const pick = imgs.find((el) => section?.contains(el)) ?? imgs[0];
    if (!pick) return;
    const r = pick.getBoundingClientRect();
    if (r.bottom < 90 || r.top > win.innerHeight - 40) win.scrollTo(0, r.top + win.scrollY - win.innerHeight / 4);
  };

  // Show a freshly uploaded photo immediately, before the real reload.
  const swapImage = (from: string, to: string) => {
    const d = frame.current?.contentDocument;
    if (!d) return;
    const imgs = imagesFor(d, from);
    for (const img of imgs) {
      img.removeAttribute("srcset");
      img.src = to;
    }
    lastPoint.current = `img:${to}`;
    outlineImages(d, imgs.filter((el) => el.getClientRects().length));
  };

  useImperativeHandle(apiRef, () => ({ point, type, pointImage, swapImage }));

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  const pageW = device === "desktop" ? 1280 : 390;
  const scale = size.w > 0 ? Math.min(1, size.w / pageW) : 1; // panel is 0×0 while hidden on small screens

  const scrollToSpot = () => {
    const win = frame.current?.contentWindow;
    const doc = frame.current?.contentDocument;
    if (!win || !doc) return;
    let y = 0;
    if (keepY.current !== null) y = keepY.current;
    else if (spot.stop !== undefined) {
      const hero = doc.querySelector("main section") as HTMLElement | null;
      if (hero) y = ((hero.offsetHeight - win.innerHeight) * (spot.stop + 0.5)) / 4;
    } else if (spot.id) {
      const el = doc.getElementById(spot.id);
      if (el) y = el.getBoundingClientRect().top + win.scrollY - 90;
    }
    win.scrollTo(0, y);
  };

  // Spot change: navigate (or just scroll, if it's the same page). Edit: reload in place.
  useEffect(() => {
    const win = frame.current?.contentWindow;
    if (!win) return;
    const samePage = loadedSpot.current?.path === spot.path;
    loadedSpot.current = spot;
    keepY.current = null;
    if (samePage) scrollToSpot();
    else frame.current!.src = `/api/preview?path=${encodeURIComponent(spot.path)}`;
  }, [spot]);

  useEffect(() => {
    if (version === 0) return;
    const win = frame.current?.contentWindow;
    if (!win) return;
    keepY.current = win.scrollY;
    win.location.reload();
  }, [version]);

  const onLoad = () => {
    // the site's own smooth-scroll resets to the top after hydrating, so settle twice
    setTimeout(scrollToSpot, 400);
    setTimeout(() => {
      scrollToSpot();
      keepY.current = null;
      active.current = null;
      const last = lastPoint.current;
      if (last.startsWith("img:")) pointImage(last.slice(4));
      else if (last) point(last);
    }, 1400);
  };

  return (
    <>
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 text-white">
        <Eye className="h-4 w-4 text-gold" />
        <span className="mr-auto truncate text-sm font-semibold">
          Preview · <span className="text-gold">{spot.label}</span>
        </span>
        {(["desktop", "mobile"] as const).map((d) => (
          <button type="button" key={d} onClick={() => setDevice(d)} aria-label={d} className={`rounded-lg p-1.5 ${device === d ? "bg-white/20" : "opacity-60"}`}>
            {d === "desktop" ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
          </button>
        ))}
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 lg:hidden" aria-label="Close preview">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div ref={box} className="relative flex-1 overflow-hidden">
        <iframe
          ref={frame}
          title="Website preview"
          src={`/api/preview?path=${encodeURIComponent(spot.path)}`}
          onLoad={onLoad}
          className="absolute left-1/2 top-0 origin-top bg-white"
          style={{ width: pageW, height: size.h / scale, transform: `translateX(-50%) scale(${scale})` }}
        />
      </div>
    </>
  );
}
