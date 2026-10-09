import type { Category } from "@/types/category";

export const demoCategories: Category[] = [
  { id: 101, name: "Tops & shirts", slug: "tops-shirts" },
  { id: 102, name: "Denim & trousers", slug: "denim-trousers" },
  { id: 103, name: "Layers & knitwear", slug: "layers-knitwear" },
  { id: 104, name: "Dresses & sets", slug: "dresses-sets" },
];

export const categoryCopy: Record<string, { title: string; description: string }> = {
  men: { title: "Everyday, your way.", description: "Shirts, jackets, and trousers for an easy everyday wardrobe." },
  women: { title: "Make it your own.", description: "Expressive layers, relaxed trousers, and dresses to love." },
  kids: { title: "Ready for little adventures.", description: "Playful clothing for their everyday discoveries." },
  "tops & shirts": { title: "The everyday foundation.", description: "Easy tees and shirts with a little personality." },
  "denim & trousers": { title: "Find your fit.", description: "Denim days. Relaxed silhouettes." },
  "layers & knitwear": { title: "Layer with intention.", description: "Soft textures and statement outerwear." },
  "dresses & sets": { title: "An outfit, all together.", description: "Easy dressing for plans big and small." },
  furniture: { title: "At home, at ease.", description: "Pieces for your favourite corner." },
  clothing: { title: "Wear it your way.", description: "Find your everyday uniform." },
  accessories: { title: "The finishing touch.", description: "Small details. Lasting character." },
  cosmetic: { title: "A moment for you.", description: "Make space for your daily rituals." },
  perfume: { title: "Leave an impression.", description: "Discover a scent that feels like you." },
  music: { title: "Find your rhythm.", description: "Make the everyday sound better." },
};
