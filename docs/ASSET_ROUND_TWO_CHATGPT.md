# Round two: Booth Bandits asset library

Paste this whole file into ChatGPT, together with the zip of the current
library (`brand/` in the repo, or the "booth-bandits-assets-fixed.zip"
download). Everything in round one's brief (`ASSET_LIBRARY_CHATGPT.md`)
still applies: no gun imagery of any kind, no invented facts or reviews, no
em dashes, exact brand colours, Big Shoulders Stencil / Big Shoulders / Barlow
only, words as live SVG text, QR codes as blank labelled squares.

---

## 1. What happened to round one

Your first library was reviewed in a browser with the real fonts installed.
The logos, icons, product placeholders, merch art, the 404 raccoon and the
empty-state drawings were accepted and are now on the live site. These were
fixed on our side, so **do not redo them**:

- The `-outlined.svg` files now contain real glyph outlines (our tool does
  this, from your live-text sources). **Don't make outlined files any more.**
  Deliver live-text SVGs only and we generate the outlines.
- Every PNG has been re-rendered with the right fonts. **Don't make PNGs for
  anything that contains text.** If you can't render with Big Shoulders and
  Barlow actually installed, your rasters come out in a fallback font and
  clipped, which is what happened last time.
- Facebook page cover, trucker hat front, share-card template date size,
  404 raccoon layout and the pop-up map pin were corrected. Leave them alone.

Round two is the work that was still weak. It's four jobs, in priority order.

---

## 2. Job 1: Social templates built on the ticket (highest priority)

The 14 social templates in `05-social/` are near-identical: an olive
background, a white box, a grey box, small centred text. They don't use the
one memorable thing the brand has, and nothing in them reads at the size
people actually see a post (about 390 px wide on a phone).

**Rebuild every template in `05-social/` around the admission ticket.** The
ticket is the website's signature: paper (`#FBFBF8`) body, a blaze orange
(`#E8501A`) stub on the left holding the day, date and month stacked, a dashed
Ink tear line between them, and two half-circle notches cut from the top and
bottom edges at the tear line. Look at `03-site/og-event-template.svg` for
the proportions; the stub is about a quarter of the ticket's width.

Rules for every template:

- **The ticket is the hero.** At least 70% of the canvas width. Not a small
  card floating in a big olive field.
- **Minimum text sizes on a 1080 px wide canvas:** headline 96 px, show name
  64 px, supporting line 40 px, nothing below 32 px. Anything smaller is
  unreadable in a feed. If a slot's text doesn't fit at those sizes, the
  layout is wrong, not the size.
- The date stub's day number is the biggest text on the canvas (160 px or
  more on a single date; for a two-day show like "24–25" it must still fit
  the stub, so size the stub for "28–29" in Big Shoulders 900).
- **One** blaze orange thing besides the stub. Black text on orange only.
- Keep the wordmark small (top or bottom edge, under 60 px tall). The post is
  about the show, not the logo.
- Story formats (1080x1920): keep text out of the top 250 px and the bottom
  340 px, where Instagram and Facebook draw their own controls.
- Photo slots are clearly marked rectangles with a 12 px radius and the label
  `[PHOTO]` centred in them, Ink on Concrete 2 (`#DFDFD7`).
- Every template ships twice: a slot version (`[SHOW NAME]`, `[CITY]`,
  `[DAY]`, `[DATE]`, `[MONTH]`, `[ADMISSION LINE]`, `[PHONE]`, `[PRICE]`) and
  a filled sample using exactly this data and nothing else:
  - Show: **Sample Gun & Knife Show**, Sample Expo Hall, Indianapolis
  - Dates: Sat–Sun, Oct 24–25
  - Admission line: **$6 at the door, paid to the show. Seniors, police and
    first responders get in free.**
  - Phone: (317) 555-0142
  - Site: booth-bandits.netlify.app

Templates to rebuild, keeping the existing file names:

| File | Canvas | Content |
|---|---|---|
| `this-weekend` | 1080x1350 | "THIS WEEKEND" headline, ticket with the date, show name, city, admission line under the ticket |
| `here-today-story` | 1080x1920 | ticket in the top third, `[PHOTO]` slot in the middle for a picture of the table, "Text to hold: [PHONE]" near the bottom safe line |
| `new-on-the-table` | 1080x1350 | square `[PHOTO]` slot, a manila price tag (`#DCC48E`, string hole, Ink outline) hanging off its top right corner with `[PRICE]`, item name below |
| `sold-out` | 1080x1350 | `[PHOTO]` slot with the SOLD stamp (`03-site/sold-stamp.svg`) over it, "More at the next show" and the next date as a small ticket |
| `monthly-cover`, `monthly-show-1..3`, `monthly-close` | 1080x1350 each, a carousel | cover: "WHERE WE'LL BE IN [MONTH]"; one full ticket per show slide; close: site address and "Text to hold: [PHONE]" |
| `facebook-event-cover` | 1920x1005, safe centre 1640x856 | a wide ticket filling the safe area, "Booth Bandits will be at" above the show name |
| `find-us-story` | 1080x1920 | simple top-down floor plan of a show hall (rows of tables as rectangles), an orange X on one table, "X marks the table" headline, `[BOOTH NOTE]` slot |
| `holiday-thanksgiving`, `holiday-december`, `holiday-new-year` | 1080x1350 | seasonal versions of `this-weekend`; decorate with shapes (leaves, string lights, confetti), never religious symbols, never text in a decoration |

Write three captions per template in `05-social/captions.md` (replace the
file): under 150 characters, no em dashes, at most one emoji, up to five
hashtags from #IndyMarkets #FountainSquare #ShopSmall #Handmade
#IndianaMakers #IndyEvents. Plain-text "gun show" is fine; no weapon hashtags.

---

## 3. Job 2: Big print that reads from across a hall

`06-print/table-banner.svg` and `06-print/tablecloth-front.svg` are mostly
empty with small text. A banner is read from 20 to 40 feet away while
someone walks a crowded aisle.

The rule sign makers use: **1 inch of letter height for every 10 feet of
viewing distance**, for the most important line. So:

| File | Physical size | Required |
|---|---|---|
| `table-banner` | 72 x 24 in, plus 1 in hem all round, grommet marks at the four corners and every 24 in along the top | wordmark cap height **at least 6 in**, readable from 60 ft. Big Shoulders Stencil capitals are 0.8 of the font size, so that is a font-size of about 750 units, which makes "BOOTH BANDITS" about 43 in wide and leaves room for the mark. One line under it at least 2.5 in cap height: "COASTERS • BAKED GOODS • MERCH". Small ticket mark left of the wordmark. Nothing else. No URL (nobody types a URL off a banner), no phone, no payment icons |
| `tablecloth-front` | 72 in wide x 30 in drop, front panel | centred lockup, wordmark cap height at least 6 in, keep the bottom 6 in empty (feet, boxes, bags hide it) |
| `payment-sign` | 5 x 7 in standing | "CASH / CARD / TAP" icons at least 1.5 in each with the word under each at 0.5 in cap height |
| `hanging-price-board` | 11 x 17 in | 8 rows of `[ITEM] ........ [PRICE]`, price text at least 0.75 in cap height so it reads from 6 ft |
| `text-to-hold-tent` | 4 x 6 in, folded tent (two 4 x 3 faces, the top face upside down so it reads correctly when folded) | "Want it held for the next show? Text us." and `[PHONE]` at 0.5 in cap height, QR slot 1.25 in square |

Canvas units for all print files: **100 user units per inch**, so a 72 x 24
in banner is `viewBox="0 0 7200 2400"` before bleed. State that in the README.

---

## 4. Job 3: Print layouts that collide

In these files the wordmark or headline overlaps the logo plate, or the text
runs into the plate's rounded corner: `bag-label`, `business-card-back`,
`thank-you-card`, `sticker-badge`. In `business-card-front`, `held-tag`,
`sold-tag` and `price-tag` the plate and text sit cramped in the top left with
most of the card empty.

For every file in `06-print/`:

- Keep a clear gap of at least **0.125 in (12.5 units)** between the logo
  plate and any text, and between any element and the safe line.
- Safe line 0.125 in inside the trim; bleed 0.125 in outside it. Draw the
  trim, bleed and safe lines on a separate layer with `id="guides"` (we hide
  it before printing).
- Centre the composition on the card. Small cards (2 x 3.5 in and under)
  carry at most three things: the mark, one line of text, and one slot.
- `business-card-back`: next-shows line, `[PHONE]`, site address, QR slot
  0.9 in square, in that order, left aligned on a 4-column grid.
- `baked-goods-label`: keep every bracket slot exactly as it is, including
  `[HOME-PRODUCED STATEMENT]`. Do not write legal wording into it. Give the
  statement slot a full-width box at least 0.6 in tall, because the real
  Indiana wording is a long sentence.

---

## 5. Job 4: Small fixes

- `01-logo/mark-mono-ink.svg` and `mark-mono-white.svg` lose the dashed tear
  line, because the line is drawn in the same colour as the ticket. In a one
  colour mark, **knock the tear line out** (cut it through the shape so the
  background shows), the way a stencil would. Same for the notches, which
  must stay cut out.
- `04-placeholders/*`: the "ILLUSTRATION" corner label is about 8 px tall at
  1200 px and unreadable. Make it 36 px Barlow 600, Ink on Manila, in the
  bottom left corner with 32 px padding. Change nothing else in those files.
- `07-merch/raccoon-bandit.svg`: keep the character, but give him arms with
  visible paws holding the loot bag in front of the body. Bag reads
  "COOKIES" as now. Check the paws can't be read as holding anything else.

---

## 6. Delivery

- Same folder structure and **the same file names** as round one, so the new
  files drop straight over the old ones. Only include files you changed.
- SVG only, live text, no `-outlined` files, no PNGs of anything with text.
  Textures and other text-free rasters may stay as they are; don't resend them.
- One `CHANGES.md` at the root listing every file and one line on what
  changed.
- Before you hand it over, check every file against this list:
  - [ ] No firearm, ammunition, magazine, reticle or gun-like shape, including in the raccoon's paws and any decoration
  - [ ] No em dashes in any text, including captions
  - [ ] No invented facts, reviews, ratings, addresses or handles; sample data exactly as given in section 2
  - [ ] Every social template's smallest text is 32 px or larger on a 1080 px canvas
  - [ ] Banner wordmark cap height is at least 6 in at full size
  - [ ] No text touches or overlaps a logo plate; 0.125 in gap everywhere
  - [ ] Guides on a layer with `id="guides"`
  - [ ] File names match round one exactly
