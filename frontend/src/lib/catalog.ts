import type { Product } from "@/types/product";
import { matchesCategory, categoryLabel } from "./categories";

export const filterKeys = ["q", "category", "min", "max", "available"] as const;
export function readFilters(params: URLSearchParams) {
  const price = (key: string) => { const value = params.get(key); return value?.trim() && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : undefined; };
  return { q: (params.get("q") || "").trim(), category: params.get("category") === "all" ? "" : params.get("category") || "", min: price("min"), max: price("max"), available: params.get("available") === "1", sort: params.get("sort") || "featured" };
}
export function filterProducts(products: Product[], params: URLSearchParams) {
  const f = readFilters(params);
  return products.filter(p =>
    (!f.category || f.category === "all" || matchesCategory(p.category, f.category)) &&
    (!f.q || `${p.name} ${p.description} ${categoryLabel(p.category)}`.toLowerCase().includes(f.q.toLowerCase())) &&
    (f.min === undefined || p.price >= f.min) && (f.max === undefined || p.price <= f.max) && (!f.available || p.stock > 0)
  ).sort((a, b) => f.sort === "low" ? a.price - b.price : f.sort === "high" ? b.price - a.price : f.sort === "new" ? Date.parse(b.createdAt) - Date.parse(a.createdAt) : 0);
}
export function relatedProducts(products: Product[], current: Product) {
  return products.filter(p => p.id !== current.id && p.category.id === current.category.id).slice(0, 4);
}
