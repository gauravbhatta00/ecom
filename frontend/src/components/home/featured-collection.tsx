import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";
import { StoreLink } from "@/components/ui/store-link";

export function FeaturedCollection({ products }: { products: Product[] }) {
  const available = products.filter(product => product.stock > 0).slice(0, 2);
  if (!available.length) return null;
  return <section className="border-y border-border bg-secondary/35 py-14 sm:py-20">
    <div className="page-shell grid items-center gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
      <div><p className="eyebrow">Ready for your everyday</p><h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">Small discoveries.<br /><span className="italic text-primary">Good company.</span></h2><p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">A few pieces from the collection, in stock and ready to make themselves at home.</p><StoreLink to="/products" className="mt-7 inline-flex items-center gap-4 border-b border-foreground pb-2 text-sm">Find your next favourite <ArrowUpRight size={16} /></StoreLink></div>
      <div className="grid grid-cols-2 gap-4 sm:gap-6">{available.map(product => <ProductCard key={product.id} product={product} />)}</div>
    </div>
  </section>;
}
