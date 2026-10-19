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

Admission is spelled out everywhere an event appears: **$6 at the door, paid to the show (not to you), free for seniors, police and first responders.** Each event can switch to free entry or a different price. A "goods, not guns" note in the footer makes clear you're not a firearms dealer.

## Put it online (GitHub Pages)

1. Create an empty repo, for example `Legal-Leaf-Market/gun-show-booth`, and push this folder to it.
2. In the repo, go to **Settings → Pages**, set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
3. After a minute it's live at `https://legal-leaf-market.github.io/gun-show-booth/`.
4. Optional: to use a domain like `yourbrand.shop`, add it under Settings → Pages → Custom domain and point the domain's DNS at GitHub Pages.

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

## Under the hood

- `assets/booth.js`: data loading, recurring-date math, tickets, map, calendar file
- `assets/goods.js`: goods grid and item sheet
- `assets/admin.js`: the phone admin and GitHub saving
- Fonts (Big Shoulders, Barlow) and Leaflet are bundled, so nothing loads from outside except OpenStreetMap tiles on the map
