"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useCartUiStore } from "@/stores/cart-ui-store";
import { toast } from "sonner";
import type { Product } from "@/types/product";

interface CartBridge {
  loading: boolean;
  addToCart: (id: number, product: { name: string; price: number; stock: number; image: string | null }, quantity: number) => Promise<boolean>;
}
export function useQuickAdd(product: Product) {
  const { addToCart, loading } = useCart() as CartBridge;
  const { sessionLoading } = useAuth() as { sessionLoading: boolean };
  const addingId = useCartUiStore(state => state.addingId);
  const add = async () => {
    if (product.source !== "live" || !product.backendId || product.stock < 1 || sessionLoading || loading) return;
    if (!useCartUiStore.getState().begin(product.id)) return;
    try {
      const success = await addToCart(product.backendId, {
        name: product.name, price: product.price, stock: product.stock, image: product.images[0] || null,
      }, 1);
      if (!success) throw new Error("Please try again.");
      toast.success(`${product.name} added to your bag.`, { action: { label: "View bag", onClick: () => { window.location.assign(new URL("/cart", window.location.origin).href); } } });
    } catch {
      toast.error("We couldn't add this item. Check availability and try again.");
    } finally { useCartUiStore.getState().finish(); }
  };
  return { add, adding: addingId === product.id, disabled: loading || sessionLoading || addingId !== null || product.stock < 1 || product.source !== "live" };
}
