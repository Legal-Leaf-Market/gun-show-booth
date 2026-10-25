# CJ's Cakes handoff (for Claude Code)

Written by the Cowork session on Oct 25, 2026, which pulled the CJ's Cakes
Facebook page into the site but has no git access to this repo. Its commits
went to `main` through GitHub's web upload. **Pull `main` before you push
anything**, or your push will be rejected (or worse, a force push will undo
the baked goods).

## Who the owner is

Booth Bandits and CJ's Cakes are the same people under two names. Booth
Bandits is the show table; CJ's Cakes (Columbus, IN) is the baking name.
Facebook: https://www.facebook.com/profile.php?id=61579098458408 (CJ's page).
(812) 561-0549 is the one phone for both. This is now in `CLAUDE.md` too.

## What is already on main

| Commit | What it did |
|---|---|
| Add CJ's Cakes product photos from Facebook | 13 photos in `images/items/` |
| Put CJ's Cakes baked goods on the site | 9 items in `data/items.json`; Facebook link, About and producer in `data/site.json` |
| Pin the placeholder phone test to a fixture | `test/run.mjs` no longer assumes `site.json` holds the 555 placeholder |
| Use (812) 561-0549 and write the copy as one business | phone set, About and item copy say "we" |
| Note that Booth Bandits and CJ's Cakes are one owner | `CLAUDE.md` section, this file |

The 9 items, all `homeBaked: true`, category Baked goods:

| id | Price on site | Where the price came from |
|---|---|---|
| chocolate-oreo-mini-cake | $5 (3 for $10) | CJ's market sign, Nov 8, 2025 |
| butterfinger-mini-cake | $5 (3 for $10) | same |
| vanilla-sprinkle-mini-cake | $5 (3 for $10) | same |
| jumbo-chocolate-chip-cookie | $3 | CJ's cookie menu, Nov 8, 2025 |
| jumbo-peanut-butter-cookie | $3 | same |
| jumbo-oatmeal-raisin-cookie | $3 | same |
| cupcakes | 6 for $8 (12 for $15, 24 for $30) | CJ's price list, Aug 9, 2025 |
| custom-round-cake | From $25 (6/8/10 inch: $25/$30/$35) | same |
| custom-sheet-cake | From $20 (1/8, 1/4, 1/2, full: $20/$40/$60/$80) | same |

An older CJ's graphic (Aug 30, 2025) priced the mini cakes at $6 each or 4
for $20. The site uses the newer sign.

## What needs the owner (ask, then edit the data files)

None of these can be filled from the Facebook page. Do not guess them; the
house rule is never invent facts. The admin shows a "Label incomplete" pill
on every item still missing something.

1. **Ingredients** for the three jumbo cookies, the cupcakes, the custom
   round cake and the custom sheet cake. Field: `ingredients` in
   `data/items.json`. The label box on the site says "Ask at the table"
   until it is filled.
2. **Mini cake ingredients are one shared list.** All three mini cakes carry
   CJ's posted label word for word, including "(for chocolate items)" and
   "(for Butterfinger items)". That list does not mention the Oreo cookies on
   the Chocolate Oreo or the sprinkles on the Vanilla Sprinkle. Ask the owner
   for one complete list per flavor, Oreo and sprinkle sub-ingredients
   included, and replace each item's `ingredients`.
3. **Vanilla Sprinkle net weight.** The Chocolate Oreo and Butterfinger table
   cards say 7 oz (198 g); no card for Vanilla Sprinkle was visible. Field:
   `netWt`.
4. **Producer address.** Settled by the owner (Oct 25, 2026): labels say
   "Columbus, IN", no street address. `site.json` `producer.address` stays
   as it is.
5. **Email.** `site.json` `email` is still the `hello@example.com`
   placeholder, so the site shows no Email button. Ask for the real one.
6. **Current prices.** Every price above is 11 to 14 months old. Confirm
   them.
7. **CJ's printed sign uses old label wording** ("made in a home kitchen not
   inspected by the Indiana State Department of Health"). The statute's
   sentence is `B.HBV_STATEMENT` in `assets/booth.js`, and the printable
   label is `brand/06-print/baked-goods-label-indiana.svg`. Point the owner
   to that label for packages at shows.

## Photos that were left off on purpose

The Facebook page has 27 photos. 13 are on the site (home kitchen and market
table shots). Left off:

- **Summer and birthday cakes on steel bakery tables** (Hello Summer sheet
  cake, sunshine cupcake cake, popsicle cake, colorful cake with cupcakes,
  balloon cake, heart cake, Indiana birthday cake, berry cake, soccer cake).
  One shows a Walmart-labeled bottle in the background, so they may have been
  made at a store bakery, not in the home kitchen the label covers. If the
  owner says they were made at home, they can go on the custom cake items.
  The owner has the originals and can add them from the phone admin;
  Claude Code's container cannot reach Facebook.
- **White chocolate chip cookies on a rack**: the flavor is not on any menu.
  Ask whether it is a regular flavor.
- **"Best Seller Chocolate Oreo" graphic and the logo graphic**: ads, not
  product photos.
- All three cookie items share one table photo. A photo per flavor would
  help.

## Posts that must stay off the site

- The May 20 CJ's post calling out a family, and the shared "Riot Haus"
  satire post about a bail coaster. Personal dispute, not product content.
- A My Sonshine Clothing Co. post praising the cookies. It is a review, and
  the site carries no reviews or ratings (see Markup is a claim in
  `CLAUDE.md`).

## Checks after any change here

1. `npm test` (1042 passing after these commits).
2. Serve the folder and load `index.html`, `goods.html` and an item sheet at
   390px and 1280px. Open the Chocolate Oreo item and check the label box.
3. Print `sign.html` to PDF: still one page with the phone showing.
