import { getProducts, catalogMode } from "./products";
import { getCategories } from "./categories";
import { demoCategories } from "@/data/categories";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

export interface HomeCatalog {
  products: Product[];
  categories: Category[];
  unavailable: boolean;
  source: "live" | "demo";
}

export async function getHomeCatalog(): Promise<HomeCatalog> {
  const signal = AbortSignal.timeout(8000);
  const [products, categories] = await Promise.allSettled([
    getProducts({ signal }),
    catalogMode === "demo" ? Promise.resolve(demoCategories) : getCategories(signal),
  ]);
  return {
    products: products.status === "fulfilled" ? products.value : [],
    categories: categories.status === "fulfilled" ? categories.value : [],
    unavailable: products.status === "rejected",
    source: catalogMode,
  };
}
