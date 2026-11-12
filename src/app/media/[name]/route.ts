import { readUpload } from "@/lib/media";

// Serves photos uploaded from /admin. Names are random and never reused, so they cache forever.
export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const file = await readUpload((await params).name);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file), {
    headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
