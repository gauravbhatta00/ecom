import type { Product } from "@/types/product";
import { demoCategories } from "./categories";

const seeds = [
  { name: "The printed chambray shirt", price: 48, image: "cotton-shirt", category: 0, color: "Indigo", hex: "#536e85", description: "A button-through shirt with a playful print, easy sleeves, and a relaxed silhouette. Wear it open over a tee or tucked into your favourite denim." },
  { name: "The everyday crew tee", price: 24, image: "cotton-tee", category: 0, color: "White", hex: "#f4f3ee", description: "The starting point for a good outfit. A clean crew neckline and simple short sleeves make this an easy everyday layer." },
  { name: "The classic denim edit", price: 64, image: "straight-jeans", category: 1, color: "Washed blue", hex: "#547086", description: "Familiar denim, fresh possibilities. A casual wardrobe foundation to pair with a crisp shirt, an easy tee, or your favourite knit." },
  { name: "The relaxed blush trouser", price: 52, image: "tailored-trousers", category: 1, color: "Blush", hex: "#c99f90", description: "A soft blush tone, roomy patch pockets, and an easy cuffed leg. A laid-back alternative for your weekday rotation." },
  { name: "The fringed knit poncho", price: 72, image: "knit-sweater", category: 2, color: "Oat", hex: "#d8cbb0", description: "Open-knit texture with a fringed edge and an effortless drape. An extra layer for slow mornings and breezy evenings." },
  { name: "The belted city coat", price: 148, image: "wool-coat", category: 2, color: "Camel", hex: "#b1885d", description: "A warm camel palette, generous lapels, and a tie waist. A polished finishing layer for everyday city dressing." },
  { name: "The midnight biker jacket", price: 128, image: "leather-jacket", category: 2, color: "Black", hex: "#242424", description: "An asymmetric zip and statement hardware bring a little edge to simple outfits. Layer over a tee or balance with a flowing dress." },
  { name: "The blue-sky maxi dress", price: 88, image: "midi-dress", category: 3, color: "Sky blue", hex: "#9fb9c9", description: "A flowing maxi silhouette with a delicate dotted pattern and a tie detail. For long lunches, summer plans, and days by the water." },
  { name: "The sunshine lounge set", price: 78, image: "campaign", category: 3, color: "Sunshine", hex: "#e9bf26", description: "A cropped hoodie and matching joggers in a feel-good yellow. A coordinated look with a confident, relaxed attitude." },
] as const;

export const demoProducts: Product[] = seeds.map((item, i) => ({
  id: `demo-fashion-${i + 1}`,
  slug: item.name.toLowerCase().replaceAll(" ", "-"),
  source: "demo",
  name: item.name,
  description: item.description + "\n\nSample clothing item for the store preview. Prices, sizing, and availability are illustrative; purchasing is disabled.",
  shortDescription: item.description,
  price: item.price,
  category: demoCategories[item.category],
  brand: "LeloVaiLelo",
  images: [`/images/fashion/${item.image}.jpg`],
  colors: [{ name: item.color, hex: item.hex }],
  sizes: item.image === "knit-sweater" ? ["One size"] : ["XS", "S", "M", "L", "XL"],
  variants: [],
  stock: i === 6 ? 0 : i === 5 ? 3 : 12,
  badges: [],
  featured: true,
  bestseller: false,
  newArrival: i >= 5,
  createdAt: new Date(Date.UTC(2026, 8, 20 + i)).toISOString(),
}));
