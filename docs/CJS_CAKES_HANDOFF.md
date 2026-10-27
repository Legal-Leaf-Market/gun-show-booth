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
8. **Which home-food law is CJ under now?** Found Oct 26, 2026, by web
   search only, because this container cannot reach iga.in.gov. HEA 1424
   (P.L. 163-2026, signed March 12, in effect July 1, 2026) created a
   "homestead vendor" chapter, IC 16-42-5.4. An early draft repealed the
   home-based vendor chapter (IC 16-42-5.3) that the site's label follows.
   The February engrossed version still refers to IC 16-42-5.3, so it may
   have been kept. Secondary sources disagree, and they quote two different
   new statements ("produced in a private residence that is exempt from
   government licensing and inspection" and "produced by a homestead vendor
   or the owner of a small farm that is exempt from government licensing
   and inspection"). Neither was checked against the enrolled text. The
   site still uses the IC 16-42-5.3 sentence. To settle it: the owner calls
   the Bartholomew County Health Department and asks which law their sales
   fall under and the exact label statement, or someone reads the label section
   of the enrolled act on iga.in.gov (labels were Section 6 of the new chapter in the introduced bill). Then change `B.HBV_STATEMENT` and the
   printed label together (`npm test` keeps them matched).

   More found the same day, still by search only (the PDFs are blocked
   here):
   - The Indiana Department of Health published "Farm and Homestead Food
     Sales" guidance dated May 26, 2026 (copies at
     ag.purdue.edu/department/foodsci/_docs/idoh-homestead-and-small-farm-guidance.pdf
     and the Floyd County health department site). Its sample label uses:
     "This product was produced by a homestead vendor or the owner of a
     small farm that is exempt from government licensing and inspection."
     This is the most trustworthy wording found. The "private residence"
     version comes only from third-party guides.
   - Every bill draft through January 21 repealed IC 16-42-5.3. The
     February 20 engrossed version still cites it, so the final act may
     have kept it. Unsettled.
   - Third-party summaries say a homestead label also needs allergens,
     possibly including allergens the food may have touched. The current
     site label lists only "Contains:" allergens from the ingredients.
   - Not found: whether the homestead law still requires posting each
     label on the vendor's website. If it does not, the site's labels stay
     anyway; they cost nothing and customers use them.

9. **Edible-photo toppers.** The cake designer (`cake-builder.html`) can
   put a customer's photo on the preview, but that step is hidden until
   `photoToppers` in `site.json` is `true`. Ask whether CJ's offers photo
   toppers, which sizes, lead time, file requirements and the fee.

## Photos (updated Oct 26, 2026)

All 27 Facebook photos are now in the repo; see `docs/cjs-cakes-photos.json`.
All 27 are in the gallery on `goods.html` (owner, Oct 26 and 27, 2026).
The steel-table cakes are CJ's own decorating from her supermarket bakery job,
in their own "CJ's cake decorating" group, labelled as not on our menu. The
logo, posts and menus are in a "From our Facebook page" group, uncropped; the
old mini cake menu ($6 each or 4 for $20) is captioned as old prices. The
white chip cookie photo is captioned without a flavor; it is still not on the
menu. A photo per cookie flavor would still help the product pages.

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
