# Gun show booth site

A phone-first site for a vendor table at gun shows and markets. Customers see what's on the table, where you'll be next, what it costs to get in, and how to reach you. You add items and events from your phone.

No Shopify, no database, no build step. Plain HTML, CSS and JavaScript that runs on GitHub Pages (or Netlify/Vercel connected to this repo).

## What's on it

| Page | What customers get |
|------|--------------------|
| `index.html` | Business name, the next show as a big ticket, featured goods, upcoming shows, admission explainer, contact buttons |
| `goods.html` | Every item with photos and prices, category filters, "Text us about this" button |
| `events.html` | Month calendar, map of venues, every show with its next date |
| `event.html?e=<id>` | One page per event to link and share: dates, hours, address, map, Google/Apple directions, add to calendar, admission |
| `admin/` | Owner-only page for adding items, events and business info from a phone |
| `sign.html` | Printable Letter-size table sign: your next four dates, "text us to hold it", and a QR code to the site. Linked from the admin Events tab |

When you're at a show today, the home page says so at the top ("At Sample Expo Hall today") and the ticket gets a "We're there today" tag. "Tomorrow" and "This weekend" show the same way. Times are Indiana time whatever the phone is set to.

Real (non-sample) events tell Google their dates, place and admission, so they can show up in event search. Sample data never does.

Admission is spelled out everywhere an event appears: **$6 at the door, paid to the show (not to you), kids 12 and under free.** That default matches what Central Indiana Gun Shows publishes; set a per-event price for shows like the Indy 1500. Each event can switch to free entry or a different price. A "goods, not guns" note in the footer makes clear you're not a firearms dealer.

## Put it online (Netlify)

The Netlify project is `booth-bandits` on the Legal-Leaf-Market team, at https://booth-bandits.netlify.app.

1. Push this folder to the GitHub repo `Legal-Leaf-Market/gun-show-booth`.
2. In Netlify, open the `booth-bandits` project, go to **Project configuration → Build & deploy → Link repository**, and pick `gun-show-booth`. Leave the build command empty; `netlify.toml` already says to serve the repo root.
3. Every push to `main` (including saves from the phone admin) redeploys the site in about a minute.
4. Optional: add a domain like `boothbandits.shop` under **Domain management**.

GitHub Pages also works if you'd rather: Settings → Pages → deploy from `main`, root folder.

## Manage it from your phone

1. Open `/admin/` on the live site.
2. Make a fine-grained GitHub token: **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**. Give it access to only this repo, with **Contents: Read and write**. Nothing else.
3. On the admin page's **Connect** tab, enter the owner, repo, branch (`main`) and token, then tap **Connect and test**. The token is stored only in that phone's browser.
4. Add the admin page to your home screen (Share → Add to Home Screen) so it opens like an app.

From then on:

- **Goods**: tap Add an item, snap or pick photos, add a name and price, save. Photos are shrunk to 1600px before upload. "Mark sold" is one tap from the list.
- **Events**: pick specific dates for pop-ups, or a pattern for regular shows ("4th Saturday, lasts 2 days, every month"). Mark single weekends as cancelled without deleting the series. "Find on map" pins the address.
- **Business**: name, tagline, phone, email, social links, payment methods, categories, the usual admission price and who gets in free.

Every save is a commit to this repo, so the site updates about a minute later and you have a full history of changes.

The samples (marked "Sample") are placeholders. Remove them all with the link at the top of the Goods or Events tab.

## Editing by hand

Everything lives in three files:

- `data/site.json`: name, contact, admission defaults, not-a-dealer note
- `data/items.json`: goods. `status` is `available`, `sold` or `hidden`
- `data/events.json`: events. Use `dates` for one-offs, or `repeat` for patterns:
  - `{ "every": "month", "nth": 2, "weekday": 6, "days": 2 }` is the 2nd Saturday and Sunday every month (`nth: -1` for the last one)
  - `{ "every": "week", "interval": 2, "weekday": 0, "start": "2026-11-01" }` is every other Sunday
  - Weekdays: 0 Sunday through 6 Saturday. `skip` lists start dates of cancelled weekends.

Event links use the event's `id`, which doesn't change when you rename the event, so shared links keep working.

## Storefront and show requests

`cakes.html` is the CJ's Cakes bakery page. Product cards link to `product.html?item=<id>`, with descriptions, photos, food labels and request forms. A `show=<event-id>` query preselects the next valid pickup day for that show. Finished, cancelled and sample dates cannot be selected. Preparing a request sends nothing: customers send it in their own texting app or copy it into a Facebook message. A reply confirms the hold or order. There is no inbox or payment backend.

Coasters and merch remain unlisted until real photos, prices and specifications are supplied. Missing lead times and delivery charges are confirmed by inquiry. Do not invent them. Add individual cookie photos and a full booth photo when available. Keep the product URLs in `sitemap.xml` current when publishing new items.

## Custom orders

Items with an `order` block in `data/items.json` (the custom cakes and cupcakes) get a **Start an order** button: size, date, flavor, icing, design, pickup or delivery. It writes a text message in the customer's own texting app, addressed to the site phone. Nothing is sent or stored by the site. `goods.html?item=<id>` redirects to the product page, and adding `&order=1` opens its order form, so a link can go in a Facebook post. The order options must match the item's own description; `npm test` checks the sizes and prices.

## Cake designer

`cake-builder.html` lets a customer try a round or sheet cake: size (read from the custom cake items), flavor, icing, colors, border and a message. They save a PNG preview and copy a summary to text or message us. Nothing is sent or stored by the site. It is linked from `cakes.html` as Design your cake.

It can also put a customer's photo on top of the preview. That step is hidden until `photoToppers` in `data/site.json` is `true`, because nobody has confirmed CJ's makes edible-photo toppers. Turn it on only once the owner says yes, and then add the sizes, lead time and fee to the item descriptions. The photo never leaves the customer's browser either way.

`assets/img/market/` is the decorative bakery art (24 motifs in color, cream and olive, plus borders and a pattern). `assets/img/market/index.html` shows them all. Decoration only: none of it is a product photo.

## Photo gallery

The bottom of `goods.html` shows all 27 photos from CJ's Facebook page in three groups: **From our kitchen and table** (made by CJ's Cakes), **CJ's cake decorating** (cakes she decorated while working in a supermarket bakery, labelled as not on our menu) and **From our Facebook page** (logo, posts and menus, shown uncropped; the earlier $6 mini cake menu is captioned as old prices).

- `docs/cjs-cakes-photos.json` is the record of all 27 photos from the CJ's Cakes Facebook Photos tab: source page, hash, what each shows, its gallery group, alt text and caption.
- `assets/img/cjs-cakes/originals/` keeps the Facebook files byte for byte. They are not served.
- `python3 tools/cjs_photos.py` turns the gallery photos into AVIF, WebP and JPEG copies (480, 960 and 1440 px) in `assets/img/cjs-cakes/` and writes `data/gallery.json`. To add, remove or recaption a photo, edit the record and run it. `npm test` checks the record, the files and the page agree.

## Checks and brand files

- `npm test` runs `test/run.mjs` (no install needed): recurring-date math, data sanity, no em dashes, nothing private served, share card present.
- `npm run branding` (Python with Pillow) rebuilds the share card and icons from `data/site.json`. Run it after renaming the business.
- `brand/` is the full asset library (logos, icons, social templates, print pieces, merch art). Open the files in `brand/` for printing and posting. For print shops, send the `-outlined.svg` versions: their text is converted to shapes, so they print right without the fonts installed. After editing a source SVG, run `python3 tools/outline_svg.py brand` (needs `pip install fonttools`). `brand/` is blocked from the live site.
- `docs/` holds briefs for other AIs: the asset list for ChatGPT, its round-two follow-up, and a market-research brief for Gemini. They are blocked from the live site.

## Under the hood

- `assets/booth.js`: data loading, recurring-date math, tickets, map, calendar file
- `assets/goods.js`: goods grid and item sheet
- `assets/admin.js`: the phone admin and GitHub saving
- Fonts (Big Shoulders, Barlow) and Leaflet are bundled, so nothing loads from outside except OpenStreetMap tiles on the map
