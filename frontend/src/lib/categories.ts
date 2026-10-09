import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

export function categoryLabel(category: Category) {
  return category.parent_name ? `${category.parent_name} / ${category.name}` : category.name;
}
export function matchesCategory(category: Category, value: string) {
  const query = value.toLowerCase();
  return [String(category.id), category.name, category.slug, category.parent != null ? String(category.parent) : "", category.parent_name || "", category.parent_slug || ""].some(item => item.toLowerCase() === query);
}
export function catalogCategories(products: Product[]): Category[] {
  const values = new Map<number, Category>();
  for (const { category } of products) {
    values.set(category.id, category);
    if (category.parent != null && category.parent_name) values.set(category.parent, { id: category.parent, name: category.parent_name, slug: category.parent_slug || "", parent: null });
  }
  return [...values.values()];
}
