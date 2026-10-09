import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { categoryCopy } from "@/data/categories";
import { StoreLink } from "@/components/ui/store-link";
import { ProductImage } from "@/components/product/product-image";
import { SectionHeading } from "./section-heading";
import { matchesCategory } from "@/lib/categories";

export function FeaturedCategories({ categories, products }: { categories: Category[]; products: Product[] }) {
  const priority = ["clothing", "accessories", "cosmetic", "furniture"];
  const selected = categories.filter(category => !category.parent && products.some(product => matchesCategory(product.category, String(category.id)) && product.images.length > 0)).sort((a, b) => {
    const score = (name: string) => { const index = priority.indexOf(name.toLowerCase()); return index < 0 ? 10 : index; };
    return score(a.name) - score(b.name);
  }).slice(0, 4);
  if (!selected.length) return null;

  return <section className="page-shell py-14 sm:py-20" aria-labelledby="category-title">
    <SectionHeading id="category-title" eyebrow="Build your wardrobe" title="What feels like you?" href="/products" linkLabel="Shop all clothing" />
    <div className={`grid grid-cols-2 gap-x-4 gap-y-8 ${selected.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"} lg:gap-6`}>{selected.map(category => {
      const image = products.find(product => matchesCategory(product.category, String(category.id)) && product.images.length)?.images[0];
      const copy = categoryCopy[category.name.toLowerCase()];
      return <StoreLink key={category.id} to={`/products?category=${encodeURIComponent(category.slug)}#product-list`} className="group block">
        <div className="relative aspect-[4/4.5] overflow-hidden bg-muted"><ProductImage src={image} alt={`${category.name} collection`} sizes="(max-width: 1023px) 45vw, 25vw" className="transition-transform duration-500 group-hover:scale-[1.04]" /></div>
        <div className="mt-4 flex items-center justify-between gap-2"><h3 className="font-display text-xl sm:text-2xl">{category.name}</h3><ArrowUpRight size={17} /></div>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{copy?.description || "Discover something for your everyday."}</p>
      </StoreLink>;
    })}</div>
  </section>;
}
