# LeloVaiLelo frontend

Phase 2 adds a server-rendered homepage, shared merchandising components, an Embla carousel, Zustand wishlist, and a validated newsletter form to the existing Django-connected Next.js store. New components use strict TypeScript, Tailwind 4, shadcn-style Radix primitives, Lucide, Motion, and Sonner.

## Run locally

Use Node 22.13+ (recommended for the installed lint tooling) and npm.

```sh
npm install
npm run dev
```

Open http://localhost:5173. Keeping the original development origin preserves existing guest carts, login storage, Google origin configuration, and local password-reset links.

Existing `VITE_DJANGO_BASE_URL` and `VITE_GOOGLE_CLIENT_ID` settings continue to work. New installations can copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_API_URL`: Django origin, without an ending slash.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: optional public Google client ID.
- `NEXT_PUBLIC_SITE_URL`: the public frontend origin used for canonical/OG URLs.

Only these public settings are exposed. Never put backend credentials in `NEXT_PUBLIC_*` variables.

## Verify and build

```sh
npm run lint
npm run typecheck
npm run test:phase2
npm run build
npm start
```

The production preview starts on http://localhost:3000; set `PORT` to change it. Set `NEXT_PUBLIC_SITE_URL` to your deployment origin before building. Django's `FRONTEND_URL` and Google authorized origins must match the frontend origin used for authentication/reset flows.

## Structure

- `src/app/`: Next server layout, metadata, catch-all migration route, error and not-found pages.
- `src/components/layout/`: header, account menu, mobile navigation, footer, announcement bar.
- `src/components/navigation/`: category links and desktop mega menu.
- `src/components/ui/`: reusable TypeScript primitives and button variants.
- `src/lib/api/`: typed API transport and validated Django category adapter.
- `src/data/`: navigation and announcement content.
- `src/hooks/`, `src/types/`: reusable hooks and models.
- `src/pages/`, `src/context/`: preserved React Router pages and state, migrated in later phases.

`pageExtensions` deliberately excludes JSX so Next does not also interpret the legacy `src/pages/*.jsx` files as Pages Router routes. The client-only compatibility boundary protects existing BrowserRouter/localStorage code from server execution. It is temporary; public pages will move to server components in their planned phases.

Do not remove DaisyUI yet: existing dashboard/admin screens use it. Vite entry/configuration files are retained as migration reference, but npm scripts now use Next. The Vite entry is not a supported second runtime after the environment/image migration.

See [Phase 2 report](PHASE_2.md) for the current file list, validation and next phase; [Phase 1 report](PHASE_1.md) for the foundation; and [asset notes](ASSETS.md) for image provenance and the generation prompt.

Live data is the default. Set NEXT_PUBLIC_CATALOG_MODE=demo only for a labelled sample preview. Newsletter sign-ups remain disabled until the server-only NEWSLETTER_ENDPOINT is configured. The Phase 2 report describes the endpoint contract.
