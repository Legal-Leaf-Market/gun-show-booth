# CLAUDE.md: Booth Bandits (gun-show-booth)

A phone-first site for a vendor table at Indiana gun shows and pop-up markets:
what's on the table, where the table is next, what it costs to get in. Read
README.md for how it is hosted and edited. This file is the rules, and most
of them were learned the hard way on the sister repos (Crossroads Wedding Co.,
Legal-Leaf Market, Herbal Leaf, Nicotia, Kawaii Katz, Jill's Diner, Heart of
Columbus, Verda Studio). Where a rule came from one of them, it says so.

## Who the owner is

Booth Bandits and CJ's Cakes are the same people under two names. Booth
Bandits is the show table; CJ's Cakes (Columbus, IN) is the baking name, and
the Facebook page linked in `data/site.json` is CJ's. So every baked good on
the site is ours: copy says "we" and "our", the label's producer is CJ's
Cakes, and (812) 561-0549 is the one phone for both. Product facts (prices,
ingredients, net weights) come from the owner or from CJ's own posts and
labels, never from a guess. `docs/CJS_CAKES_HANDOFF.md` lists what is still
missing.

## Standing rules

- **No em dashes anywhere a person reads.** Copy, titles, metadata, alt text,
  error messages, docs. Restructure the sentence with a period, comma, colon
  or parentheses. The only dash allowed is the en dash inside a numeric range
  (24–25, $100–$150). `npm test` fails on an em dash in any text file. (House
  rule across every sister site.)
- **Never invent facts.** No made-up reviews, ratings, follower counts,
  "as seen at", years in business, or show dates. A show goes on the calendar
  because the owner said they are working it. (Jill's Diner, Heart of Columbus.)
- **Samples must read as samples.** Anything with `"sample": true` shows a
  Sample flag, is never marked up for Google, and is removed with one tap from
  the admin page before launch. The `(317) 555-0142` phone is a placeholder
  and `orgLD()` refuses to publish a 555-01xx number.
- **Goods, not guns.** This table is a vendor at gun shows, not a firearms
  dealer. Never write copy, a category, an item or a feature that implies we
  buy, sell, trade, appraise or transfer firearms, ammunition, or regulated
  parts (receivers, frames, suppressor parts, "solvent trap kits", binary
  triggers). The `dealerNote` in `data/site.json` stays in the footer and on
  the printed sign. A request to list one of those is a conversation with the
  owner, not an edit.
- **Admission is paid to the show, not to us.** Every place a price appears
  says so. The show organizer sets the price and who gets in free; we only
  repeat it. Never present admission as something we sell.
- **Markup is a claim.** JSON-LD only says what the page already shows. No
  `AggregateRating` or `Review` (there are none; fabricated rating markup is a
  Google manual action against the whole domain). No `organizer` on an Event:
  the show runs the show. No markup for sample data. (Crossroads §6.2, Gear
  Avail §25.) `test/run.mjs` pins all of this.
- **Fail closed and say so.** A feature whose data is missing renders nothing
  or an honest empty state, never a dead button or a plausible blank. Loading
  says loading; empty says empty. (Verda Studio: a visitor cannot tell slow
  from empty, and empty is the one that makes them leave.)
- **Home-baked food carries its label on the site.** Indiana's home-based
  vendor law (IC 16-42-5.3-5) requires the label of each home-baked product
  on the vendor's website, with a fixed statement in at least 10 pt type.
  `B.HBV_STATEMENT` in `booth.js` is the one copy of that sentence; the item
  sheet, the admin and `brand/06-print/baked-goods-label-indiana.svg` all
  use it, and `npm test` fails if the printed label drifts from it or drops
  below 10 pt. The wording is from the 2023-2024 code text ("Indiana
  Department of Health"); a 2026 bill touched this chapter, so confirm it
  against the current code before printing.
- **Today is Indiana's today.** `B.today()` reads America/Indiana/Indianapolis,
  so a phone set to another zone cannot move a show to tomorrow. (Jill's Diner.)
- **Stay dependency-free and build-free.** Plain HTML, CSS and JS. Third-party
  code is vendored into `assets/vendor/` with its licence (Leaflet, the QR
  generator). Do not add a framework, bundler or npm dependency. (Legal-Leaf
  and Nicotia both have a deploy outage on record from a build pipeline
  appearing where none was meant to be.)

## Things that fail silently, and where the guard is

| If you... | What breaks, quietly | Guard |
|---|---|---|
| add a file meant for us (notes, docs, scripts) | it is served publicly, because Netlify publishes the repo root | 404 rules in `netlify.toml`; `npm test` lists any uncovered file |
| change the site name | the share card still shows the old one in every group chat | run `python3 tools/branding.py`; never hand-edit a PNG |
| change the domain | og tags, robots.txt and sitemap.xml disagree | `npm test` checks they name one host |
| give `event.html` a fixed `og:url` | every shared show unfurls as, and canonicalises to, one page | `npm test` |
| edit the recurring-date math | a ticket shows the wrong Saturday, nothing errors | date cases in `test/run.mjs`, including a DST crossing and a 5th-Saturday month |
| show a brand SVG on the site through `<img>` | an `<img>` cannot load web fonts, so live text falls back to a generic face and the wordmark clips | only copy `-outlined` twins into `assets/img/`; `npm test` fails on live `<text>` there |
| edit a source SVG in `brand/` | its `-outlined` twin and its PNG are now stale, and the print shop gets the old one | re-run `tools/outline_svg.py brand` and re-render the rasters; `npm test` fails on an outlined twin with live text |
| reorder `<script>` tags | `goods.js` loads before `booth.js` and `window.Booth` is undefined | manual: load every page |

## Layout

```
index.html, goods.html, events.html, event.html   customer pages
sign.html            printable table sign (Letter, one page, QR to the site). noindex
404.html             what Netlify serves for unknown and blocked paths
admin/               owner's phone admin; saves are GitHub commits
data/*.json          the whole catalogue: site, items, events
assets/booth.js      data, dates, tickets, admission, JSON-LD, map, .ics
assets/goods.js      goods grid and item sheet
assets/admin.js      admin and GitHub saving
tools/branding.py    rebuilds og.png and the icons from site.json
tools/outline_svg.py turns live text in brand/ SVGs into real outlines (-outlined twins)
brand/               the full asset library (logos, icons, social, print, merch). Not served
assets/img/          the few brand pieces the site itself shows. Outlined copies only
test/run.mjs         zero-dependency checks (npm test)
docs/                briefs for other AIs, the research report's show leads. Not served
```

## Checking work

1. `npm test` must pass.
2. Serve the folder (`python3 -m http.server`) and load every page at 390px
   and 1280px: no horizontal scroll, no console errors (blocked map tiles
   excepted). Use `/opt/pw-browsers/chromium` with Playwright, which is
   preinstalled.
3. After touching `sign.html`, print to PDF and confirm it is one page.
4. After touching `data/site.json` name or tagline, run `npm run branding`
   and look at `assets/og.png`.
