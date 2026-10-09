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
export function useQuickAdd(product: Product, quantity = 1) {
  const { addToCart, loading } = useCart() as CartBridge;
  const { sessionLoading } = useAuth() as { sessionLoading: boolean };
  const addingId = useCartUiStore(state => state.addingId);
  const add = async () => {
    if (product.source !== "live" || !product.backendId || product.stock < quantity || !Number.isInteger(quantity) || quantity < 1 || sessionLoading || loading) return false;
    if (!useCartUiStore.getState().begin(product.id)) return false;
    try {
      const success = await addToCart(product.backendId, {
        name: product.name, price: product.price, stock: product.stock, image: product.images[0] || null,
      }, quantity);
      if (!success) throw new Error("Please try again.");
      toast.success(`${product.name} added to your bag.`, { action: { label: "View bag", onClick: () => useCartUiStore.getState().setOpen(true) } });
      return true;
    } catch {
      toast.error("We couldn't add this item. Check availability and try again.");
      return false;
    } finally { useCartUiStore.getState().finish(); }
  };
  return { add, adding: addingId === product.id, disabled: loading || sessionLoading || addingId !== null || product.stock < 1 || product.source !== "live" };
}
