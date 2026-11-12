// Single-owner admin login. Credentials come from env (ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_SECRET);
// a successful login sets an HMAC-signed, httpOnly cookie holding only an expiry time.
import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "crypto";

const COOKIE = "aas_admin";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function secret() {
  const s = process.env.ADMIN_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SECRET must be set (32+ characters) in .env.local");
  return s;
}

// Constant-time compare that also hides length differences.
function same(a: string, b: string) {
  const h = (v: string) => createHash("sha256").update(v).digest();
  return timingSafeEqual(h(a), h(b));
}

// Password is part of the signature, so changing it logs out every existing session.
const sign = (exp: string) => createHmac("sha256", secret()).update(`${exp}.${process.env.ADMIN_PASSWORD}`).digest("base64url");

export function checkCredentials(username: string, password: string) {
  const u = process.env.ADMIN_USERNAME;
  const p = process.env.ADMIN_PASSWORD;
  if (!u || !p) return false;
  return same(username, u) && same(password, p);
}

export async function createSession() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function isAdmin() {
  const value = (await cookies()).get(COOKIE)?.value;
  const [exp, sig] = value?.split(".") ?? [];
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return same(sig, sign(exp));
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}
