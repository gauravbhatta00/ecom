"use client";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCartUiStore } from "@/stores/cart-ui-store";
import { CartItems, type CartBridge } from "@/components/cart/cart-items";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreLink } from "@/components/ui/store-link";
import { formatPrice } from "@/lib/product";
export default function CartPage() {
  const { cartItems, total, loading, error } = useCart() as CartBridge;
  const pending = useCartUiStore(state => state.addingId);
  return <main className="page-shell py-10 sm:py-16"><nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted-foreground"><StoreLink to="/products" className="hover:underline">Collection</StoreLink><span className="mx-3">/</span>Your bag</nav><p className="eyebrow">Considered choices</p><h1 className="mb-10 mt-3 font-display text-4xl sm:text-6xl">Your shopping bag.</h1>{error && <p role="alert" className="mb-6 text-sm text-destructive">{error}</p>}{loading ? <div role="status"><span className="sr-only">Loading shopping bag</span><Skeleton className="h-48" /></div> : cartItems.length === 0 ? <div className="border-y border-border py-20 text-center"><ShoppingBag className="mx-auto mb-6" /><h2 className="font-display text-3xl">Make room for a favourite.</h2><p className="mb-7 mt-4 text-sm text-muted-foreground">Your bag is empty. Take a look around.</p><Button asChild><StoreLink to="/products">Explore the collection</StoreLink></Button></div> : <div className="grid gap-12 lg:grid-cols-[1fr_340px]"><div><CartItems /><StoreLink to="/products" className="mt-4 inline-flex min-h-11 items-center text-sm underline">Continue exploring</StoreLink></div><aside className="h-fit border border-border p-6 lg:sticky lg:top-8"><h2 className="font-display text-2xl">Order summary</h2><div className="my-6 flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(total)}</span></div><div className="flex justify-between border-t border-border pt-5 text-base font-medium"><span>Bag total</span><span>{formatPrice(total)}</span></div><p className="my-5 text-xs leading-6 text-muted-foreground">Review your delivery details at checkout. Need help with delivery or returns? <StoreLink to="/contact" className="underline">Contact us.</StoreLink></p><Button asChild className={`w-full ${pending ? "pointer-events-none opacity-50" : ""}`}><StoreLink to="/checkout" aria-disabled={Boolean(pending)} tabIndex={pending ? -1 : undefined} onClick={event => { if (pending) event.preventDefault(); }}>Continue to checkout</StoreLink></Button><p className="mt-4 text-xs leading-5 text-muted-foreground">You’ll be asked to sign in if you haven’t already.</p></aside></div>}</main>;
}

