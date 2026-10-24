# Asset library brief for ChatGPT: Booth Bandits

You are building the complete visual asset library for **Booth Bandits**, a
two-person vendor table that sells handmade coasters, fresh baked goods and
brand-new merch at Indiana gun shows and pop-up markets (Fountain Square,
flea markets, holiday markets). There is already a live website. Everything
you make has to match it and be ready to drop in, print, or post.

Read all of section 1 before making anything. Section 1 holds the rules that
can't change, and most of them exist because breaking one does real damage:
a lost booth spot, a banned ad account, or a customer misled.

---

## 1. Non-negotiables

### 1.1 What this business is, and is not

- **Goods, not guns.** Booth Bandits is a vendor *at* gun shows. It is not a
  firearms dealer and never buys, sells, trades or transfers firearms,
  ammunition, or gun parts. **No asset may show a firearm, a bullet or
  cartridge, a magazine, a scope reticle or crosshair, a muzzle flash, or a
  gun silhouette, including stylised, cartoon or "just a hint" versions.**
  This one rule protects the owner's payment processor, social accounts and
  ad accounts, which treat weapon imagery as weapon sales.
- No skull-and-crossed-rifles, no "Come and take it", no Second Amendment
  slogans, no political or partisan messaging, no flags with modifications.
  Customers come from everywhere and the table sells cookies.
- No jokes at police or first responders. They get into these shows free and
  stop at the table.
- The "outlaw" flavour of the name is **playful bandit / old-west / mercantile**:
  bandanas, wanted-poster type, a getaway wagon, a masked raccoon, loot bags,
  a treasure map with an X on the table. It is never menace, never weapons.

### 1.2 Never invent facts

- **Do not make photorealistic images of the products.** A fake photo of a
  coaster or a cookie is a picture of something the customer cannot buy.
  Product photos come from the owner's phone (see the shot list in 6.3). Your
  product-related work is **illustrated placeholders, templates, frames and
  backgrounds**, clearly not photographs.
- No fake reviews, star ratings, "as seen on", "since 19XX", award badges,
  follower counts or testimonials. Not even as placeholder text in a mockup
  that could get exported by accident. Use `[Customer quote goes here]` style
  brackets if a layout needs a slot.
- Placeholder contact details are `(317) 555-0142` and `hello@example.com`
  only. Never invent a real-looking address, handle or URL. The site URL is
  `booth-bandits.netlify.app` until a real domain exists. Write it
  exactly that way or leave a `[URL]` slot.

### 1.3 House style for every word you write

- **No em dashes, anywhere.** Not in taglines, captions, labels or alt text.
  Use a period, comma, colon or parentheses. An en dash is allowed only inside
  a number range ("Oct 24–25", "$5–$10"). This is enforced by an automated
  test on the website, so text with an em dash will be rejected.
- Plain, friendly, short. Talk like a person behind a folding table, not a
  brand deck. "Text us and we'll hold it" beats "Reserve your item today".
- Admission is paid to the show, not to us. Never put a show's ticket price
  on our materials as if we charge it.

### 1.4 The name may change

The brand name is not final (the shortlist includes Hot Creek Trading Co.,
Mule Train Mercantile, Bootlegger's Table). So:

- Every asset with the name must be delivered as **editable SVG with live
  text** *and* an outlined/flattened version.
- Keep the **ticket mark** (section 2.3) independent of the wordmark, so the
  mark survives a rename.
- Put the name in exactly one layer or group named `wordmark` in every file.

### 1.5 About your own tools

- Image generators are unreliable at spelling. **Any asset containing words
  must be built as SVG (vector, text as text), not as a generated raster.**
  Use image generation only for textures, backgrounds and illustration
  without lettering, then composite text on top in SVG.
- Check every generated image for accidental weapon shapes (a cowboy figure
  holding something gun-like, a holster, a bandolier of cartridges). Reject
  and regenerate. A bandolier is acceptable only if it holds obviously
  non-ammo items (cookies, pencils, rolled coasters).
- QR codes: never draw or generate one. Leave a white square slot labelled
  `QR` at the stated size. The site generates real, scannable codes itself
  (`sign.html`).

---

## 2. The brand system you are matching

### 2.1 Colour tokens (exact values from the live site's stylesheet)

| Token | Hex | Meaning | Use |
|---|---|---|---|
| Olive | `#4B5235` | army-surplus drab | primary ground, hero bands, icon plate |
| Olive dark | `#363C25` | shadow olive | footers, bands, depth |
| Blaze | `#E8501A` | hunter orange | the ticket stub, primary buttons, highlights |
| Blaze ink | `#A8360B` | orange dark enough for text on light | orange text on paper |
| Ink | `#1F241E` | near-black with green in it | text, outlines, stamps |
| Ink 2 | `#4A5048` | secondary text | captions |
| Concrete | `#ECECE6` | expo-hall floor | page background |
| Concrete 2 | `#DFDFD7` | darker floor | panels |
| Paper | `#FBFBF8` | ticket stock | cards, tickets, labels |
| Manila | `#DCC48E` | price-tag card | tags, chips, small accents |
| Line | `#C8C8BD` | hairline | dividers, dashed tear lines |

Rules:
- Blaze is for the one thing that matters on a surface (the date, the price,
  the call to action). A layout with five orange things has none.
- Black text on Blaze passes contrast. White text on Blaze does **not** at
  body sizes; only use it 24pt+ bold.
- White on Olive passes. Manila on Olive is for accents, not body text.
- Print: supply CMYK and spot suggestions alongside RGB. Hunter orange shifts
  badly in CMYK; recommend a Pantone match (around PMS 1665 C or 172 C) and
  say which you assumed.

### 2.2 Type

| Role | Font | Licence | Notes |
|---|---|---|---|
| Wordmark, big headlines | **Big Shoulders Stencil**, weight 800–900 | SIL OFL, free | always uppercase, tight leading (0.86) |
| Headlines, labels, prices | **Big Shoulders**, 700–900 | SIL OFL | the ticket dates and prices use this |
| Body, captions | **Barlow**, 400 / 600 / 700 | SIL OFL | friendly, readable at small sizes |

All three are on Google Fonts. Do not substitute. Do not add a fourth face.
A script or western "rope" font is allowed **only** inside an illustration as
a decorative element, never for information.

### 2.3 The ticket (the memorable thing)

The site's signature is an **admission ticket**: a paper ticket with a
blaze-orange stub on the left holding the day, the date number and the month,
a dashed tear line between stub and body, and two half-circle notches cut out
of the top and bottom edges at the tear line. Every event on the site is one
of these. The icon is the same ticket on an olive rounded square.

Current icon SVG (64x64), keep this geometry recognisable in every variant:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#4B5235"/><path d="M10 20h44v8a4 4 0 0 0 0 8v8H10v-8a4 4 0 0 0 0-8z" fill="#E8501A"/><path d="M24 22v20" stroke="#1F241E" stroke-width="2.5" stroke-dasharray="3 3"/></svg>
```

### 2.4 Texture and mood

Expo hall at 8am: concrete floor, folding tables, pegboard, manila price tags
on string, rubber stamps, paper wristbands, a hand-painted banner. Honest,
handmade, a little scrappy, warm. Not glossy, not tactical, not "luxury".

---

## 3. Delivery format

### 3.1 Folder structure and naming

Deliver as a zip mirroring this tree. File names are lowercase, hyphenated,
and end in their size when the size matters.

```
booth-bandits-assets/
  01-logo/
  02-icons/
  03-site/
  04-placeholders/
  05-social/
  06-print/
  07-merch/
  08-textures/
  09-templates/
  README.md            what each file is, where it goes, which fonts it needs
  SOURCES.md           every generated image: the prompt used and the date
```

### 3.2 File rules

- Vector: SVG, plain (no embedded raster unless the asset is a texture
  composite), `viewBox` set, no fixed `width`/`height`, fonts referenced by
  family name with an outlined twin file suffixed `-outlined.svg`.
- Raster: PNG for anything with flat colour or text; WebP (quality 82) for
  photos and textures. Supply @1x and @2x for anything used on the website.
- Print: PDF/X-1a or PDF/X-4, CMYK, 300 dpi, **0.125 in bleed**, 0.125 in
  safe margin, crop marks. Also supply the source SVG.
- Every raster for the website under 200 KB unless stated.
- Colour profile: sRGB for screen, state the CMYK profile used for print
  (US Web Coated SWOP v2 or GRACoL 2013).

---

## 4. The asset list

Priority: **P1** needed before the next show, **P2** within a month, **P3**
nice to have. Make all P1 before any P2.

### 4.1 Logo system (`01-logo/`)

| # | File | Spec | P |
|---|---|---|---|
| L1 | `wordmark-primary.svg` | Big Shoulders Stencil 900, uppercase, single line, Ink on transparent | P1 |
| L2 | `wordmark-stacked.svg` | two lines ("BOOTH / BANDITS"), as on the site hero | P1 |
| L3 | `wordmark-reverse.svg` | white, for olive grounds | P1 |
| L4 | `lockup-horizontal.svg` | ticket mark left of wordmark, mark height = cap height x 1.4 | P1 |
| L5 | `lockup-badge.svg` | circular badge: mark centre, name around the top, "INDIANA SHOWS & MARKETS" around the bottom. For stickers and stamps | P2 |
| L6 | `mark-ticket.svg` | the ticket alone, no plate | P1 |
| L7 | `mark-ticket-plate.svg` | ticket on olive rounded square (current icon), cleaned up | P1 |
| L8 | `mark-mono-ink.svg`, `mark-mono-white.svg` | one colour, for stamps, embroidery, laser engraving | P1 |
| L9 | `stamp-rubber.svg` | the badge as a rubber stamp: single colour, slightly broken ink edge, for stamping paper bags | P2 |
| L10 | `logo-usage.pdf` | one page: clear space (= ticket stub width), minimum sizes (mark 16 px / 0.25 in, wordmark 80 px / 1 in), do and don't examples | P2 |

Also deliver L1, L4 and L7 with **the other three shortlisted names** set in
the same system (Hot Creek Trading Co., Mule Train Mercantile, Bootlegger's
Table) so the owners can see the rename cost before committing. Put those in
`01-logo/alternates/`.

### 4.2 Icons (`02-icons/`)

One consistent set: 24 px grid, 2 px Ink stroke, rounded joins, optional
Blaze fill on one element. SVG, plus 48 px and 96 px PNG.

| Group | Icons | P |
|---|---|---|
| Product categories | coasters (stack of round coasters), baked goods (loaf), cookies, merch (folded tee), hat (trucker cap), patch, gift (wrapped box with string tag), candle, sticker, "custom order" (pencil on tag) | P1 |
| Event types | regular show (calendar with repeat arrow), pop-up (tent canopy), market (awning stall), holiday market (wreath on a tent), free entry (ticket with a check), cancelled (ticket with a diagonal tear) | P1 |
| Admission perks | senior, first responder (generic shield shape, no badge text, no agency marks), kids, ID required | P2 |
| Actions | text us, call, email, directions (signpost), add to calendar, share, hold for pickup (tag with a clock), sold (stamp) | P1 |
| Payments | cash, card, contactless, "Venmo / Cash App" as a generic phone-with-dollar (never their logos) | P1 |
| Social | Instagram, Facebook, TikTok in the **same line style** (simplified outlines, not the official logos, for the site footer) | P2 |

### 4.3 Website (`03-site/`)

| # | File | Spec | P |
|---|---|---|---|
| S1 | `og-share-card.svg` + `.png` | 1200x630, opaque, olive ground, wordmark, tagline, bottom band "WHERE WE'LL BE NEXT" in Blaze, "Goods, not guns" in Manila bottom right. Must read at 300 px wide | P1 |
| S2 | `og-event-template.svg` | 1200x630 with the ticket at large size and text slots: `[DAY]`, `[DATE]`, `[MONTH]`, `[SHOW NAME]`, `[CITY]`, `[ADMISSION LINE]` | P2 |
| S3 | `hero-pattern.svg` | tileable 400x400, very low contrast on Olive: faint pegboard holes or stencil crate marks. Must not fight white text | P2 |
| S4 | `empty-no-shows.svg` | 320x200 illustration: a folded table leaning on a wall, a "BACK SOON" card. Ink + Manila + one Blaze accent | P1 |
| S5 | `empty-no-goods.svg` | 320x200: an empty price tag on a string | P1 |
| S6 | `404-wrong-table.svg` | 480x300: a raccoon in a bandana looking at an empty table under a sign reading "WRONG TABLE" | P2 |
| S7 | `sold-stamp.svg` | rubber-stamp "SOLD", rotated -8°, Ink at 85% with grain, goes over product photos | P1 |
| S8 | `sample-flag.svg` | small manila tag reading "SAMPLE" | P2 |
| S9 | `map-pin.svg` + variants | 30x40, matches the site pin (Blaze drop, Ink outline, Ink centre). Variants: `-today` (pulsing ring as 3 separate frames), `-popup` (tent glyph), `-cancelled` (grey with slash) | P2 |
| S10 | `apple-touch-icon-180.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | ticket on olive. The maskable one keeps the ticket inside the centre 80% circle | P1 |
| S11 | `favicon.svg`, `favicon-16.png`, `favicon-32.png` | the ticket simplified until it survives 16 px: drop the dashed line below 32 px if it turns to mush. Test on light and dark browser tabs | P1 |
| S12 | `admin-splash.png` | 1170x2532 portrait, olive, mark centred, "Manage the table". For the owner's home-screen admin app | P3 |

Note: the site already generates its own `og.png` and icons with
`tools/branding.py`. Your versions are design references. If yours are
better, the script gets updated to match yours, so include exact
measurements in `README.md`.

### 4.4 Product placeholders (`04-placeholders/`)

Illustrated, flat, obviously not photographs. 1200x1200 SVG and WebP. Each on
a Concrete ground with a soft Paper card behind the object, so a real phone
photo dropped into the same slot later looks at home.

Coasters (walnut, slate, epoxy/resin, cork), cookies (bagged half dozen with
a label), banana bread loaf (wrapped), brownies, a sticker sheet, an
embroidered patch, a trucker hat, a tee folded on a table, a gift set in a
kraft box, a candle, a "custom order" card.

Every placeholder carries a small `ILLUSTRATION` corner label in Barlow 600.

### 4.5 Social (`05-social/`)

Templates with clearly marked text slots `[LIKE THIS]`, plus one filled
example each using the sample data (Sample Gun & Knife Show, Sample Expo
Hall, Indianapolis, Oct 24–25). SVG source plus PNG.

| # | Format | Size | Content | P |
|---|---|---|---|---|
| M1 | IG/FB post: "This weekend" | 1080x1350 | big ticket with the date, show name, city, "Find our table: [BOOTH NOTE]" | P1 |
| M2 | IG story: "We're here today" | 1080x1920 | ticket top third, space for a photo of the table in the middle, "Text to hold: [PHONE]" bottom, keep the top 250 px and bottom 340 px clear of text (platform UI) | P1 |
| M3 | IG post: "New on the table" | 1080x1350 | photo slot (square, rounded 12 px), manila price tag hanging off the corner with `[PRICE]` | P1 |
| M4 | IG post: "Sold out, more next show" | 1080x1350 | sold stamp over a photo slot | P2 |
| M5 | Carousel: "Where we'll be this month" | 1080x1350 x 5 | cover slide + one ticket per slide + closing slide with the URL | P2 |
| M6 | Facebook event cover | 1920x1005 (safe 1640x856 centre) | ticket + "Booth Bandits will be at" | P1 |
| M7 | Facebook page cover | 851x315 (mobile safe 640x312 centre) | wordmark on olive with pegboard pattern | P1 |
| M8 | Profile picture | 1080x1080, reads at 110 px in a circle | the ticket mark, no text | P1 |
| M9 | "How to find us" story | 1080x1920 | stylised floor plan of a show hall with an X marking our table, tagline "X marks the table" | P3 |
| M10 | Holiday set | 1080x1350 x 3 | Thanksgiving, December holiday markets, New Year, all non-religious-specific ("Holiday market season") | P3 |

Captions: write 3 caption options per template (under 150 characters, no em
dashes, one emoji maximum, no hashtags spam: up to 5 relevant ones like
#IndyMarkets #FountainSquare #ShopSmall #Handmade #IndianaMakers). **No
#gunshow-style hashtags tied to weapons**; "gun show" in plain text is fine.

### 4.6 Print (`06-print/`)

| # | Item | Size | Content | P |
|---|---|---|---|---|
| P1 | Table banner | 6 ft x 2 ft vinyl (72x24 in), with 1 in hem + grommet marks | wordmark huge, tagline, "Cash / Card" badges, URL. Reads from 30 ft | P1 |
| P2 | Tablecloth front panel | 6 ft table, 30 in drop, fitted | centred lockup, nothing in the bottom 6 in (feet, boxes) | P2 |
| P3 | Price tags | 2 x 3.5 in manila, string hole top centre | `[ITEM]`, `[PRICE]` huge in Big Shoulders, small mark. Sheet of 10 on Letter, cut lines | P1 |
| P4 | "Text to hold" tent card | 4 x 6 in folded tent | "Want it held for the next show? Text [PHONE]" + QR slot 1.5 in | P1 |
| P5 | Payment sign | 5 x 7 in, standing | "Cash / Card / Tap" icons, "Card has a small fee" optional slot | P1 |
| P6 | Business card | 3.5 x 2 in, two sided | front: lockup; back: next-shows line, phone, URL, QR slot 0.9 in | P1 |
| P7 | Stickers | 3 in die-cut badge, 2 in circle mark, 3 x 1 in wordmark bumper | for bags and giveaways | P2 |
| P8 | Bag label | 2 x 3 in rectangle, kraft-friendly (Ink only) | mark + "Thanks for stopping by" + URL | P2 |
| P9 | **Baked-goods label** | 2 x 3 in | slots for: `[PRODUCT NAME]`, `[INGREDIENTS]`, `[ALLERGENS]`, `[NET WT]`, `[PRODUCED BY name, address]`, `[DATE]`, and a statement block `[HOME-PRODUCED STATEMENT]`. Leave the statement as a slot: the exact legal wording comes from the owner after checking Indiana's home-based vendor rules. Do not write legal text yourself | P1 |
| P10 | Coaster backer card | 4.25 x 4.25 in | holds a set of 4, "Sealed. Wipe clean. Not dishwasher safe" slot, care line | P2 |
| P11 | Thank-you card | 3.5 x 2 in | "Thanks for shopping a small table" + where we'll be next slot | P3 |
| P12 | "Custom orders" sign | 8.5 x 11 in | what can be customised (slots), "picked up at the next show" | P2 |
| P13 | Hanging price board | 11 x 17 in | chalkboard-style list with 8 `[ITEM] .... [PRICE]` rows in Ink on Manila | P2 |
| P14 | Sold / held tags | 1.5 x 2.5 in | "HELD FOR [NAME]", "SOLD" | P2 |

The website already prints a Letter-size table sign with live dates and a
real QR code (`sign.html`), so do not duplicate that. Design a nicer frame
for it instead if you have ideas, as `06-print/sign-frame-reference.pdf`.

### 4.7 Merch designs (`07-merch/`)

Original designs only, no parody of other brands. Each delivered as a
separate-colour vector (max 3 spot colours for screen printing, 1 colour
for embroidery).

| # | Item | Notes | P |
|---|---|---|---|
| D1 | Embroidered patch, 3 in | badge lockup, merrowed border, max 6 thread colours, no detail under 1 mm | P1 |
| D2 | Trucker hat front | wordmark or patch placement, 4.5 x 2.25 in max | P1 |
| D3 | Tee, front chest + full back | back: big stencil wordmark with "INDIANA SHOWS & MARKETS"; front: small mark | P2 |
| D4 | Raccoon bandit mascot | standing raccoon in a bandana carrying a loot bag full of cookies and coasters. Friendly, not menacing, hands visibly holding goods. Full colour + 1 colour versions | P2 |
| D5 | "Goods, not guns" tee | type-only, tongue in cheek, Big Shoulders Stencil | P3 |
| D6 | Koozie / sticker set | 4 small designs: ticket, raccoon, "X marks the table", "Cash is king at the table" | P3 |

### 4.8 Textures (`08-textures/`)

Generated rasters are fine here. Tileable, 2048x2048, WebP plus a 50%
opacity overlay PNG. Prompt record in `SOURCES.md`.

Concrete floor (light, matches `#ECECE6`), kraft paper, manila card stock,
pegboard on olive, canvas tarp, rubber-stamp grain overlay, folded paper
crease overlay, ticket paper with faint security pattern.

### 4.9 Templates (`09-templates/`)

| # | Item | Notes | P |
|---|---|---|---|
| T1 | Show checklist printable | Letter: load-in list (table, cloth, cash box with $100 in small bills, card reader charged, price tags, bags, tape, zip ties, signs, water, labels) as checkboxes | P2 |
| T2 | Inventory count sheet | Letter landscape: item, start count, end count, price, total | P2 |
| T3 | Booth layout sketch | top-down 6 ft and 8 ft table layouts with where the banner, tent card, payment sign and price board go | P3 |
| T4 | Email signature | 600x150 PNG + HTML snippet | P3 |

---

## 5. Prompt guidance for any image you generate

Start every image prompt with this style block, then describe the subject:

> Flat vector illustration, limited palette of olive drab #4B5235, hunter
> orange #E8501A, near-black green #1F241E, manila #DCC48E and off-white
> #FBFBF8. Hand-printed, slightly imperfect ink edges, like a rubber stamp or
> screen print. Simple shapes, generous negative space. No text, no letters,
> no numbers. No weapons, no firearms, no ammunition, no gun shapes of any
> kind. Friendly, small-business, Midwest market feel.

End every prompt with: "Do not include any text or lettering."

Then add the text yourself in SVG.

---

## 6. Things that are not yours to make, and what to give instead

### 6.1 Real product photos
The owner shoots these. Make a one-page photo guide instead (`09-templates/photo-guide.pdf`) built from the shot list in 6.3.

### 6.2 Legal wording
Food labels, sales tax notices, "not a firearms dealer" statements: leave
slots. The owner confirms wording.

### 6.3 Photo shot list (put this in the photo guide)
- Every product: one straight-on on a plain Paper or Concrete-coloured
  surface, one in hand for scale, one detail (wood grain, crumb, stitching).
- Natural window light, no flash, phone at product height.
- Square crop safe (the site crops to square cards; keep the item centred
  with 15% margin).
- The table at a show: wide shot from 10 ft, close shot of the price board.
  No other vendors' goods or faces in frame without asking. No firearms from
  neighbouring tables in the background.
- The owners at the table, if they want to be on the site.

---

## 7. Quality check before you hand it over

Go through this list for every file:

- [ ] No firearm, ammo, magazine, reticle, or gun-like shape anywhere, including backgrounds and mascot hands
- [ ] No em dashes in any text
- [ ] No invented facts, reviews, ratings, addresses or handles
- [ ] Text is live text in SVG, with an outlined twin
- [ ] Colours are the exact hex values from 2.1
- [ ] Black on Blaze, never white body text on Blaze
- [ ] Print files have 0.125 in bleed and safe margin, CMYK, 300 dpi
- [ ] Web rasters under 200 KB, @1x and @2x
- [ ] File named per 3.1, listed in README.md, generated images listed in SOURCES.md with prompt
- [ ] The name sits in one `wordmark` layer so a rename is one edit
