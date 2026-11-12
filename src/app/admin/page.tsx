import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import { getDraft, getPublished } from "@/lib/content";
import { LoginForm } from "./login-form";
import { Editor } from "./editor";
import { newEnquiryCount } from "./admin-nav";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) return <LoginForm />;
  const draft = await getDraft();
  // reopen any unsaved edits from last time instead of silently losing them
  return <Editor initial={draft ?? (await getPublished())} hasDraft={draft !== null} newEnquiries={newEnquiryCount(getDb())} />;
}
