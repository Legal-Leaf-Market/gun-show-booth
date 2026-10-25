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

Admission is spelled out everywhere an event appears: **$6 at the door, paid to the show (not to you), free for seniors, police and first responders.** Each event can switch to free entry or a different price. A "goods, not guns" note in the footer makes clear you're not a firearms dealer.

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
