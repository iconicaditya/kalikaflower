# Reference Design Analysis — Editorial Luxe E-Commerce (TWG Tea-Inspired)

A breakdown of the design language commonly seen on premium editorial e-commerce sites (TWG Tea being a flagship example), structured for re-application to the Godawari Planthub Nursery build.

---

## 1. Overall Structure
- Long-scroll editorial homepage composed of distinct horizontal "stripes" — each stripe has its own background tone, padding scale, and typographic register.
- Sticky thin top bar containing announcement marquee + utility links (locale, account, wishlist, cart). Below it, the main nav with center-aligned logotype.
- Heavy whitespace, generous vertical padding (often 80–160px between sections), narrow content wells (max-width ≈ 1280–1440px) to keep editorial calm.
- Footer is layered: newsletter signup band → multi-column site map → fine-print legal/social.

## 2. Sections & Cards
- Hero: full-bleed image carousel, slow-rotation (6–8s), text overlaid bottom-left or center with serif headline + tracked-out eyebrow + thin button.
- Category mosaic: 3- or 6-up grid of square/portrait tiles with image + caption that zoom on hover.
- Editorial banner: 50/50 split with image and copy column (alternating direction down the page).
- Product carousel: 4-up product cards with thin dividers, no shadows, rich hover state (image swap + quick-add slide).
- Testimonial section: serif pull-quotes on cream background, 5-star rating glyphs in gold.
- Triple promo (shipping/gift/loyalty): icon + headline + small CTA in a tight 3-column bar.

## 3. Images & Media
- Photography is moody, naturalistic, high-contrast; consistent color treatment (warm shadow, desaturated highlights).
- Lots of negative space within each photo — the subject often occupies one third, leaving room for layered type.
- Use of subtle Ken-Burns zoom on hero slides and a slow scale-up on hover for product cards.
- 4:5 portrait aspect ratio dominates product cards; 16:9 cinematic for editorial banners.

## 4. Typography & Text
- Primary display: high-contrast didone or transitional serif (Cormorant Garamond / Playfair) — used for H1/H2 only, large sizes (60–96px desktop).
- Body & UI: clean geometric sans (Outfit / Futura PT) at 14–16px, generous line-height (1.7).
- Eyebrow / overline: 11px UPPERCASE, 0.3em letter-spacing, often gold or muted accent.
- Italic serifs used for secondary descriptors (botanical name, region, year).

## 5. Colors & Styling
- Restrained, "boutique" palette: deep brand color (forest green / oxblood / ink) + cream/ivory background + terracotta or gold accent + black/charcoal type.
- No gradients. No drop shadows. Borders are 1px hairlines in muted tones.
- Buttons are minimalist: rectangular, no border-radius, thin border, all-caps tracked label, optional shimmer sweep on hover.

## 6. Animations & Interactions
- Fade-up / fade-down on scroll (IntersectionObserver, 600–800ms ease).
- Staggered reveals (80–120ms per item) for grids and cards.
- Hover image-swap on product cards (1.2s easing); quick-add CTA slides up from bottom of image.
- Underline-grow on links (left-to-right reveal).
- Subtle marquee scroll for announcement bar.
- Micro-interactions only — no bounce, no spring overshoot.

## 7. Spacing & Layout
- 12-column grid with a 24–32px gutter.
- Section padding: 96–144px vertical desktop; 64–80px mobile.
- Cards have no internal padding — copy sits below the image with 20px breathing room.
- Eyebrow → headline → body chain has tight spacing (8px / 24px / 16px).

## 8. UI Components
- Header with marquee strip, mega-menu on hover, mobile drawer.
- Product card with image-swap, quick-add, badges (New / Bestseller / Edit).
- Quantity stepper using thin square buttons.
- Accordion tabs for product description / care / shipping.
- Sticky cart drawer + dedicated cart page.
- Newsletter inline form with thin underline-style input.

## 9. Responsive Design
- Mobile-first breakpoints (640 / 768 / 1024 / 1280).
- Hero compresses to single-column with cropped imagery; type drops to ~36–48px.
- 4-up grids collapse to 2-up on tablet, 1.2-up scrolling carousel on mobile.
- Sticky header shrinks; announcement bar persists as marquee on small screens.

## 10. Implementation Notes
- All animations are CSS keyframes triggered via Tailwind utilities (no heavy JS animation lib needed).
- Image-swap: two stacked `<img>` with absolute positioning and opacity transition.
- Marquee: doubled inline content with `animation: marquee 30s linear infinite`.
- Color tokens in CSS variables (`--forest`, `--cream`, `--gold`) and mirrored in `tailwind.config.js`.
- React Query (TanStack) + Modelence queries/mutations for all data.
- Cart persists by sessionId in localStorage; items snapshotted in MongoDB cart store.

---

# Applied to Godawari Planthub Nursery
- Palette swapped to botanical luxe: forest green / cream / terracotta / gold.
- Photography subject: greenery, terracotta pots, natural light, Nepali landscape.
- Eyebrow vocabulary: "Curated Botanicals", "Heirloom Cultivars", "Mountain-grown".
- Plant-specific UX: care-level chip, light/water iconography, botanical (Latin) name in italic, height range.
- Local Nepal touches: NPR currency, Kathmandu/Pokhara/Lalitpur store locations, Nepali festival/season tie-ins in editorial banners.

This document accompanies the live build — see `src/client/index.css` and `tailwind.config.js` for the executed style guide.
