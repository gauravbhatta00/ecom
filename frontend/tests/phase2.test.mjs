import test from "node:test";
import assert from "node:assert/strict";
import { createSourceLoader } from "./source-loader.mjs";

const dto = {
  id: 7, name: "Everyday watch", description: "A simple watch.", price: "48.50",
  category: { id: 5, name: "Accessories", slug: "accessories" },
  image_url: "http://127.0.0.1:8000/media/watch.jpg", stock: 4,
  created_at: "2026-03-22T11:17:05.749395Z",
};

test("only trusted public product uploads are routed through image resizing", () => {
  const { productImageSource } = createSourceLoader().load("lib/product-image");
  assert.equal(productImageSource("https://api.example.test/media/products/photo.jpg"), "/catalog-media/photo.jpg");
  for (const src of ["/images/sample.webp", "https://other.test/media/products/photo.jpg", "https://api.example.test/private/photo.jpg", "https://api.example.test/media/products/photo.jpg?token=private"]) {
    assert.equal(productImageSource(src), src);
  }
});

test("Django adapter preserves prices and stock without inventing social proof", () => {
  const { load } = createSourceLoader();
  const product = load("lib/api/products").adaptDjangoProduct(dto);
  assert.equal(product.price, 48.5);
  assert.equal(product.stock, 4);
  assert.equal(product.id, "live-7");
  assert.equal(product.rating, undefined);
  assert.equal(product.bestseller, false);
  assert.equal(product.images[0], "https://api.example.test/media/watch.jpg");
});

test("invalid products and unsafe image schemes are rejected", () => {
  const { load } = createSourceLoader();
  const api = load("lib/api/products");
  for (const price of [-1, "not-a-price", null, ""]) assert.throws(() => api.adaptDjangoProduct({ ...dto, price }));
  assert.throws(() => api.adaptDjangoProduct({ ...dto, stock: -1 }));
  assert.equal(api.normalizeProductImage("javascript:alert(1)"), undefined);
});

test("live API errors never silently switch to demo products", async () => {
  const { load } = createSourceLoader({ fetch: async () => new Response("{}", { status: 503 }) });
  await assert.rejects(load("lib/api/products").getProducts(), error => error.status === 503);
});

test("demo products require explicit mode and never have backend IDs", async () => {
  const { load } = createSourceLoader({ mode: "demo" });
  const products = await load("lib/api/products").getProducts();
  assert.equal(products.length, 6);
  assert.ok(products.every(product => product.source === "demo" && product.backendId === undefined));
});

test("an unavailable live homepage retains its explicit error state", async () => {
  const { load } = createSourceLoader({ fetch: async () => new Response("{}", { status: 503 }) });
  const home = await load("lib/api/home").getHomeCatalog();
  assert.equal(home.unavailable, true);
  assert.equal(home.source, "live");
  assert.equal(home.products.length, 0);
});

test("discounts and newest order use real prices and dates", () => {
  const { load } = createSourceLoader();
  const product = load("lib/api/products").adaptDjangoProduct(dto);
  const { discountPercent, newestProducts } = load("lib/product");
  assert.equal(discountPercent({ ...product, price: 75, compareAtPrice: 100 }), 25);
  assert.equal(discountPercent({ ...product, compareAtPrice: 20 }), 0);
  assert.equal(newestProducts([product, { ...product, id: "new", createdAt: "2026-10-01T00:00:00Z" }])[0].id, "new");
});

test("wishlist toggles, persists, and separates live from sample identities", async () => {
  const first = createSourceLoader();
  const product = first.load("lib/api/products").adaptDjangoProduct(dto);
  const store = first.load("stores/wishlist-store").useWishlistStore;
  store.getState().toggle(product);
  store.getState().toggle({ ...product, id: "demo-7", source: "demo" });
  assert.equal(store.getState().items.length, 2);
  const second = createSourceLoader({ storage: first.storage });
  const restored = second.load("stores/wishlist-store").useWishlistStore;
  assert.equal(restored.getState().items.length, 0);
  await restored.persist.rehydrate();
  assert.equal(restored.getState().items.length, 2);
  restored.getState().toggle(product);
  assert.equal(restored.getState().items.length, 1);
});

test("malformed or unsafe persisted wishlist entries do not hydrate", async () => {
  for (const value of ["invalid JSON", JSON.stringify({ version: 1, state: { items: [{ id: "bad", name: "Bad", href: "//evil.test", price: 2, source: "live" }] } })]) {
    const { load } = createSourceLoader({ storage: new Map([["lelovailelo-wishlist", value]]) });
    const store = load("stores/wishlist-store").useWishlistStore;
    await store.persist.rehydrate();
    assert.equal(store.getState().items.length, 0);
  }
});

test("wishlist still works when browser storage is blocked", () => {
  const { load } = createSourceLoader({ blockedStorage: true });
  const product = load("lib/api/products").adaptDjangoProduct(dto);
  const store = load("stores/wishlist-store").useWishlistStore;
  assert.doesNotThrow(() => store.getState().toggle(product));
  assert.equal(store.getState().items.length, 1);
});

test("quick-add mutation guard prevents concurrent submissions", () => {
  const store = createSourceLoader().load("stores/cart-ui-store").useCartUiStore;
  assert.equal(store.getState().begin("live-1"), true);
  assert.equal(store.getState().begin("live-2"), false);
  store.getState().finish();
  assert.equal(store.getState().begin("live-2"), true);
});

test("newsletter requires valid email and consent", () => {
  const schema = createSourceLoader().load("lib/validation/newsletter").newsletterSchema;
  assert.equal(schema.safeParse({ email: "invalid", consent: true }).success, false);
  assert.equal(schema.safeParse({ email: "shopper@example.com", consent: false }).success, false);
  assert.equal(schema.parse({ email: " shopper@example.com ", consent: true }).email, "shopper@example.com");
});

test("partial cart sync preserves rejected quantities and does not replay confirmed units", async () => {
  let calls = 0;
  const { load, context } = createSourceLoader({ fetch: async () => {
    calls++;
    return new Response("{}", { status: calls === 2 ? 503 : 200 });
  } });
  let remaining = [{ id: 7, quantity: 3 }];
  const { syncGuestItems } = load("lib/api/cart");
  await assert.rejects(syncGuestItems(remaining, items => { remaining = items; }));
  assert.equal(remaining[0].quantity, 2);
  let retries = 0;
  context.fetch = async () => { retries++; return new Response("{}"); };
  await syncGuestItems(remaining, items => { remaining = items; });
  assert.equal(retries, 2);
  assert.equal(remaining.length, 0);
});

test("invalid guest quantities never reach the API", async () => {
  const { load } = createSourceLoader();
  await assert.rejects(load("lib/api/cart").syncGuestItems([{ id: 7, quantity: -1 }], () => {}));
});
