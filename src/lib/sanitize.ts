// Merges untrusted admin input over the default content. The defaults define the shape:
// only fields that exist there are kept, each must match its default's type, list lengths of
// objects (cars, routes…) are fixed, and LOCKED fields (ids, styling) always come from code.
// A field whose default is an image path only accepts the site's own images or admin uploads.
const LOCKED = new Set(["id", "cut", "car", "accent", "grade"]);
const MAX_TEXT = 2000;
const MAX_LIST = 20;
export const IMAGE_PATH = /^\/(images\/[\w-]+(\/[\w-]+)*|media\/[a-f0-9]{24})\.(webp|jpg|jpeg|png)$/;

const isImage = (v: unknown): v is string => typeof v === "string" && IMAGE_PATH.test(v);

export function sanitizeContent<T>(def: T, input: unknown, key = ""): T {
  if (LOCKED.has(key)) return def;
  if (isImage(def)) return (isImage(input) ? input : def) as T;
  if (typeof def === "string") return (typeof input === "string" ? input.trim().slice(0, MAX_TEXT) : def) as T;
  if (typeof def === "number") {
    const n = typeof input === "number" ? input : typeof input === "string" && input.trim() !== "" ? Number(input) : NaN;
    return (Number.isFinite(n) ? n : def) as T;
  }
  if (Array.isArray(def)) {
    // lists of plain text (e.g. car features) may grow or shrink; photo lists keep their slots
    if (def.every((v) => typeof v === "string" && !isImage(v))) {
      if (!Array.isArray(input)) return def;
      return input
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim().slice(0, MAX_TEXT))
        .filter(Boolean)
        .slice(0, MAX_LIST) as T;
    }
    const arr = Array.isArray(input) ? input : [];
    return def.map((d, i) => sanitizeContent(d, arr[i])) as T;
  }
  if (def && typeof def === "object") {
    const obj = input && typeof input === "object" && !Array.isArray(input) ? (input as Record<string, unknown>) : {};
    return Object.fromEntries(Object.entries(def).map(([k, v]) => [k, sanitizeContent(v, obj[k], k)])) as T;
  }
  return def;
}
