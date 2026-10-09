import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createSourceLoader } from "./source-loader.mjs";

test("clothing preview has distinct, local photographs and covers every clothing category", async () => {
  const { load } = createSourceLoader({ mode: "demo" });
  const products = await load("lib/api/products").getProducts();
  const categories = await load("lib/api/categories").getCategories();
  assert.equal(new Set(products.map(product => product.id)).size, products.length);
  assert.equal(new Set(products.map(product => product.images[0])).size, products.length);
  assert.deepEqual(Array.from(categories, category => category.slug), ["tops-shirts", "denim-trousers", "layers-knitwear", "dresses-sets"]);
  for (const category of categories) assert.ok(products.some(product => product.category.id === category.id));
  for (const product of products) {
    assert.equal(product.source, "demo");
    assert.equal(product.backendId, undefined);
    assert.equal(product.rating, undefined);
    assert.ok(fs.existsSync(new URL(`../public${product.images[0]}`, import.meta.url)));
  }
});

test("sample product links resolve to the same garment without contacting the backend", async () => {
  const { load } = createSourceLoader({ mode: "demo" });
  const api = load("lib/api/products");
  const products = await api.getProducts();
  for (const product of products) {
    const href = load("lib/product").productHref(product);
    assert.equal((await api.getProduct(href.split("/").pop())).id, product.id);
  }
  await assert.rejects(api.getProduct("1"), error => error.status === 404);
  await assert.rejects(api.getProduct("demo-fashion-missing"), error => error.status === 404);
});

test("a missing sample URL in live mode never falls back to demo data", async () => {
  const { load } = createSourceLoader({ mode: "live", fetch: async () => new Response("{}", { status: 404 }) });
  await assert.rejects(load("lib/api/products").getProduct("demo-fashion-1"), error => error.status === 404);
});

test("sample garments remain in recently viewed history after a reload", async () => {
  const first = createSourceLoader({ mode: "demo" });
  const store = first.load("stores/recently-viewed-store").useRecentlyViewedStore;
  store.getState().add("demo-fashion-1");
  const second = createSourceLoader({ mode: "demo", storage: first.storage });
  const restored = second.load("stores/recently-viewed-store").useRecentlyViewedStore;
  await restored.persist.rehydrate();
  assert.deepEqual(Array.from(restored.getState().ids), ["demo-fashion-1"]);
});
