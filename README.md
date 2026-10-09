# LeloVaiLelo

A clothing storefront and admin dashboard built with Next.js, React, Django REST Framework, and PostgreSQL.

## Project layout

```text
backend/
  backend/          Django configuration and isolated test settings
  store/            Models, API views, serializers, migrations, and tests
    management/     Database backup, catalog reset, and checkout verification
frontend/
  src/app/          Next.js routes, metadata, and newsletter endpoint
  src/screens/      Customer screens routed by React Router
  src/components/   Shared UI and feature folders: admin, dashboard, orders, etc.
  src/context/      Authentication, cart, and toast providers
  src/lib/          API adapters, validation, and shared utilities
  src/stores/       Wishlist, recent products, and cart UI state
  src/styles/       Global and admin styles
  public/images/    Clothing photographs
  tests/            Frontend regression tests
docs/               Catalog workflows and asset provenance
```

## Local setup

Use Python 3.12+ (Django 6), PostgreSQL, and Node.js 22.13+. Run the two servers in separate terminals.

### Backend (PowerShell)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\venv\Scripts\python.exe -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Set `DJANGO_SECRET_KEY` to the generated value in `.env` and enter your PostgreSQL credentials. Create the configured database before migrating. Copy templates only for a new installation; preserve existing local configuration.

```powershell
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py createsuperuser
.\venv\Scripts\python.exe manage.py runserver
```

### Frontend

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:5173 and http://localhost:5173/admin. The API runs on http://localhost:8000. See [catalog administration](docs/clothing-catalog.md) for categories, photo uploads, test inventory, and checkout.

## Verification

From `frontend/`: `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.

From `backend/`:

```powershell
.\venv\Scripts\python.exe manage.py test store --settings=backend.test_settings --noinput
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe manage.py makemigrations --check --dry-run
```

## Configuration and private data

- Real credentials belong in `backend/.env` or server environment variables. Frontend server-only newsletter credentials belong in `frontend/.env.local` or server environment variables.
- `NEXT_PUBLIC_*` values are visible to browsers; use them only for public configuration.
- The root `.gitignore` excludes environments, keys, credential files, uploaded media, database dumps, logs, local tooling, dependencies, and generated builds. Commit only placeholder `.env.example` templates.
- Django requires an environment secret and defaults to debug disabled. Set `DJANGO_DEBUG=True` only for local development.
- The previously committed development secret was replaced during cleanup. Existing sessions/tokens may require signing in again. Its old value remains in local Git history but is no longer used. No history was rewritten.

See [frontend architecture](frontend/README.md) and [photograph sources](docs/assets.md).
