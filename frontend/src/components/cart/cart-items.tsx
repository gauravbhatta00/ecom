"use client";
import { Minus, Plus, Trash2, Loader2, Heart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useCartUiStore } from "@/stores/cart-ui-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { getProduct, normalizeProductImage } from "@/lib/api/products";
import { formatPrice } from "@/lib/product";
import { Button } from "@/components/ui/button";
import { StoreLink } from "@/components/ui/store-link";
import { ProductImage } from "@/components/product/product-image";
export interface BagItem { id: number; product?: number; product_id?: number; product_name: string; product_image?: string; product_price?: number | string; price?: number; quantity: number }
export interface CartBridge { cartItems: BagItem[]; total: number; loading: boolean; error: string | null; updateQuantity: (id: number, quantity: number) => Promise<boolean>; removeFromCart: (id: number) => Promise<boolean> }
export function CartItems({ close }: { close?: () => void }) {
  const { cartItems, updateQuantity, removeFromCart } = useCart() as CartBridge;
  const pending = useCartUiStore(state => state.addingId);
  async function mutate(item: BagItem, action: "minus" | "plus" | "remove" | "save") {
    const ui = useCartUiStore.getState();
    if (!ui.begin(`cart-${item.id}`)) return;
    try {
      if (action === "save") {
        const product = await getProduct(String(item.product ?? item.product_id ?? item.id));
        if (!useWishlistStore.getState().items.some(saved => saved.id === product.id)) useWishlistStore.getState().toggle(product);
      }
      const success = action === "remove" || action === "save" ? await removeFromCart(item.id) : await updateQuantity(item.id, item.quantity + (action === "plus" ? 1 : -1));
      if (!success) throw new Error("Bag couldn't be updated. Check availability and try again.");
      if (action === "save") toast.success("Saved for later.");
      if (action === "remove") toast("Removed from your bag.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Please try again."); }
    finally { ui.finish(); }
  }
  return <ul className="divide-y divide-border">{cartItems.map(item => <li key={item.id} className="flex gap-4 py-6" aria-busy={pending === `cart-${item.id}`}>
    <StoreLink onClick={close} to={`/product/${item.product ?? item.product_id ?? item.id}`} className="relative h-28 w-20 shrink-0 bg-muted"><ProductImage key={item.product_image} src={normalizeProductImage(item.product_image)} alt={item.product_name} sizes="80px" /></StoreLink>
    <div className="min-w-0 flex-1"><StoreLink onClick={close} to={`/product/${item.product ?? item.product_id ?? item.id}`} className="text-sm font-medium hover:underline">{item.product_name}</StoreLink><p className="mt-2 text-xs text-muted-foreground">{formatPrice(Number(item.product_price ?? item.price ?? 0))} each</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center border border-border"><Button variant="ghost" size="icon" disabled={pending !== null || item.quantity <= 1} aria-label={`Decrease ${item.product_name} quantity`} onClick={() => void mutate(item, "minus")}><Minus /></Button><span className="w-6 text-center text-xs" aria-live="polite">{pending === `cart-${item.id}` ? <Loader2 size={12} className="mx-auto animate-spin" /> : item.quantity}</span><Button variant="ghost" size="icon" disabled={pending !== null} aria-label={`Increase ${item.product_name} quantity`} onClick={() => void mutate(item, "plus")}><Plus /></Button></div><span className="text-sm">{formatPrice(Number(item.product_price ?? item.price ?? 0) * item.quantity)}</span></div>
      <div className="mt-2 flex flex-wrap gap-3"><Button variant="ghost" className="px-0 text-xs" disabled={pending !== null} onClick={() => void mutate(item, "save")}><Heart />Save for later</Button><Button variant="ghost" className="px-0 text-xs text-muted-foreground" disabled={pending !== null} onClick={() => void mutate(item, "remove")} aria-label={`Remove ${item.product_name}`}><Trash2 />Remove</Button></div>
    </div>
  </li>)}</ul>;
}

