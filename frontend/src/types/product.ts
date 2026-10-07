import type { Category } from "./category";

export type CatalogSource = "live" | "demo";
export type ProductBadge = "New" | "Bestseller" | "Sale" | "Limited";
export interface ProductColor { name: string; hex: string }
export interface ProductVariant { id: string; color: string; size: string; stock: number; sku: string }
export interface Product {
  id: string;
  backendId?: number;
  slug: string;
  source: CatalogSource;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  category: Category;
  brand?: string;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariant[];
  stock: number;
  rating?: number;
  reviewCount?: number;
  badges: ProductBadge[];
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  createdAt: string;
}
