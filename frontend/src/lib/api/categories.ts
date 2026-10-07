import { ApiError, apiRequest } from "./client";
import type { Category } from "@/types/category";

export async function getCategories(signal?: AbortSignal): Promise<Category[]> {
  if (process.env.NEXT_PUBLIC_CATALOG_MODE === "demo") return (await import("@/data/categories")).demoCategories;
  const data = await apiRequest<unknown>("/api/categories/", { signal });
  if (!Array.isArray(data) || !data.every(item => item && typeof item.id === "number" && typeof item.name === "string" && typeof item.slug === "string")) {
    throw new ApiError("We couldn't load the categories. Please try again.", 502);
  }
  return data;
}
