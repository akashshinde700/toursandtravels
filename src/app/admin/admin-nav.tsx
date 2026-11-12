import Link from "next/link";
import { FileText, Inbox, LogOut, Users } from "lucide-react";
import { logout } from "./actions";

// Top-level admin sections. `newEnquiries` shows as a badge so new bookings are never missed.
export function AdminNav({ active, newEnquiries }: { active: "content" | "enquiries" | "visitors"; newEnquiries: number }) {
  const items = [
    { key: "content", href: "/admin", label: "Website content", icon: FileText },
    { key: "enquiries", href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
    { key: "visitors", href: "/admin/visitors", label: "Visitors", icon: Users },
  ] as const;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {items.map(({ key, href, label, icon: Icon }) => (
        <Link
          key={key}
          href={href}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition ${active === key ? "bg-deep text-white" : "text-ink-soft hover:bg-sand"}`}
        >
          <Icon className="h-4 w-4" /> {label}
          {key === "enquiries" && newEnquiries > 0 && <span className="rounded-full bg-gold px-2 text-xs text-ink">{newEnquiries}</span>}
        </Link>
      ))}
      <form action={logout}>
        <button className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-ink-soft hover:text-wine">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </form>
    </div>
  );
}

// Header used by the Enquiries and Visitors pages (the content editor has its own, with Publish).
export function AdminHeader({ active, newEnquiries, title }: { active: "enquiries" | "visitors"; newEnquiries: number; title: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-sand bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <img src="/images/brand/logo-mark-192.webp" alt="" className="h-10 w-auto" />
        <div className="mr-auto font-display text-lg font-semibold">{title}</div>
        <AdminNav active={active} newEnquiries={newEnquiries} />
      </div>
    </header>
  );
}

export const newEnquiryCount = (db: { prepare: (sql: string) => { get: () => unknown } }) =>
  Number((db.prepare("SELECT COUNT(*) AS n FROM enquiries WHERE status = 'new'").get() as { n: number }).n);
