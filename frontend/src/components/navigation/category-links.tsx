import { StoreLink as Link } from "@/components/ui/store-link";
import type { Category } from "@/types/category";
import { Skeleton } from "@/components/ui/skeleton";

export interface CategoryLinksProps { categories: Category[]; loading: boolean; error: string | null; onNavigate?: () => void }

export function CategoryLinks({ categories, loading, error, onNavigate }: CategoryLinksProps) {
  if (loading) return <div role="status" className="space-y-3"><span className="sr-only">Loading categories</span>{[0, 1, 2].map(i => <Skeleton key={i} className="h-5 w-32" />)}</div>;
  if (error) return <p className="text-xs leading-5 text-muted-foreground">{error} <Link to="/products" onClick={onNavigate} className="underline">Browse the shop</Link></p>;
  if (!categories.length) return <Link to="/products" onClick={onNavigate} className="block py-2 text-sm hover:underline">Explore all essentials</Link>;
  return <ul className="max-h-[50vh] space-y-3 overflow-y-auto pr-2">{categories.filter(category => !category.parent).map(category => <li key={category.id}><Link onClick={onNavigate} to={`/products?category=${encodeURIComponent(category.slug)}#product-list`} className="flex min-h-11 items-center text-sm font-semibold hover:underline">{category.name}</Link><ul className="border-l border-border pl-3">{categories.filter(child => child.parent === category.id).map(child => <li key={child.id}><Link onClick={onNavigate} to={`/products?category=${encodeURIComponent(child.slug)}#product-list`} className="flex min-h-11 items-center text-xs text-muted-foreground hover:underline">{child.name}</Link></li>)}</ul></li>)}</ul>;
}
