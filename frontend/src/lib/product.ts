import type { Product } from "@/types/product";

export const formatPrice = (price: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
export const productHref = (product: Product) => product.source === "live" ? `/product/${product.backendId}` : "/products";
export function discountPercent(product: Product) {
  return product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
}
export function newestProducts(products: Product[]) {
  return [...products].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
