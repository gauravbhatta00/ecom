import { z } from "zod";
import { apiRequest, ApiError } from "./client";
import { apiBaseUrl } from "../config";
import type { Product, CatalogSource } from "@/types/product";

const djangoProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().nullish(),
  price: z.union([z.string().trim().min(1), z.number()]).pipe(z.coerce.number<string | number>().finite().nonnegative()),
  category: z.object({ id: z.number(), name: z.string(), slug: z.string() }),
  image: z.string().nullish(),
  image_url: z.string().nullish(),
  stock: z.number().int().nonnegative(),
  created_at: z.string().datetime({ offset: true }),
});
export type DjangoProduct = z.infer<typeof djangoProductSchema>;
export const catalogMode: CatalogSource = process.env.NEXT_PUBLIC_CATALOG_MODE === "demo" ? "demo" : "live";

export function normalizeProductImage(image?: string | null): string | undefined {
  if (!image) return undefined;
  try {
    const url = new URL(image, apiBaseUrl + "/");
    if (!["https:", "http:"].includes(url.protocol)) return undefined;
    if (["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) && url.pathname.startsWith("/media/")) {
      return new URL(url.pathname, apiBaseUrl).href;
    }
    return url.href;
  } catch { return undefined; }
}

export function adaptDjangoProduct(input: unknown): Product {
  const result = djangoProductSchema.safeParse(input);
  if (!result.success) throw new ApiError("A product could not be loaded. Please try again.", 502);
  const product = result.data;
  const image = normalizeProductImage(product.image_url || product.image);
  return {
    id: `live-${product.id}`, backendId: product.id, source: "live",
    slug: String(product.id), name: product.name,
    description: product.description || "", shortDescription: product.description?.slice(0, 120) || "",
    price: product.price, category: product.category, images: image ? [image] : [],
    colors: [], sizes: [], variants: [], stock: product.stock, badges: [],
    featured: false, bestseller: false, newArrival: false, createdAt: product.created_at,
  };
}

export async function getProducts(options: { signal?: AbortSignal; mode?: CatalogSource } = {}): Promise<Product[]> {
  if ((options.mode || catalogMode) === "demo") return (await import("@/data/products")).demoProducts;
  const data = await apiRequest<unknown>("/api/products/", { signal: options.signal, cache: "no-store" });
  if (!Array.isArray(data)) throw new ApiError("The collection could not be loaded. Please try again.", 502);
  return data.map(adaptDjangoProduct);
}
