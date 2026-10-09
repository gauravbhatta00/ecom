# Orderable clothing catalog

This guide describes the clothing catalog, administration, and local checkout workflow.

## What is available

- **Men:** Shirts & T-shirts, Jackets, Trousers, Knitwear.
- **Women:** Shirts & T-shirts, Jackets, Trousers, Knitwear, Dresses & Sets.
- **Kids:** Shirts & T-shirts, Jackets, Trousers, Knitwear, Dresses & Sets.
- Nine clothing test products, each initialized with 25 units and an uploaded JPG photograph. Some subcategories are intentionally ready for additional products.
- The storefront reads Django inventory in `live` catalog mode. Add to bag and authenticated cash-on-delivery checkout are enabled. This is test inventory; there is no online payment or fulfillment integration.

## Administration

Open http://localhost:5173/admin and use the existing administrator account.

**Categories** in the sidebar opens `/admin/products?view=categories`. Create a main category with no parent, or select Men, Women, or Kids as the parent to create a subcategory. Subcategory names may repeat under different parents. Edit and delete controls are provided; a category containing products or subcategories cannot be deleted until they are moved or removed.

**Products → Add product** has separate Category and Subcategory fields. A product must belong to a subcategory. Choose **Upload photo** for JPG/JPEG, PNG, WebP, or GIF files up to 10 MB. Files retain their original format. The editor previews the photograph. A new upload replaces the existing product photo; an optional image URL can also be used.

**Orders** exposes order lines and delivery details. New orders persist the recipient, address, phone, and payment method. Server-side checks enforce available stock and cart ownership. Checkout uses a transaction, decreases stock, and clears the bag only after creating the order.

## Testing an order

1. Keep Django running on port 8000 and the frontend on port 5173.
2. Open the collection, add an item to the bag, and sign in or register.
3. Enter delivery details at checkout and select cash on delivery.
4. Find the result in My orders and the admin Orders section.

The catalog revision `clothing-20261008` starts a fresh browser bag, wishlist, and recently-viewed history so obsolete catalog IDs are not reused. Existing login storage is unchanged.

## Reset and backups

The previous 13 products and their categories were removed from the local database. Related old cart items were removed. Login accounts and the 12 existing orders were preserved. Historical order lines keep their original product names even after product deletion.

Backups are ignored by Git and stored locally:

- `backend/.backups/before-clothing-20261008-123724.dump`: full PostgreSQL archive before the schema migration.
- `backend/.backups/catalog-20261008-205021-7a7b1f.json`: catalog, cart, and order fixture before replacement.

Old media files were retained for recovery. New seeded photographs live in Django's media storage; the original sample photographs remain under `frontend/public/images/fashion/` for reproducible seeding.

Backend management commands are provided for future use:

```powershell
# Run from backend. This command REPLACES products and categories after backing them up.
.\venv\Scripts\python.exe manage.py reset_clothing_catalog --replace
# Add --clear-orders only when old orders and carts should also be removed.
```

After a future reset, change `NEXT_PUBLIC_CATALOG_REVISION` to a new value and restart/rebuild the frontend. `NEXT_PUBLIC_CATALOG_MODE=live` is configured in local `.env.local` and documented in `.env.example`.

## Hero, order progress, and readable URLs

The homepage uses a neutral clothing editorial with direct Women, Men, and Kids links. Customer orders and expanded admin order details show Placed → Processing → Shipped → Delivered. Cancelled orders show a separate stopped state; no delivery dates are invented.

Product slugs are generated automatically from the original name plus the product ID, for example `/product/classic-denim-jeans-16`. Migration `0009_product_slug` fills existing products. Renaming a product or category preserves its slug. Product URLs and category filter URLs are visible in their admin forms. Category links now use slugs such as `/products?category=men-jackets`; old numeric product and category links still work.

## Verification

- 13 backend tests passed, including hierarchy validation, authorization, JPEG/PNG/WebP/GIF upload, photo replacement, cart ownership, stock limits, delivery persistence, preserved order snapshots, reset backups, and stable unique slugs.
- 33 frontend regression tests passed, including parent/child category filters, readable URLs, and legacy numeric URLs.
- Lint, TypeScript, production build, migration consistency, and Django system checks passed.
- A PostgreSQL-backed API flow verified JWT login → bag → COD order → stock reduction → customer/admin order visibility. All temporary test records were rolled back.
- Running HTTP checks verified the new catalog, JPG media delivery, storefront rendering, and admin/category/checkout routes. Browser interaction was not visually verified.

```powershell
# Backend: isolated test database
.\venv\Scripts\python.exe manage.py test store --settings=backend.test_settings --noinput
# Backend: transactional check against configured database; always rolls back
.\venv\Scripts\python.exe manage.py verify_clothing_checkout
```

```sh
# Frontend
npm run lint
node --test tests/*.test.mjs
npm run typecheck
npm run build
```
