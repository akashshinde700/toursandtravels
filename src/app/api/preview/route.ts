import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

// Turns on draft mode for the logged-in owner and opens a site page, e.g. /api/preview?path=/tariffs
export async function GET(request: Request) {
  if (!(await isAdmin())) return new Response("Not logged in", { status: 401 });
  const target = new URL(request.url).searchParams.get("path") ?? "/";
  // only same-site paths, never an open redirect
  const safe = target.startsWith("/") && !target.startsWith("//") ? target : "/";
  (await draftMode()).enable();
  redirect(safe);
}
