# Phase 2 — homepage and merchandising

## Delivered

- A dedicated Next.js server-rendered homepage, separate from the legacy catalog.
- Original editorial campaign photography and a responsive split hero.
- Featured category cards, Embla product carousel, new arrivals, promotional banner, category directory, featured collection, brand story, customer-story section, newsletter form, and social-gallery placeholder.
- Reusable typed ProductCard, ProductGrid, ProductCardSkeleton, and image-error component.
- Cards support alternate imagery, badges, real discounts, available color swatches, ratings when supplied, wishlist buttons, and pending/disabled/out-of-stock quick-add states.
- Live Django product normalization with runtime Zod validation. Prices, names, stock and category identities are preserved.
- Explicit sample catalog in data/products.ts and data/categories.ts. Set NEXT_PUBLIC_CATALOG_MODE=demo before building to preview it. Default is live. Failed live requests never fall back to sample inventory.
- No fabricated bestseller/review metadata on live products. The live carousel is labelled “The everyday edit” unless a data adapter actually supplies bestseller flags.
- Zustand wishlist with device persistence, hydration protection, malformed-data validation, namespaced live/demo identity, and a header Sheet for viewing/removing saved products.
- Shared Zustand mutation guard prevents multiple product-card quick-add submissions.
- Quick add uses the existing guest/server cart; no second competing live cart store was introduced.
- React Hook Form + Zod newsletter validation with shadcn-style Form components and Sonner feedback.
- Newsletter server proxy supports an optional server-only service endpoint. It is disabled with a coming-soon state until configured; it never pretends to subscribe customers.
- Sample testimonials are labelled and only rendered in demo mode. The live section invites customer stories rather than inventing endorsements.
- Social gallery is explicitly a campaign/sample moodboard, not a fabricated live social feed.

## Architecture and compatibility

The homepage is src/app/page.tsx. Server components fetch and compose catalog content; small client components provide carousel, card, menu, and form interactions. Homepage-only Suspense provides loading skeletons while retaining proper HTTP 404 behavior elsewhere.

The old optional catch-all route became src/app/[...slug]/page.tsx so it can coexist with the explicit root page. All original non-home routes remain supported. Shared navigation uses native anchors to cross between Next routes and the temporary React Router application without router conflicts. Internal legacy navigation to / hands control back to the server homepage.

The original fixed hero was removed from the collection page. That page now consumes the shared product adapter and new cards, while Phase 3 filters remain pending. Superseded Hero.jsx and ProductCard.jsx were removed; original image files were preserved.

Authentication initializes consistently on server and client, then restores browser credentials. Cart initialization waits for session restoration. Quick-add waits for cart initialization, returns explicit success/failure, checks stock and HTTP status, and updates server cart totals from confirmed responses.

Guest synchronization now saves each acknowledged unit; rejected quantities remain persisted rather than clearing the whole guest bag. Network ambiguity after a server accepts a request still needs backend idempotency in the later cart integration. Full variant-aware Zustand cart migration remains Phase 5.

## Verification

Passed:
- npm run lint (zero warnings).
- npm run typecheck (includes Next route type generation).
- npm run build.
- npm run test:phase2 — 13 tests.
- Production HTTP check: server-rendered homepage headline, editorial sections, and live product cards.
- All 16 retained page route shells returned HTTP 200.
- Unknown route returned HTTP 404.
- Private-page noindex metadata retained.
- Campaign/sample image assets load.
- Next image optimization returned WebP; the 1080px campaign response measured 95,808 bytes in the verification request.
- Invalid newsletter input returns HTTP 400.
- Unconfigured newsletter returns HTTP 503 instead of a false success.

Tests cover product normalization and invalid values, safe image URLs, explicit live/demo separation, API failure state, date sorting/discount math, wishlist toggling/persistence/hydration/storage denial, concurrent-add guard, newsletter validation, and partial guest-cart synchronization.

Browser runtime reported no available browser. Responsive layout was reviewed in code for 320/375/768/1024/1280/1440+ widths. Actual screenshots, measured overflow, touch gestures, focus traversal, and full interactive account/checkout flows remain unverified. No live customer orders, admin changes, emails, or subscriptions were submitted.

## Configuration

Live catalog is the default:
- NEXT_PUBLIC_CATALOG_MODE=live

Optional demo:
- NEXT_PUBLIC_CATALOG_MODE=demo
- Demo inventory/ratings/stories are labelled.
- Demo quick-add is disabled; it cannot enter real checkout.

Optional newsletter service:
- NEWSLETTER_ENDPOINT: server-only URL accepting POST { email, consent }.
- NEWSLETTER_API_KEY: optional server-only Bearer token.
- Configure consent handling, unsubscribe behavior and abuse controls at the receiving service.
- These credentials are never included in client props or public configuration.

Development remains npm run dev on port 5173. The Phase 2 production preview was started on http://localhost:3001. npm start retains its default port 3000.

## Files created

Paths are relative to frontend/.

```text
PHASE_2.md
ASSETS.md
public/images/everyday-editorial.png
public/images/canvas-backpack.webp
public/images/sage-lamp.webp
public/images/forest-headphones.webp
src/app/page.tsx
src/app/api/newsletter/route.ts
src/components/home/home-page.tsx
src/components/home/hero-section.tsx
src/components/home/featured-categories.tsx
src/components/home/best-sellers.tsx
src/components/home/new-arrivals.tsx
src/components/home/promotional-banner.tsx
src/components/home/shop-by-category.tsx
src/components/home/featured-collection.tsx
src/components/home/brand-story.tsx
src/components/home/testimonials.tsx
src/components/home/newsletter.tsx
src/components/home/social-gallery.tsx
src/components/home/section-heading.tsx
src/components/home/reveal.tsx
src/components/layout/storefront-frame.tsx
src/components/layout/home-redirect.tsx
src/components/product/product-card.tsx
src/components/product/product-grid.tsx
src/components/product/product-card-skeleton.tsx
src/components/product/product-image.tsx
src/components/product/wishlist-sheet.tsx
src/components/ui/badge.tsx
src/components/ui/form.tsx
src/components/ui/store-link.tsx
src/data/categories.ts
src/data/products.ts
src/data/home.ts
src/hooks/use-quick-add.ts
src/hooks/use-store-hydration.ts
src/lib/product.ts
src/lib/safe-storage.ts
src/lib/api/products.ts
src/lib/api/home.ts
src/lib/api/cart.ts
src/lib/api/newsletter.ts
src/lib/validation/newsletter.ts
src/stores/wishlist-store.ts
src/stores/cart-ui-store.ts
src/types/product.ts
tests/source-loader.mjs
tests/phase2.test.mjs
```

## Files modified

```text
.env.example
package.json
package-lock.json
README.md
src/App.jsx
src/app/layout.tsx
src/components/layout/header.tsx
src/components/layout/account-menu.tsx
src/components/layout/footer.tsx
src/components/layout/logo.tsx
src/components/layout/mobile-nav.tsx
src/components/layout/not-found.tsx
src/components/navigation/category-links.tsx
src/components/navigation/mega-menu.tsx
src/context/AuthContext.jsx
src/context/CartContext.jsx
src/lib/api/categories.ts
src/pages/ProductList.jsx
src/pages/ProductDetails.jsx
src/utils/auth.js
```

Renamed:
- src/app/[[...slug]]/page.tsx → src/app/[...slug]/page.tsx

Removed after replacing their consumers:
- src/components/Hero.jsx
- src/components/ProductCard.jsx

No backend models, database content, or environment secret values were changed.

## Next: Phase 3

Collection/category routes, comprehensive URL-backed filtering and sorting, filter chips/reset, mobile filter Sheet, pagination/load-more, and command-style search. Full product gallery/variants and the complete cart/wishlist pages stay in their later phases.

No automatic continuation to Phase 3.
