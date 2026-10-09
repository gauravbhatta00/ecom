"use client";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCartUiStore } from "@/stores/cart-ui-store";
import { CartItems, type CartBridge } from "./cart-items";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreLink } from "@/components/ui/store-link";
import { formatPrice } from "@/lib/product";
export function CartDrawer({ count }: { count: number }) {
  const open = useCartUiStore(state => state.open);
  const setOpen = useCartUiStore(state => state.setOpen);
  const pending = useCartUiStore(state => state.addingId);
  const { cartItems, total, loading, error } = useCart() as CartBridge;
  return <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="icon" size="icon" className="relative" aria-label={`Shopping bag, ${count} items`}><ShoppingBag />{count > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-primary text-[9px] text-white">{count > 99 ? "99+" : count}</span>}</Button></SheetTrigger><SheetContent side="right" className="w-[min(100vw,480px)]"><SheetTitle className="pr-10 font-display text-3xl">Your bag <span className="text-muted-foreground">({count})</span></SheetTitle><SheetDescription className="mt-2 text-xs text-muted-foreground">A few good choices, all in one place.</SheetDescription>{error && <p role="alert" className="mt-5 text-sm text-destructive">{error}</p>}
    {loading ? <div role="status" className="space-y-5 py-8"><span className="sr-only">Loading bag</span><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : cartItems.length ? <><CartItems close={() => setOpen(false)} /><div className="mt-auto border-t border-border pt-6"><div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(total)}</span></div><p className="mb-5 mt-3 text-xs leading-5 text-muted-foreground">Review your bag before continuing to checkout.</p><Button asChild className="w-full"><StoreLink to="/cart" onClick={() => setOpen(false)}>View bag</StoreLink></Button><Button asChild variant="outline" className={`mt-3 w-full ${pending ? "pointer-events-none opacity-50" : ""}`}><StoreLink to="/checkout" aria-disabled={Boolean(pending)} tabIndex={pending ? -1 : undefined} onClick={event => { if (pending) event.preventDefault(); else setOpen(false); }}>Continue to checkout</StoreLink></Button></div></> : <div className="flex flex-1 flex-col items-center justify-center py-16 text-center"><ShoppingBag size={28} /><h2 className="mt-5 font-display text-3xl">Something good awaits.</h2><p className="mb-6 mt-3 text-sm text-muted-foreground">Your bag is empty. Find your first favourite.</p><SheetClose asChild><Button asChild><StoreLink to="/products">Explore the collection</StoreLink></Button></SheetClose></div>}
  </SheetContent></Sheet>;
}

