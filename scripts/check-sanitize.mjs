// Self-check for the admin-input sanitizer. Run: node scripts/check-sanitize.mjs
import assert from "node:assert/strict";
import { sanitizeContent } from "../src/lib/sanitize.ts";

const def = {
  contact: { phone: "+91900", email: "a@b.c" },
  fleet: [{ id: "sedan", image: "/images/x.webp", km: 10, name: "Sedan", features: ["AC", "Music"] }],
};

// edits to allowed text/number fields go through, trimmed
const ok = sanitizeContent(def, { contact: { phone: " +91987 ", email: "o@x.in" }, fleet: [{ name: "Dzire", km: "12", features: ["A", " ", "B"] }] });
assert.equal(ok.contact.phone, "+91987");
assert.equal(ok.fleet[0].name, "Dzire");
assert.equal(ok.fleet[0].km, 12);
assert.deepEqual(ok.fleet[0].features, ["A", "B"]);

// locked fields, unknown keys, wrong types and extra list items are ignored
const bad = sanitizeContent(def, {
  contact: { phone: 123, evil: "<script>" },
  fleet: [{ id: "hacked", image: "https://evil/x.png", km: "abc", features: "nope" }, { name: "extra" }],
  __proto__: { polluted: true },
});
assert.equal(bad.contact.phone, "+91900");
assert.equal("evil" in bad.contact, false);
assert.equal(bad.fleet[0].id, "sedan");
assert.equal(bad.fleet[0].image, "/images/x.webp");
assert.equal(bad.fleet[0].km, 10);
assert.deepEqual(bad.fleet[0].features, ["AC", "Music"]);
assert.equal(bad.fleet.length, 1);
assert.equal({}.polluted, undefined);

// garbage input falls back to defaults entirely
assert.deepEqual(sanitizeContent(def, null), def);
assert.deepEqual(sanitizeContent(def, "x"), def);

// overlong text is capped
assert.equal(sanitizeContent(def, { contact: { email: "x".repeat(5000) } }).contact.email.length, 2000);

// photos: only the site's own images or admin uploads; photo lists keep their slots
const pics = { hero: "/images/a.webp", images: ["/images/b.webp", "/images/c.webp"] };
const upload = "/media/0123456789abcdef01234567.webp";
assert.equal(sanitizeContent(pics, { hero: upload }).hero, upload);
assert.equal(sanitizeContent(pics, { hero: "/images/other-photo.webp" }).hero, "/images/other-photo.webp");
for (const evil of ["https://evil.com/x.webp", "/media/../../.env", "/images/../data/site.json", "javascript:alert(1)", "/media/short.webp", ""])
  assert.equal(sanitizeContent(pics, { hero: evil }).hero, "/images/a.webp", evil);
assert.deepEqual(sanitizeContent(pics, { images: [upload] }).images, [upload, "/images/c.webp"]);
assert.deepEqual(sanitizeContent(pics, { images: [upload, upload, upload] }).images, [upload, upload]);

console.log("sanitize: all checks passed");
