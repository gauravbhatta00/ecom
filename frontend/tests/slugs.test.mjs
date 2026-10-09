import test from "node:test";
import assert from "node:assert/strict";
import { createSourceLoader } from "./source-loader.mjs";

const dto = { id: 23, name: "Cotton shirt", slug: "cotton-shirt-23", price: "20", category: { id: 2, name: "Shirts", slug: "men-shirts", parent: 1, parent_name: "Men", parent_slug: "men" }, stock: 2, created_at: "2026-10-08T00:00:00Z" };

test("readable product links resolve through the slug API while old numeric links work", async () => {
  const requested = [];
  const { load } = createSourceLoader({ fetch: async url => { requested.push(String(url)); return new Response(JSON.stringify(dto)); } });
  const api = load("lib/api/products");
  const product = await api.getProduct("cotton-shirt-23");
  assert.equal(load("lib/product").productHref(product), "/product/cotton-shirt-23");
  assert.match(requested[0], /\/api\/products\/by-slug\/cotton-shirt-23\/$/);
  await api.getProduct("23");
  assert.match(requested[1], /\/api\/products\/23\/$/);
  await assert.rejects(api.getProduct("../admin"), error => error.status === 404);
  assert.equal(requested.length, 2);
});

test("category slug filters include the department's clothing and match a subcategory", () => {
  const { load } = createSourceLoader();
  const product = load("lib/api/products").adaptDjangoProduct(dto);
  const filter = load("lib/catalog").filterProducts;
  assert.equal(filter([product], new URLSearchParams({ category: "men" })).length, 1);
  assert.equal(filter([product], new URLSearchParams({ category: "men-shirts" })).length, 1);
  assert.equal(filter([product], new URLSearchParams({ category: "women" })).length, 0);
});
