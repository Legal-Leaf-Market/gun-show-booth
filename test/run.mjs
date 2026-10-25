// Zero-dependency checks for the paths that fail silently.
//   node test/run.mjs      (or: npm test)
// Every one of these is a mistake that ships without an error: a wrong date
// on a ticket, an em dash in copy, a missing photo, a repo note served to
// the public. Add a case whenever something like that is found by eye.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
let failed = 0, passed = 0;
const ok = (cond, msg) => { if (cond) passed++; else { failed++; console.log("FAIL", msg); } };
const eq = (a, b, msg) => ok(a === b, `${msg}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);

/* ---------- Load booth.js the way a browser would ---------- */
const window = {};
const document = { documentElement: { dataset: {} } };
const location = { origin: "https://booth-bandits.netlify.app", pathname: "/event.html" };
new Function("window", "document", "location", read("assets/booth.js"))(window, document, location);
const B = window.Booth;
const d = B.parse;
const starts = (ev, from, to) => B.occurrences(ev, d(from), d(to)).map((o) => B.iso(o.start));

/* ---------- Recurring dates ---------- */
const fourthSat = { id: "x", title: "x", repeat: { every: "month", nth: 4, weekday: 6, days: 2, start: "2026-10-01" } };
eq(starts(fourthSat, "2026-10-01", "2027-01-31").join(), "2026-10-24,2026-11-28,2026-12-26,2027-01-23", "4th Saturday each month");
eq(B.iso(B.occurrences(fourthSat, d("2026-10-25"), d("2026-10-31"))[0].end), "2026-10-25", "a show still running on its Sunday is still upcoming");
const lastSun = { id: "y", title: "y", repeat: { every: "month", nth: -1, weekday: 0, start: "2026-01-01" } };
eq(starts(lastSun, "2026-11-01", "2026-12-31").join(), "2026-11-29,2026-12-27", "last Sunday each month");
const fifthSat = { id: "z", title: "z", repeat: { every: "month", nth: 5, weekday: 6, start: "2026-01-01" } };
eq(starts(fifthSat, "2026-10-01", "2026-12-31").join(), "2026-10-31", "a 5th Saturday only exists in some months");
const everyOther = { id: "w", title: "w", repeat: { every: "week", interval: 2, weekday: 0, start: "2026-10-25" } };
// Crosses the Nov 1 2026 DST change: day math must not drift by an hour into the wrong date.
eq(starts(everyOther, "2026-10-20", "2026-11-30").join(), "2026-10-25,2026-11-08,2026-11-22", "every other Sunday across DST");
const skipped = { ...fourthSat, skip: ["2026-11-28"] };
eq(B.upcoming([skipped], { from: d("2026-11-01"), days: 60 }).map((o) => B.iso(o.start)).join(), "2026-12-26", "a cancelled weekend drops out of upcoming");
eq(B.upcoming([skipped], { from: d("2026-11-01"), days: 60, includeCancelled: true }).length, 2, "but is still known to the calendar");
const until = { ...fourthSat, repeat: { ...fourthSat.repeat, until: "2026-11-30" } };
eq(starts(until, "2026-10-01", "2027-03-01").length, 2, "until stops a series");
eq(starts({ id: "o", title: "o", dates: [{ start: "2026-12-05", end: "2026-12-06" }] }, "2026-12-06", "2026-12-31").join(), "2026-12-05", "a one-off spanning into the window counts");

/* ---------- How-soon chip ---------- */
const occ = (s, e) => ({ start: d(s), end: d(e || s) });
eq(B.soon(occ("2026-10-24", "2026-10-25"), d("2026-10-25")), "We're there today", "Sunday of a two-day show is today");
eq(B.soon(occ("2026-10-24"), d("2026-10-23")), "Tomorrow", "tomorrow");
eq(B.soon(occ("2026-10-24"), d("2026-10-20")), "This weekend", "Saturday seen from Tuesday");
eq(B.soon(occ("2026-10-25"), d("2026-10-20")), "This weekend", "Sunday counts as this weekend");
eq(B.soon(occ("2026-10-31"), d("2026-10-25")), "In 6 days", "Saturday seen from the Sunday before is next weekend, not this one");
eq(B.soon(occ("2026-11-20"), d("2026-10-25")), "", "far out says nothing");
eq(B.soon({ ...occ("2026-10-24"), cancelled: true }, d("2026-10-24")), "", "a cancelled show is never 'today'");

/* ---------- Admission ---------- */
const site = JSON.parse(read("data/site.json"));
eq(B.admission({ admission: { mode: "free" } }, site).headline, "Free entry", "free event");
eq(B.admission({ admission: { mode: "standard" } }, site).headline, "$6 at the door", "standard price comes from site.json");
eq(B.admission({ admission: { mode: "custom", price: 8 } }, site).headline, "$8 at the door", "custom price");
eq(B.admission({ admission: { mode: "custom", price: "" } }, site).price, 6, "a blank custom price falls back to the usual one");

/* ---------- Structured data: a claim must be true ---------- */
const evs = JSON.parse(read("data/events.json"));
const fixture = { ...fourthSat, id: "fixture-show", title: "Fixture Show", venue: "Hall", address: "1 Main St, Columbus, IN", lat: 39.2, lng: -85.9, admission: { mode: "standard" } };
const real = { ...fixture, sample: false, id: "real-show" };
eq(B.eventLD({ ...fixture, sample: true }, B.occurrences(fixture, d("2026-10-01"), d("2027-01-01")), site), null, "a sample event is never marked up");
const ld = B.eventLD({ ...real, skip: ["2026-11-28"] }, B.occurrences({ ...real, skip: ["2026-11-28"] }, d("2026-10-01"), d("2027-01-01")), site);
ok(Array.isArray(ld) && ld.length > 1, "a real event produces one Event per date");
ok(ld.every((e) => !("organizer" in e) && !("aggregateRating" in e) && !("review" in e)), "no organizer (the show runs it) and no ratings (there are none)");
ok(ld.some((e) => /EventCancelled/.test(e.eventStatus)), "a skipped weekend is marked cancelled, not dropped silently");
eq(ld[0].offers?.price, "6", "offer price matches the admission shown on the page");
eq(B.orgLD(site).telephone, undefined, "a 555-01xx placeholder phone is not published as a contact");
eq(B.phone({ phone: "(317) 555-0142" }), "", "the placeholder phone reads as no phone");
eq(B.phone({ phone: "(317) 555-2368" }), "(317) 555-2368", "a real 555 exchange outside 01xx is kept");
eq(B.email({ email: "hello@example.com" }), "", "an example.com address reads as no email");
eq(B.email({ email: "hi@boothbandits.com" }), "hi@boothbandits.com", "a real address is kept");
eq(B.contactButtons({ phone: "(317) 555-0142", email: "hello@example.com" }), "", "placeholders make no Call, Text or Email button");
eq(B.smsAbout({ phone: "(317) 555-0142" }, "hi"), "", "the item sheet offers no text to a placeholder");
ok(B.contactButtons({ phone: "(317) 555-2368" }).includes('href="tel:3175552368"'), "a real phone gets a Call button");

/* ---------- Home-based vendor label (IC 16-42-5.3-5) ---------- */
ok(/^This product is home produced and processed and the production area has not been inspected by the Indiana Department of Health\. NOT FOR RESALE\.$/.test(B.HBV_STATEMENT), "the statutory statement is word for word");
const baked = { title: "Cookies", homeBaked: true, ingredients: "", netWt: "6 cookies" };
eq(B.labelGaps(baked, { producer: {} }).length, 2, "missing ingredients and producer are both reported");
eq(B.labelGaps({ ...baked, ingredients: "Flour, butter" }, { producer: { name: "A", address: "B" } }).length, 0, "a complete label has no gaps");
eq(B.labelGaps({ title: "Coasters" }, {}).length, 0, "non-food items need no label");
const box = B.labelBox(baked, { producer: {} });
ok(box.includes("NOT FOR RESALE.") && box.includes("Ask at the table"), "the label shows the statement and says what is missing instead of dropping the line");
eq(B.labelBox({ title: "Coasters" }, {}), "", "no label box on a non-food item");
// The printed Indiana label must carry the same sentence as the site.
const printed = [...read("brand/06-print/baked-goods-label-indiana.svg").matchAll(/<text[^>]*font-weight="600"[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]).join(" ").replace(/\s+/g, " ");
ok(printed.includes(B.HBV_STATEMENT), "the printed label's statement matches B.HBV_STATEMENT");
const stmtSize = [...read("brand/06-print/baked-goods-label-indiana.svg").matchAll(/font-size="([\d.]+)"[^>]*>(?:This product|processed|has not|Department|RESALE)/g)].map((m) => +m[1]);
ok(stmtSize.length && stmtSize.every((v) => v >= 13.9), "printed statement is at least 10 pt (13.9 units at 100 per inch)");

/* ---------- Data files ---------- */
const items = JSON.parse(read("data/items.json"));
const ids = (list) => list.map((x) => x.id);
eq(new Set(ids(items)).size, items.length, "item ids are unique");
eq(new Set(ids(evs)).size, evs.length, "event ids are unique (shared links key on them)");
for (const it of items) {
  ok(["available", "sold", "hidden"].includes(it.status), `item ${it.id} has a known status`);
  for (const p of it.photos || []) ok(/^https?:/.test(p) || existsSync(join(ROOT, p)), `item ${it.id} photo exists: ${p}`);
}
for (const ev of evs) {
  ok((ev.dates || []).length || ev.repeat, `event ${ev.id} has dates or a pattern`);
  ok(["standard", "free", "custom"].includes((ev.admission || { mode: "standard" }).mode), `event ${ev.id} admission mode is known`);
  for (const s of ev.skip || []) ok(!!d(s), `event ${ev.id} skip date is YYYY-MM-DD: ${s}`);
}

/* ---------- House style: no em dashes anywhere a person reads ---------- */
const walk = (dir) => readdirSync(join(ROOT, dir)).flatMap((f) => {
  const rel = dir ? `${dir}/${f}` : f;
  if ([".git", "vendor", "fonts", "node_modules"].includes(f)) return [];
  return statSync(join(ROOT, rel)).isDirectory() ? walk(rel) : [rel];
});
const files = walk("");
const human = files.filter((f) => [".html", ".js", ".json", ".css", ".md", ".svg", ".toml", ".txt", ".xml", ".py", ".mjs"].includes(extname(f)));
for (const f of human) {
  const n = (read(f).match(/\u2014/g) || []).length;
  ok(n === 0, `${f} has ${n} em dash(es). Use a period, comma, colon or parentheses`);
}

/* ---------- Repo-only files stay off the public site ---------- */
const toml = read("netlify.toml");
const hidden = [...toml.matchAll(/from = "([^"]+)"[\s\S]*?status = 404[\s\S]*?force = true/g)].map((m) => m[1]);
const covered = (f) => hidden.some((h) => (h.endsWith("/*") ? ("/" + f).startsWith(h.slice(0, -1)) : "/" + f === h));
for (const f of files.filter((f) => f.endsWith(".md") || /^(docs|test|tools|brand)\//.test(f) || f === "package.json"))
  ok(covered(f), `${f} would be served publicly. Add a 404 rule to netlify.toml`);
ok(existsSync(join(ROOT, "404.html")), "404.html exists for those rules to point at");

/* ---------- Images the site loads through <img> ---------- */
// An <img> cannot load web fonts, so live <text> in one of these renders in a
// fallback face. Copy the -outlined twin from brand/, never the source.
for (const f of files.filter((f) => /^assets\/img\/.*\.svg$/.test(f)))
  ok(!/<text\b/.test(read(f)), `${f} has live <text>; use the -outlined twin from brand/ (python3 tools/outline_svg.py brand)`);
for (const f of files.filter((f) => /^brand\/.*-outlined\.svg$/.test(f)))
  ok(!/<text\b/.test(read(f)), `${f} claims to be outlined but still has live text`);

/* ---------- Share card and icons ---------- */
const png = (p) => { const b = readFileSync(join(ROOT, p)); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
for (const [p, w, h] of [["assets/og.png", 1200, 630], ["assets/apple-touch-icon.png", 180, 180], ["assets/icon-192.png", 192, 192], ["assets/icon-512.png", 512, 512]]) {
  ok(existsSync(join(ROOT, p)), `${p} exists (run python3 tools/branding.py)`);
  if (existsSync(join(ROOT, p))) { const s = png(p); ok(s.w === w && s.h === h, `${p} is ${w}x${h}`); }
}
const SITE = "https://booth-bandits.netlify.app";
for (const f of ["index.html", "goods.html", "events.html", "event.html"]) {
  const s = read(f);
  ok(s.includes(`property="og:image" content="${SITE}/assets/og.png"`), `${f} has an absolute og:image on ${SITE}`);
}
ok(read("robots.txt").includes(SITE) && read("sitemap.xml").includes(SITE), "robots.txt and sitemap.xml name the same host as og:url");
ok(!read("event.html").includes('property="og:url"'), "event.html has no fixed og:url (it would make every shared show canonical to one page)");

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
