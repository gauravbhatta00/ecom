import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/types/category";
import { StoreLink } from "@/components/ui/store-link";

export function ShopByCategory({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;
  return <section className="page-shell py-12 sm:py-16" aria-label="Browse all categories">
    <p className="eyebrow mb-6">Follow your curiosity</p>
    <div className="flex flex-wrap gap-x-7 gap-y-5">{categories.map(category => <StoreLink key={category.id} to={`/products?category=${category.id}#product-list`} className="inline-flex items-center gap-3 border-b border-border pb-2 font-display text-2xl hover:border-primary sm:text-3xl">{category.name}<ArrowUpRight size={15} className="text-muted-foreground" /></StoreLink>)}</div>
  </section>;
}
