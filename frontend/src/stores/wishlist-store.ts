"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { z } from "zod";
import { safeLocalStorage } from "@/lib/safe-storage";
import { productHref } from "@/lib/product";
import type { Product } from "@/types/product";

const savedItemSchema = z.object({
  id: z.string(), name: z.string(), href: z.string().regex(/^\/(?!\/)/),
  image: z.string().refine(value => /^https?:\/\//.test(value) || /^\/(?!\/)/.test(value)).optional(), price: z.number().finite().nonnegative(),
  source: z.enum(["live", "demo"]),
});
export type SavedItem = z.infer<typeof savedItemSchema>;
interface WishlistState { items: SavedItem[]; toggle: (product: Product) => void; remove: (id: string) => void }

export const useWishlistStore = create<WishlistState>()(persist((set) => ({
  items: [],
  toggle: product => set(state => ({
    items: state.items.some(item => item.id === product.id)
      ? state.items.filter(item => item.id !== product.id)
      : [...state.items, { id: product.id, name: product.name, href: productHref(product), image: product.images[0], price: product.price, source: product.source }].slice(-100),
  })),
  remove: id => set(state => ({ items: state.items.filter(item => item.id !== id) })),
}), {
  name: "lelovailelo-wishlist", version: 1,
  storage: createJSONStorage(() => safeLocalStorage), skipHydration: true,
  partialize: state => ({ items: state.items }),
  merge: (persisted, current) => {
    const parsed = z.object({ items: z.array(savedItemSchema).max(100) }).safeParse(persisted);
    return { ...current, items: parsed.success ? [...new Map(parsed.data.items.map(item => [item.id, item])).values()] : [] };
  },
}));
