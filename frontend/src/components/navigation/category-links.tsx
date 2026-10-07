import { StoreLink as Link } from "@/components/ui/store-link";
import type { Category } from "@/types/category";
import { Skeleton } from "@/components/ui/skeleton";

export interface CategoryLinksProps { categories: Category[]; loading: boolean; error: string | null; onNavigate?: () => void }

export function CategoryLinks({ categories, loading, error, onNavigate }: CategoryLinksProps) {
  if (loading) return <div role="status" className="space-y-3"><span className="sr-only">Loading categories</span>{[0, 1, 2].map(i => <Skeleton key={i} className="h-5 w-32" />)}</div>;
  if (error) return <p className="text-xs leading-5 text-muted-foreground">{error} <Link to="/products" onClick={onNavigate} className="underline">Browse the shop</Link></p>;
  if (!categories.length) return <Link to="/products" onClick={onNavigate} className="block py-2 text-sm hover:underline">Explore all essentials</Link>;
  return <ul className="space-y-1">{categories.map(category => <li key={category.id}><Link onClick={onNavigate} to={`/products?category=${encodeURIComponent(category.id)}#product-list`} className="block py-2 text-sm hover:underline">{category.name}</Link></li>)}</ul>;
}
