// Server-side content store: the owner's edits from /admin, saved as JSON on disk.
//   data/site.json  — published content, what visitors see
//   data/draft.json — unsaved edits, shown only to the logged-in owner in preview (Next draft mode)
// ponytail: JSON files need a persistent disk (VPS / `next start`); on serverless hosts
// (Vercel, Netlify) swap readFile/writeFile for a database or blob store.
import { cache } from "react";
import { draftMode } from "next/headers";
import { mkdir, readFile, rename, rm, writeFile } from "fs/promises";
import path from "path";
import { DATA_DIR } from "./data-dir";
import { DEFAULT_CONTENT, type Content } from "./data";
import { sanitizeContent } from "./sanitize";
import { isAdmin } from "./auth";

const DIR = DATA_DIR;
const PUBLISHED = path.join(DIR, "site.json");
const DRAFT = path.join(DIR, "draft.json");

async function read(file: string): Promise<Content | null> {
  try {
    return sanitizeContent(DEFAULT_CONTENT, JSON.parse(await readFile(file, "utf8")));
  } catch {
    return null; // missing or unreadable
  }
}

async function write(file: string, input: unknown): Promise<Content> {
  const content = sanitizeContent(DEFAULT_CONTENT, input);
  await mkdir(DIR, { recursive: true });
  // write-then-rename so a crash mid-write can't leave a half-written file
  await writeFile(file + ".tmp", JSON.stringify(content, null, 2));
  await rename(file + ".tmp", file);
  return content;
}

export const getPublished = async () => (await read(PUBLISHED)) ?? DEFAULT_CONTENT;
export const getDraft = () => read(DRAFT);

// What the site renders. Draft mode is only ever on in the owner's browser (enabled by
// /api/preview after an admin check), so cookies() is never touched during static renders.
export const getContent = cache(async (): Promise<Content> => {
  if ((await draftMode()).isEnabled && (await isAdmin())) return (await getDraft()) ?? getPublished();
  return getPublished();
});

export const saveDraft = (input: unknown) => write(DRAFT, input);
export const discardDraft = () => rm(DRAFT, { force: true });

export async function publish(input: unknown): Promise<Content> {
  const content = await write(PUBLISHED, input);
  await discardDraft();
  return content;
}

export async function isPreviewing() {
  return (await draftMode()).isEnabled && (await getDraft()) !== null && (await isAdmin());
}
