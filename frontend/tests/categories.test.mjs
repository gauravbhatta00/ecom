import test from "node:test";
import assert from "node:assert/strict";
import { createSourceLoader } from "./source-loader.mjs";

function inventory() {
  const { load } = createSourceLoader();
  const adapt = load("lib/api/products").adaptDjangoProduct;
  const product = { name: "Jacket", price: "25.00", stock: 5, created_at: "2026-10-01T00:00:00Z" };
  return { load, products: [
    adapt({ ...product, id: 1, category: { id: 11, name: "Jackets", slug: "men-jackets", parent: 1, parent_name: "Men", parent_slug: "men" } }),
    adapt({ ...product, id: 2, category: { id: 21, name: "Jackets", slug: "women-jackets", parent: 2, parent_name: "Women", parent_slug: "women" } }),
    adapt({ ...product, id: 3, category: { id: 12, name: "Trousers", slug: "men-trousers", parent: 1, parent_name: "Men", parent_slug: "men" } }),
  ] };
}
test("parent filters include child products without mixing similarly named subcategories", () => {
  const { load, products } = inventory();
  const filter = load("lib/catalog").filterProducts;
  assert.deepEqual(Array.from(filter(products, new URLSearchParams("category=1")), p => p.id), ["live-1", "live-3"]);
  assert.deepEqual(Array.from(filter(products, new URLSearchParams("category=women")), p => p.id), ["live-2"]);
  assert.deepEqual(Array.from(filter(products, new URLSearchParams("category=11")), p => p.id), ["live-1"]);
  assert.equal(filter(products, new URLSearchParams("category=men&min=30")).length, 0);
});
test("hierarchy is retained by the API adapter and filter options", () => {
  const { load, products } = inventory();
  const { catalogCategories, categoryLabel } = load("lib/categories");
  const categories = catalogCategories(products);
  assert.equal(categories.filter(c => !c.parent).length, 2);
  assert.equal(categories.length, 5);
  assert.equal(categoryLabel(products[1].category), "Women / Jackets");
});
