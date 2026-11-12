// Photos uploaded from /admin. Re-encoded with sharp (checks it's a real image, strips metadata,
// caps the size), stored in data/uploads and served by app/media/[name]/route.ts.
import { mkdir, readFile, writeFile } from "fs/promises";
import { randomBytes } from "crypto";
import path from "path";
import { DATA_DIR } from "./data-dir";
import sharp from "sharp";

const DIR = path.join(DATA_DIR, "uploads");
const NAME = /^[a-f0-9]{24}\.webp$/;
export const MAX_UPLOAD = 15 * 1024 * 1024;

export async function saveUpload(file: File): Promise<string> {
  const webp = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate() // respect phone camera orientation
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const name = `${randomBytes(12).toString("hex")}.webp`;
  await mkdir(DIR, { recursive: true });
  await writeFile(path.join(DIR, name), webp);
  return `/media/${name}`;
}

export async function readUpload(name: string): Promise<Buffer | null> {
  if (!NAME.test(name)) return null; // also blocks ../ path tricks
  try {
    return await readFile(path.join(DIR, name));
  } catch {
    return null;
  }
}
