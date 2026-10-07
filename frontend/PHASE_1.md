# Phase 1 — foundation and navigation

## Implemented

- Next.js 16.3.8 App Router foundation inside the existing frontend.
- Strict TypeScript for new code, with unchecked legacy JavaScript retained behind an explicit compatibility boundary.
- CSS design tokens, six button variants, four sizes including icon controls, visible focus, skip link, and reduced-motion support.
- Sticky responsive header, scroll-dependent surface, pauseable announcements, live category mega menu, nested mobile Sheet, account dropdown, and existing cart count.
- Rebuilt editorial footer with existing company, catalog, service, and contact destinations.
- Radix-based Sheet, dropdown, navigation menu, and accordion; shadcn-style Button, Input, and Skeleton; components.json supports further shadcn additions.
- Sonner notifications with the existing useToast API preserved.
- Metadata, canonical URLs, branded SVG icon, private-route noindex, error boundary, unknown-route page, and client-navigation title/robots synchronization.
- Typed API transport, status errors, request cancellation, Headers support, and category response validation.
- Shared public backend configuration compatible with the existing .env.
- Preserved every existing catalog, customer, authentication, checkout, informational, and admin route.

## Migration fixes

- Adapted imported WebP assets to Next static image imports.
- Replaced Vite-only environment expressions in existing API consumers.
- Fixed the previous lint baseline and React hook issues without suppressing errors globally.
- Shared Google sign-in component handles delayed script loading and fails without exposing configuration details to customers.
- Protected routes wait for session restoration. Failed profile retrieval no longer produces a successful login.
- Token refresh retains concurrency protection without an unhandled rejection from an ignored finally promise.
- Multipart authenticated requests preserve browser-generated content types.
- Cart API decimal totals normalize to numbers for existing total.toFixed consumers.
- Profile initialization waits for user data; temporary avatar URLs are revoked.
- Existing search/sort controls now honor URL parameters used by new navigation links.
- Repaired the pre-existing corrupted @types/react declaration file through a dependency update.
- Development stays on port 5173, preserving the original browser-storage origin.

## Design system

| Token group | Decision |
| --- | --- |
| Colors | Cream #f7f6f1, ink #18231c, forest #173c2b, muted sage #e2e8d4, muted text #59655d, border #d8dcd1, destructive #a12f23 |
| Typography | System sans for UI; Georgia serif for editorial headings. No blocking font download. |
| Spacing | 4px base; fluid outer gutters from 32px to 96px total |
| Container | 1280px maximum |
| Radius | 2px, 6px, 8px for new UI; legacy page styling remains until its phase |
| Shadows | Restrained header and overlay shadows |
| Breakpoints | 640, 768, 1024, 1280, 1440px; base layout supports 320px |
| Buttons | primary, secondary, outline, ghost, destructive, icon; sm/md/lg/icon sizes |
| Motion | 150–200ms overlay transitions; announcements pause on hover/focus and explicit control; CSS and Motion honor reduced motion |

## Validation

- npm run lint: passed with zero warnings.
- npm run typecheck: passed.
- npm run build: passed.
- Production HTTP smoke check: 18 existing route URLs returned the Next application shell with appropriate route titles.
- Public hero image and SVG icon returned HTTP 200.
- Next image optimization returned HTTP 200; unknown routes returned HTTP 404; private-page noindex metadata was present.
- Configured live Django API: category and product reads returned HTTP 200; 9 categories and 13 products, with expected fields.
- Isolated regression assertions against actual API/auth source passed: category mapping, Headers preservation, abort signal forwarding, HTTP errors, malformed categories, single refresh for concurrent requests, multipart headers, expired-session cleanup, and server-side token guard.
- CSS output checked for emitted container, typography, color, and overlay rules.
- Responsive breakpoints and narrow header sizing reviewed in code. Browser service reported no available browser, so screenshots, measured overflow, keyboard interaction, and interactive end-to-end flows are NOT claimed as verified.
- Authenticated live writes, Google sign-in, password emails, real checkout, and admin mutations were not performed.
- npm reported 20 dependency advisories during installation (2 low, 3 moderate, 15 high). A dependency-security review remains outstanding; no forced major upgrades were applied as part of the UI migration.

## Files created

Paths below are relative to frontend/.

```text
.env.example
components.json
next.config.ts
postcss.config.mjs
tsconfig.json
PHASE_1.md
src/app/layout.tsx
src/app/[[...slug]]/page.tsx
src/app/error.tsx
src/app/not-found.tsx
src/app/icon.svg
src/components/legacy-app.tsx
src/components/auth/google-sign-in.tsx
src/components/layout/account-menu.tsx
src/components/layout/announcement-bar.tsx
src/components/layout/footer.tsx
src/components/layout/header.tsx
src/components/layout/logo.tsx
src/components/layout/mobile-nav.tsx
src/components/layout/not-found.tsx
src/components/layout/route-effects.tsx
src/components/navigation/category-links.tsx
src/components/navigation/mega-menu.tsx
src/components/ui/accordion.tsx
src/components/ui/button.tsx
src/components/ui/dropdown-menu.tsx
src/components/ui/input.tsx
src/components/ui/navigation-menu.tsx
src/components/ui/sheet.tsx
src/components/ui/skeleton.tsx
src/data/navigation.ts
src/hooks/use-categories.ts
src/lib/api/categories.ts
src/lib/api/client.ts
src/lib/config.ts
src/lib/routes.ts
src/lib/utils.ts
src/types/category.ts
src/types/session.ts
```

Next also generates ignored next-env.d.ts, .next output, and TypeScript build information.

## Files modified

```text
.gitignore
README.md
package.json
package-lock.json
eslint.config.js
src/App.jsx
src/index.css
src/components/AdminRoute.jsx
src/components/Footer.jsx
src/components/LoginForm.jsx
src/components/Navbar.jsx
src/components/PrivateRouter.jsx
src/components/ProductCard.jsx
src/components/SignUpform.jsx
src/context/AuthContext.jsx
src/context/CartContext.jsx
src/context/ToastContext.jsx
src/pages/AdminDashboard.jsx
src/pages/AdminProducts.jsx
src/pages/CartPage.jsx
src/pages/CheckoutPage.jsx
src/pages/Contact.jsx
src/pages/Dashboard.jsx
src/pages/ForgotPassword.jsx
src/pages/Orders.jsx
src/pages/ProductDetails.jsx
src/pages/ProductList.jsx
src/pages/Profile.jsx
src/pages/ResetPassword.jsx
src/utils/auth.js
```

src/lib/utils.js was replaced by src/lib/utils.ts. No backend models, endpoints, database contents, or environment secrets were changed.

## Next phase and deliberate boundaries

Phase 2: separate server-rendered homepage, new editorial sections, product cards/grids/skeletons, Embla carousel, explicit live/mock product adapters, and the initial shared state needed by card actions.

Search currently links to the working catalog search; the full command-style dialog belongs to Phase 3. Wishlist actions/badge, cart drawer, and newsletter/social/payment UI will be introduced with their planned features rather than exposing dead controls. Backend categories have no subcategory hierarchy, so the current menu uses their actual flat structure under an accessible nested Shop section.

The existing hero and catalog presentation are retained for Phase 2. The full shadcn library is added on demand; Zustand, Embla, React Hook Form and Zod are not installed prematurely. The temporary client-rendered legacy pages are not the final SEO/server-component architecture.

Known backend gaps remain: variants, reviews, coupons, addresses, verification, refunds, and payment integration. Existing cart ownership checks and reliable guest/server synchronization require their separately identified work; this phase does not claim to repair them.

No automatic continuation to Phase 2.
