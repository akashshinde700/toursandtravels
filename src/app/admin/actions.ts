"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkCredentials, createSession, destroySession, isAdmin } from "@/lib/auth";
import { discardDraft, getPublished, publish, saveDraft } from "@/lib/content";
import type { Content } from "@/lib/data";
import { getDb } from "@/lib/db";

export type LoginState = { error?: string } | undefined;
export type SaveState = { ok?: boolean; error?: string; savedAt?: string } | undefined;

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!checkCredentials(username, password)) {
    // ponytail: fixed delay slows guessing; add per-IP lockout if the panel is ever targeted
    await new Promise((r) => setTimeout(r, 1000));
    return { error: "Wrong ID or password." };
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin");
}

export async function save(_: SaveState, formData: FormData): Promise<SaveState> {
  if (!(await isAdmin())) return { error: "Your session expired — please log in again." };
  let input: unknown;
  try {
    input = JSON.parse(String(formData.get("content") ?? ""));
  } catch {
    return { error: "Could not read the form. Please try again." };
  }
  try {
    await publish(input);
  } catch {
    return { error: "Could not save on the server (is the disk writable?)." };
  }
  revalidatePath("/", "layout"); // every public page re-renders with the new content
  return { ok: true, savedAt: new Date().toLocaleTimeString("en-IN") };
}

// Called while the owner types: stores unsaved edits for the live preview only (visitors never see them).
export async function previewDraft(json: string): Promise<{ ok: boolean }> {
  if (!(await isAdmin())) return { ok: false };
  try {
    await saveDraft(JSON.parse(json));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// Throws away unsaved edits and returns the published content.
export async function discardChanges(): Promise<Content | null> {
  if (!(await isAdmin())) return null;
  await discardDraft();
  return getPublished();
}

// --- Enquiries (stored by /api/booking) ---
export async function setEnquiryStatus(id: number, status: "new" | "contacted" | "done") {
  if (!(await isAdmin()) || !["new", "contacted", "done"].includes(status)) return;
  getDb().prepare("UPDATE enquiries SET status = ? WHERE id = ?").run(status, id);
  revalidatePath("/admin", "layout");
}

export async function deleteEnquiry(id: number) {
  if (!(await isAdmin())) return;
  getDb().prepare("DELETE FROM enquiries WHERE id = ?").run(id);
  revalidatePath("/admin", "layout");
}
