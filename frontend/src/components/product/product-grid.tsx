import type { Product } from "@/types/product";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: Product[] }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">{products.map(product => <ProductCard key={product.id} product={product} />)}</div>;
}
