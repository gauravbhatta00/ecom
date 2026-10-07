import type { Category } from "@/types/category";

export const demoCategories: Category[] = [
  { id: 101, name: "Home & living", slug: "home-living" },
  { id: 102, name: "Accessories", slug: "accessories" },
  { id: 103, name: "Clothing", slug: "clothing" },
];

export const categoryCopy: Record<string, { title: string; description: string }> = {
  furniture: { title: "At home, at ease.", description: "Pieces for your favourite corner." },
  clothing: { title: "Wear it your way.", description: "Find your everyday uniform." },
  accessories: { title: "The finishing touch.", description: "Small details. Lasting character." },
  cosmetic: { title: "A moment for you.", description: "Make space for your daily rituals." },
  perfume: { title: "Leave an impression.", description: "Discover a scent that feels like you." },
  music: { title: "Find your rhythm.", description: "Make the everyday sound better." },
};
