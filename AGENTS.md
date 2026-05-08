# Godawari Planthub Nursery — Agent Notes

## Overview
Editorial luxe e-commerce site for a plant nursery, inspired by upscale TWG Tea-style design language. Built on Modelence (full-stack TypeScript with MongoDB Store SDK).

## Design System
- **Fonts**: Cormorant Garamond (display, serif), Outfit (body, sans-serif). Imported via Google Fonts in `src/client/index.css`.
- **Palette**:
  - `forest` (deep green primary), `forest-deep`
  - `cream`, `ivory` (backgrounds)
  - `terracotta` (accent CTA)
  - `gold` (luxe highlight)
  - `bark`, `stone` (neutrals/borders)
- **Animations** (in `tailwind.config.js`): `fade-up`, `fade-down`, `slide-in-right`, `kenburns`, `shimmer`, `marquee`, `sway`. Easing: `ease-luxe`.
- **Utilities** (in `src/client/index.css`): `link-underline`, `img-zoom`, `btn-shimmer`, `divider-leaf`.

## Server Module: nursery (`src/server/nursery/`)
### Stores (`db.ts`)
- `dbPlants` — plant catalog (slug unique, indexed by category/featured/newArrival/bestseller)
- `dbReviews` — per-plant reviews
- `dbTestimonials` — homepage testimonials
- `dbCarts` — sessionId-keyed cart with full item snapshots
- `dbOrders` — order history (orderNumber unique)
- `dbNewsletter` — email subscribers
- `dbContacts` — contact form messages

**IMPORTANT schema syntax**: Use chained `.optional()` (e.g. `schema.string().optional()`), NOT `schema.optional(schema.string())` (the latter does not exist on Modelence schema).

### Queries
listPlants, getPlant, relatedPlants, getReviews, listTestimonials, getCart

### Mutations
addToCart, updateCartItem, clearCart, submitReview, placeOrder, subscribeNewsletter, sendContact

## Migrations
- `seedNursery` (version 2 in `src/server/migrations/seedNursery.ts`) — seeds 22 plants, 10 reviews, 6 testimonials. Imports stores from `nursery/db.ts`.

## Client Pages (`src/client/pages/`)
1. HomePage — hero carousel, categories, featured grid, editorial banner, new arrivals, plant finder CTA, bestsellers, testimonials, triple promo, locations, story
2. ShopPage — full grid with category/sort/price filters
3. PlantPage — gallery, qty selector, accordions, reviews, related plants
4. CategoryPage — category-filtered listing
5. CollectionsPage — collections index
6. CartPage — cart line items + summary
7. CheckoutPage — checkout form (placeOrder)
8. OrderConfirmationPage — order success
9. AccountPage — user dashboard (uses `user.handle`)
10. WishlistPage — saved plants
11. AboutPage, JournalPage, LocationsPage, ContactPage, FaqPage, PrivacyPage, TermsPage, NotFoundPage

## Components (`src/client/components/nursery/`)
- Header — sticky, marquee announcement, cart badge, drawer, search overlay
- Footer — newsletter, links, socials
- Layout — wraps Header + Footer
- ProductCard (exports `Plant` type — keep all fields synced)
- Button (BotanicalButton variants: primary/inverse/outline/ghost; sm/md/lg)

## Hooks & Lib
- `useCart` — sessionId via localStorage (`gph_session_id`); exposes addToCart, updateItem, clearCart, itemCount
- `lib/format.ts` — formatPrice (NPR), getOrCreateSessionId

## Routes (`src/client/router.tsx`)
All routes wired. Public: `/`, `/shop`, `/plant/:slug`, `/category/:slug`, `/collections`, `/cart`, `/checkout`, `/order/:orderNumber`, `/wishlist`, `/about`, `/journal`, `/locations`, `/contact`, `/faq`, `/privacy`, `/terms`. Guest: `/login`, `/signup`. Private: `/account`.

## Known Conventions
- User type from `useSession`: `{ id, handle, roles[], firstName?, lastName?, avatarUrl? }` — does NOT have `email`. Use `handle`.
- Cart items must include the full snapshot (plantId, slug, name, price, image, quantity) per the cart schema.
- Order items match the same shape.

## Admin Panel
A separate admin module + UI gated by the `admin` role.

### Server: `src/server/admin/index.ts`
Module name `admin`. Imports stores from `nursery/db.ts`. Every handler calls `ensureAdmin(user)` which throws if no `admin` role.

Queries: `overview`, `listPlants`, `getPlant`, `listOrders`, `getOrder`, `listReviews`, `listTestimonials`, `listSubscribers`, `listMessages`.

Mutations: `createPlant`, `updatePlant`, `deletePlant`, `updateOrderStatus`, `deleteReview`, `saveTestimonial`, `deleteTestimonial`, `deleteSubscriber`, `deleteMessage`.

### Roles
Registered in `app.ts` via `roles: { admin: { description: '…' } }`. Migration `promoteDemoAdmin` (version 3) auto-grants admin to `demo@modelence.dev`.

### Layout
`AdminLayout` (`src/client/components/admin/AdminLayout.tsx`) — dark forest sidebar with brand, nav, user card; sticky topbar with breadcrumbs/search/avatar; page header w/ title+subtitle+actions+gradient divider.

`ui.tsx` exports: `AdminButton` (primary/outline/ghost/danger; sm/md), `AdminCard`, `Field`, `Input`, `Textarea`, `Select`, `Toggle`, `StatTile`, `Badge` (neutral/success/warning/danger/info/gold), `EmptyState`.

### Pages (`src/client/pages/admin/`)
- `AdminDashboard` — stat tiles, recent orders table, recent messages list, top plants grid, quick actions
- `AdminPlants` — searchable/filterable list with thumbnails, badges, inline delete
- `AdminPlantEditor` — full create/edit form (identity, description, care, images, pricing, inventory, visibility, tags) with image-URL builder + tag chips + auto-slug
- `AdminOrders` — list with status select, search, status badges, link to detail
- `AdminOrderDetail` — items, totals, customer card, address, status updater
- `AdminReviews` — review cards with verified badge and delete
- `AdminTestimonials` — grid with editor modal (create/edit), delete
- `AdminSubscribers` — list + CSV export + delete
- `AdminMessages` — split-view inbox (threads list + reader pane with mailto reply / delete)

### Routes
Added admin routes under `AdminRoute` guard (redirects to `/login` if unauth, to `/` if not admin).
Admin shortcut card on `/account` for users with admin role.

## Current Status
App running clean (HTTP 200, no TypeScript errors). Admin panel available at `/admin`. Demo admin: `demo@modelence.dev` / `12345678`.
