import type { Product } from "@/types/product";
import { ProductGrid } from "@/components/product/product-grid";
import { newestProducts } from "@/lib/product";
import { SectionHeading } from "./section-heading";

export function NewArrivalsSection({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return <section className="page-shell py-14 sm:py-20" aria-labelledby="arrivals-title">
    <SectionHeading id="arrivals-title" eyebrow="Something to discover" title="New to the collection" description="The latest additions, ready to find a place in your everyday." href="/products?sort=new#product-list" linkLabel="All new arrivals" />
    <ProductGrid products={newestProducts(products).slice(0, 4)} />
  </section>;
}
