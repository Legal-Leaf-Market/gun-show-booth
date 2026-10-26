# Booth Bandits visual library and CJ's Cakes builder

## What is included

This implementation is based on Legal-Leaf-Market/gun-show-booth main at a73bfb40f14cc7b061315cc3b98197d4451fd031. It has not been pushed or deployed. Workspace Git push had no credentials. The signed-in GitHub browser could read the repository, but file uploads were blocked by the extension file-access setting. Do not claim that these changes are live.

- 76 original transparent SVG assets in assets/img/market/: 24 distinct motifs, each in full color, cream outline and olive outline, plus one bakery constellation, two border strips and one repeating tile.
- assets/img/market/index.html is the browsable asset catalog.
- index.html and assets/style.css integrate a floating bakery constellation, subtle repeat pattern, section icons, framing and footer decoration. Reduced-motion preferences disable floating animation. Small-screen art is intentionally subdued.
- cake-builder.html, assets/cake-builder.css and assets/cake-builder.js implement a dependency-free Canvas 2D cake design tool. It uses perspective cues, shading, ellipse projection and piping for a 3D-style view; it is not a rotatable 3D mesh.
- cakes.html gains a Design your cake link. sitemap.xml includes the new page.
- The kit's preview/cake-builder-standalone.html works without a server. It embeds its CSS and JavaScript, and omits site navigation and automatic catalog loading. The repository version loads current sizes from data/items.json and current contact buttons through Booth.load().

## Apply the implementation

1. Start from the latest repository, read CLAUDE.md, and preserve concurrent changes. Never overwrite the whole repository with this kit.
2. Use implementation.patch with `git apply --check` first. If current main has moved, merge the small HTML/CSS edits manually. The overlay/ directory contains only new and changed files as a fallback, not the full repository.
3. Keep assets/img/market/ public. Keep this handoff under docs/, which Netlify already blocks. Add no framework, dependencies or build step.
4. Run npm test and node --check assets/cake-builder.js.
5. Run the browser acceptance checks below. Commit, push and verify the Netlify deployment. Publishing was authorized by the user's request to make asset/code changes through GitHub; follow any additional current instructions in the active session.

## Builder behavior

- Round or sheet shape; current catalog sizes; flavor and icing; free-choice frosting and border colors; pearl, sprinkle or plain decoration; message up to 42 characters.
- Local JPG/PNG/WebP image selection under 12 MB; image decoding and a 50-megapixel guard; zoom and X/Y crop controls; photo removal; reset.
- A circle or rounded-rectangle photo is projected onto the top plane. The photo is never sent to a server. Customers must attach the original photo and downloaded preview separately when messaging.
- PNG export contains the cake concept. Copy design details includes the configuration, date, notes and a bakery-confirmation reminder.
- The view is normalized to fill the preview. Choosing a different size currently changes request details, not physical geometry or serving-count claims.
- Flavor/icing do not alter the rendering. There are no tier, orbit, lighting, drag-to-rotate, automatic quote, checkout, backend submission, persistence, calendar availability, or actual edible printing integrations.
- No order or reservation is created. Photo-topper availability and all designs are subject to bakery confirmation. Catalog prices are starting/base prices, not a quote for decoration or edible printing.

## Finish next, in priority order

1. Ask the bakery whether edible-photo toppers are offered, which formats/sizes, minimum lead time, print/crop margins, file requirements and fees. Do not invent offerings or prices. If unavailable, keep this as an inspiration preview or hide the photo option.
2. Browser QA and polish. Tune the canvas proportions, text placement and photo safe area against real bakery output. Test unusual aspect ratios, portrait photos, orientation, transparency and long messages.
3. Add a configuration JSON export/import with a versioned schema. Store only configuration locally if desired; do not put photos or private notes in URL parameters.
4. If direct submissions are wanted, design an explicit reviewed submission flow, upload destination, server-side file validation, EXIF removal, rate limits, private storage, retention/deletion policy and bakery notification. Static Netlify hosting alone does not deliver these images to the bakery. Never pretend sms links attach files.
5. Add a real quote only after the owner supplies a pricing matrix. Keep estimates clearly separate from final confirmation.
6. Optional full 3D phase: first obtain approval to change the repository's dependency-free rule. Vendor an approved Three.js version and license if chosen. Create cylinder and rounded-box meshes, a separate top decal mesh with UV cropping, orbit controls with limited elevation, lighting, a plate and soft shadows. Keep this working Canvas fallback for unsupported or low-power devices. Maintain accessible DOM controls and export the same versioned configuration.

## Browser acceptance checks

At 390px and 1280px, load home, goods, events, event detail, cakes, product detail and cake-builder. Check no horizontal scrolling, no JavaScript errors, reachable controls, focus indicators and readable text. Check floating art never blocks links and reduced motion stops it. Check all 76 SVG files load and the catalog works.

Builder: switch both shapes and all sizes; change colors; test plain/pearls/sprinkles; blank and 42-character messages; photo upload, crop, zoom, removal and reset; invalid MIME, oversized and corrupt images; PNG download; clipboard success and denied fallback. Verify no image leaves the browser in the network panel. Test Safari/iPhone image decoding and downloads, Android and desktop. Test keyboard navigation and screen-reader preview description. Decide whether mobile needs a compact sticky preview after real-device testing.

## Validation completed here

- Existing repository suite: 1232 passed, 0 failed before adding this handoff.
- JavaScript syntax check passed.
- All 76 SVG files parse as XML.
- Canvas engine rendered round, sheet and photo examples. A local DOM harness exercised shape/size switching, image placement/removal, invalid-file rejection and reset.
- Round cake, photo projection and bakery constellation rendered and visually inspected.
- Full browser responsive QA remains incomplete: the workspace browser binary was absent, and browser downloads returned invalid archives. Do not equate the Canvas harness with an end-to-end browser test.

## Visual direction and asset use

Olive, warm cream, biscuit gold and terracotta. Hand-drawn outlines and intentional asymmetry. Use color motifs for section markers, cream outlines on dark backgrounds and olive outlines at low opacity behind content. Keep product photography real. Motifs are decorative, not product photography or claims that each illustrated item is sold. The collection includes generic supporting motifs such as coffee and croissants; these are not added to the product catalog.

All drawings are editable SVG paths/shapes with transparent backgrounds, no external assets, no SVG text nodes and no font dependencies. Decorative images should use empty alt text or CSS backgrounds. Meaningful icons need adjacent labels. Prefer a few accents per section rather than a dense wallpaper. Do not modify labels, ingredients, prices, show dates or the goods-not-guns statement as part of this design work.
