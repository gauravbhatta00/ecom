import type { Product } from "@/types/product";
import { demoCategories } from "./categories";

const seeds = [
  { name: "The everyday canvas backpack", price: 68, oldPrice: 85, image: "/images/canvas-backpack.webp", category: 1, colors: [{ name: "Natural", hex: "#c4b59c" }, { name: "Olive", hex: "#6d7358" }], badge: "Bestseller" },
  { name: "Sage table light", price: 94, oldPrice: undefined, image: "/images/sage-lamp.webp", category: 0, colors: [{ name: "Sage", hex: "#89927b" }], badge: "New" },
  { name: "Forest wireless headphones", price: 129, oldPrice: 159, image: "/images/forest-headphones.webp", category: 1, colors: [{ name: "Forest", hex: "#2d493c" }, { name: "Charcoal", hex: "#333b37" }], badge: "Sale" },
  { name: "Weekend carryall", price: 78, oldPrice: undefined, image: "/images/canvas-backpack.webp", category: 1, colors: [{ name: "Sand", hex: "#bbac91" }], badge: "Limited" },
  { name: "Quiet corner reading lamp", price: 108, oldPrice: undefined, image: "/images/sage-lamp.webp", category: 0, colors: [{ name: "Olive", hex: "#6d7358" }], badge: "New" },
  { name: "Studio listening set", price: 145, oldPrice: undefined, image: "/images/forest-headphones.webp", category: 1, colors: [{ name: "Forest", hex: "#2d493c" }], badge: "Bestseller" },
] as const;

export const demoProducts: Product[] = seeds.map((item, i) => ({
  id: `demo-${i + 1}`,
  slug: item.name.toLowerCase().replaceAll(" ", "-"),
  source: "demo",
  name: item.name,
  description: "An illustrative product from the LeloVaiLelo design preview. Not available for purchase.",
  shortDescription: "A considered essential for everyday living.",
  price: item.price,
  compareAtPrice: item.oldPrice,
  category: demoCategories[item.category],
  brand: "LeloVaiLelo",
  images: [item.image],
  colors: [...item.colors],
  sizes: ["One size"],
  variants: [],
  stock: i === 4 ? 0 : 12,
  rating: 4.8,
  reviewCount: 24 + i * 7,
  badges: [item.badge],
  featured: true,
  bestseller: item.badge === "Bestseller",
  newArrival: item.badge === "New",
  createdAt: new Date(Date.UTC(2026, 8, 20 + i)).toISOString(),
}));
