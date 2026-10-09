import test from "node:test";
import assert from "node:assert/strict";
import { createSourceLoader } from "./source-loader.mjs";

function catalog() {
  const loader = createSourceLoader();
  const adapt = loader.load("lib/api/products").adaptDjangoProduct;
  const base = { description: "Everyday cotton piece", category: { id: 1, name: "Clothing", slug: "clothing" }, image_url: null, created_at: "2026-01-01T00:00:00Z", stock: 3 };
  return { ...loader, products: [
    adapt({ ...base, id: 1, name: "Blue shirt", price: "30.00" }),
    adapt({ ...base, id: 2, name: "Black shirt", price: "60.00", stock: 0, created_at: "2026-03-01T00:00:00Z" }),
    adapt({ ...base, id: 3, name: "Canvas bag", price: "20.00", category: { id: 2, name: "Accessories", slug: "accessories" } }),
  ] };
}
test("combined shareable filters use real category, inclusive prices, search and stock", () => {
  const { load, products } = catalog();
  const filter = load("lib/catalog").filterProducts;
  assert.deepEqual(Array.from(filter(products, new URLSearchParams("category=1&min=30&max=60&available=1&q=shirt")), p => p.id), ["live-1"]);
  assert.equal(filter(products, new URLSearchParams("category=Accessories")).length, 1);
  assert.equal(filter(products, new URLSearchParams("q=no-such-piece")).length, 0);
});
test("sorts are stable and don't mutate source catalog", () => {
  const { load, products } = catalog();
  const filter = load("lib/catalog").filterProducts;
  const ids = values => Array.from(values, p => p.id);
  assert.deepEqual(ids(filter(products, new URLSearchParams("sort=low"))), ["live-3", "live-1", "live-2"]);
  assert.deepEqual(ids(filter(products, new URLSearchParams("sort=high"))), ["live-2", "live-1", "live-3"]);
  assert.equal(filter(products, new URLSearchParams("sort=new"))[0].id, "live-2");
  assert.deepEqual(ids(products), ["live-1", "live-2", "live-3"]);
});
test("malformed prices are ignored and contradictory ranges have no matches", () => {
  const { load, products } = catalog();
  const { readFilters, filterProducts } = load("lib/catalog");
  for (const value of ["NaN", "Infinity", "-1", " "]) assert.equal(readFilters(new URLSearchParams({ min: value })).min, undefined);
  assert.equal(filterProducts(products, new URLSearchParams("min=100&max=10")).length, 0);
});
test("recommendations exclude the current item and unrelated categories", () => {
  const { load, products } = catalog();
  assert.deepEqual(Array.from(load("lib/catalog").relatedProducts(products, products[0]), p => p.id), ["live-2"]);
});
test("detail API validates product IDs before making network requests", async () => {
  const { load } = createSourceLoader();
  for (const value of ["../admin", "invalid slug", "1?secret=true"]) await assert.rejects(load("lib/api/products").getProduct(value), error => error.status === 404);
});
test("detail API uses existing endpoint and reports unavailable products", async () => {
  const calls = [];
  const { load } = createSourceLoader({ fetch: async url => { calls.push(url); return new Response("{}", { status: 404 }); } });
  await assert.rejects(load("lib/api/products").getProduct("7"), error => error.status === 404);
  assert.deepEqual(calls, ["https://api.example.test/api/products/7/"]);
});
test("recently viewed products persist, deduplicate, and keep only twelve IDs", async () => {
  const storage = new Map();
  const first = createSourceLoader({ storage }).load("stores/recently-viewed-store").useRecentlyViewedStore;
  for (let i = 1; i <= 15; i++) first.getState().add("live-" + i);
  first.getState().add("live-10");
  assert.equal(first.getState().ids[0], "live-10");
  assert.equal(first.getState().ids.length, 12);
  assert.equal(new Set(first.getState().ids).size, 12);
  const second = createSourceLoader({ storage }).load("stores/recently-viewed-store").useRecentlyViewedStore;
  await second.persist.rehydrate();
  assert.equal(second.getState().ids[0], "live-10");
});
test("recent history rejects malformed persisted values", async () => {
  const storage = new Map([["lelovailelo-recently-viewed", JSON.stringify({ state: { ids: [null, 7, "http://evil.test", "live-2", "live-2"] }, version: 0 })]]);
  const store = createSourceLoader({ storage }).load("stores/recently-viewed-store").useRecentlyViewedStore;
  await store.persist.rehydrate();
  assert.deepEqual(Array.from(store.getState().ids), ["live-2"]);
});
test("checkout validates and normalizes the existing API payload", () => {
  const schema = createSourceLoader().load("lib/validation/checkout").checkoutSchema;
  const values = { name: " Alex Smith ", address: " 12 Main Street, City ", phone: "+977 (981) 234-5678", payment_method: "COD" };
  const result = schema.parse(values);
  assert.equal(result.name, "Alex Smith");
  assert.equal(result.phone, "9779812345678");
  assert.equal(result.payment_method, "COD");
  for (const changes of [{ name: "" }, { address: "" }, { phone: "123" }, { phone: "1234567890abc" }, { payment_method: "ONLINE" }]) assert.equal(schema.safeParse({ ...values, ...changes }).success, false);
});
test("login returns only to supported internal customer routes", () => {
  const destination = createSourceLoader().load("lib/login-destination").loginDestination;
  assert.equal(destination("/checkout"), "/checkout");
  assert.equal(destination("/orders?status=pending"), "/orders?status=pending");
  for (const input of ["https://evil.test", "//evil.test", "/admin", "/checkout/../../admin", null]) assert.equal(destination(input), "/");
});
test("bag drawer visibility does not bypass the shared mutation guard", () => {
  const store = createSourceLoader().load("stores/cart-ui-store").useCartUiStore;
  store.getState().setOpen(true);
  assert.equal(store.getState().open, true);
  assert.equal(store.getState().begin("cart-1"), true);
  assert.equal(store.getState().begin("live-2"), false);
  store.getState().setOpen(false);
  assert.equal(store.getState().addingId, "cart-1");
  store.getState().finish();
  assert.equal(store.getState().begin("live-2"), true);
});
