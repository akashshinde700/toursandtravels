import { isAdmin } from "@/lib/auth";
import { MAX_UPLOAD, saveUpload } from "@/lib/media";

// Photo upload for the admin panel (a route handler, because Server Actions cap bodies at 1 MB).
export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });
  // same-origin only (the session cookie is SameSite=Strict too)
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) return Response.json({ error: "Bad origin" }, { status: 403 });

  const file = (await request.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No photo received." }, { status: 400 });
  if (file.size > MAX_UPLOAD) return Response.json({ error: "Photo is too large (max 15 MB)." }, { status: 413 });
  if (!/^image\/(jpeg|png|webp|heic|heif|avif)$/.test(file.type)) return Response.json({ error: "Please choose a JPG, PNG or WebP photo." }, { status: 415 });

  try {
    return Response.json({ url: await saveUpload(file) });
  } catch {
    return Response.json({ error: "That file doesn't look like a photo." }, { status: 400 });
  }
}
