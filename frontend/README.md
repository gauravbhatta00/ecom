# Frontend

Next.js is the only frontend build and runtime. The homepage uses server components; the catch-all route mounts the React Router app for customer and admin screens. Shared providers preserve login and cart behavior across those screens.

## Run and verify

```sh
npm ci
npm run dev
npm test
npm run lint
npm run typecheck
npm run build
```

Development and `npm start` use port 5173. Keep Django running on port 8000. Run one frontend server at a time. Stop a production preview before rebuilding, then restart it to avoid stale asset references.

## Code organization

- `src/app/`: Next routes, layout, metadata, errors, and server newsletter endpoint.
- `src/screens/`: customer route screens (JSX and TypeScript).
- `src/components/`: shared primitives and feature folders including admin, dashboard, orders, product, cart, home, and navigation.
- `src/context/`: authentication, cart, and toast providers.
- `src/lib/`: validated API adapters, URL helpers, and shared validation.
- `src/hooks/`, `src/stores/`, `src/types/`: reusable hooks, persistent UI state, and models.
- `src/styles/`: global design styles and admin styles. DaisyUI remains required by existing customer screens.
- `public/images/fashion/`: local clothing imagery; [sources](../docs/assets.md).
- `tests/`: Node regression tests, all run by `npm test`.

## Environment

Copy `.env.example` to `.env.local` only on a fresh installation. Never overwrite an existing configured file.

- `NEXT_PUBLIC_API_URL`: Django origin.
- `NEXT_PUBLIC_SITE_URL`: frontend origin for canonical and social URLs.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: optional public Google client ID.
- `NEXT_PUBLIC_CATALOG_MODE`: `live` for orderable Django inventory; `demo` for the non-purchasable preview.
- `NEXT_PUBLIC_CATALOG_REVISION`: separates saved catalog state after an intentional catalog reset.

Public settings are included in the browser bundle. Keep passwords, secret keys, and service tokens out of `NEXT_PUBLIC_*` variables. Configure Google authorized origins and Django's `FRONTEND_URL` to match this frontend.

Newsletter configuration is server-only: `NEWSLETTER_ENDPOINT` receives a JSON POST containing `email` and `consent: true`. If `NEWSLETTER_API_KEY` is set, the request includes `Authorization: Bearer <key>`. The service must return a successful HTTP response; requests time out after eight seconds. Without an endpoint, sign-ups remain disabled.

See [project setup](../README.md) and [catalog workflows](../docs/clothing-catalog.md).
