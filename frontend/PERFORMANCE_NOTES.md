# Navigation and image performance follow-up

## Changes

- Removed the scrolling announcement strip from the shared header. The header is now static and opaque, with no scroll listener, sticky positioning, or backdrop blur. Mobile navigation remains available.
- Removed the unused marquee animation rules and adjusted anchor scroll spacing for the static header.
- Shared internal links use React Router within the legacy app and Next navigation when crossing to/from the homepage. Disabled speculative Next link prefetching to avoid fetching the legacy app for every visible link. Saved-item links close their drawer when selected.
- Render the hero outside the catalog Suspense boundary so catalog latency does not delay the hero.
- Route only the configured backend's public product uploads through `/catalog-media/`, then use Next Image resizing and its cache. External images remain direct; there is no arbitrary external image proxy or global private-network image allowance.
- Use resized images in product cards, category tiles, saved items, product details, and cart thumbnails. Failed detail images now show the shared unavailable-image state instead of unrelated sample photography.
- Retain cart and wishlist persistence. Code inspection found small JSON records, not image data or continuous storage writes; browser storage was not identified as a bottleneck.

## Verification

Production HTTP checks confirmed a rendered homepage, no announcement marquee, a static header, optimized product URLs, existing storefront routes returning 200, and an unknown route returning 404.

Measured with `Accept: image/webp`, width 640, quality 75:

| Product photo | Original bytes | Resized bytes | Reduction |
| --- | ---: | ---: | ---: |
| Frying pan | 3,914,158 | 13,908 | 99.6% |
| Sneakers | 3,046,061 | 92,974 | 96.9% |
| Laptop | 2,326,658 | 47,634 | 98.0% |

All three optimized responses were HTTP 200 WebP; repeated requests returned `x-nextjs-cache: HIT`. Results describe image transfer sizes, not measured frame rate or Core Web Vitals. First requests for uncached image sizes still require image processing. The existing hero was already optimized through Next Image.

Lint, TypeScript, production build, and 14 tests passed. The added test verifies that private paths, other origins, and signed image URLs are not rewritten. An interactive browser was unavailable, so visual, touch, keyboard navigation, and browser CPU profiling require a follow-up check.

## Files

Created: `src/lib/product-image.ts`, `PERFORMANCE_NOTES.md`.

Modified:

- `next.config.ts`
- `src/index.css`
- `src/app/page.tsx`
- `src/components/Navbar.jsx`
- `src/components/layout/header.tsx`
- `src/components/layout/storefront-frame.tsx`
- `src/components/home/home-page.tsx`
- `src/components/ui/store-link.tsx`
- `src/components/product/product-image.tsx`
- `src/components/product/wishlist-sheet.tsx`
- `src/pages/ProductDetails.jsx`
- `src/pages/CartPage.jsx`
- `tests/phase2.test.mjs`

No dependencies, backend data, or storage keys changed. Phase 3 remains pending. Restart Next after pulling these changes because the image rewrite is in the server configuration. Use a production build (`npm run build`, then `npm run start`) when assessing performance; development includes compilation overhead.
