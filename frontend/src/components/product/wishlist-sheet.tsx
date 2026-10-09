"use client";

import { Heart, X } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlist-store";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { StoreLink } from "@/components/ui/store-link";
import { ProductImage } from "./product-image";
import { formatPrice } from "@/lib/product";

export function WishlistSheet() {
  const items = useWishlistStore(state => state.items);
  const remove = useWishlistStore(state => state.remove);
  return (
    <Sheet>
      <SheetTrigger asChild><Button variant="icon" size="icon" className="relative" aria-label={`Saved items, ${items.length} products`}><Heart />{items.length > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-primary text-[9px] text-white">{items.length}</span>}</Button></SheetTrigger>
      <SheetContent side="right">
        <SheetTitle className="pr-9 font-display text-3xl">Saved for later</SheetTitle>
        <SheetDescription className="mt-2 text-sm text-muted-foreground">A little collection of your favourites. Saved on this device.</SheetDescription>
        <SheetClose asChild><StoreLink to="/wishlist" className="mt-4 inline-flex min-h-11 items-center text-sm underline">View your full edit</StoreLink></SheetClose>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center"><Heart size={30} strokeWidth={1} /><h2 className="font-display text-2xl">Something caught your eye?</h2><p className="text-sm text-muted-foreground">Tap the heart on a product to keep it here.</p><SheetClose asChild><Button variant="outline">Keep exploring</Button></SheetClose></div>
        ) : <ul className="mt-6 divide-y divide-border">{items.map(item => (
          <li key={item.id} className="flex items-center gap-3 py-4">
            <SheetClose asChild><StoreLink to={item.href} className="relative block h-24 w-20 shrink-0 bg-muted"><ProductImage src={item.image} alt={item.name} sizes="80px" /></StoreLink></SheetClose>
            <div className="min-w-0 flex-1"><SheetClose asChild><StoreLink to={item.href} className="text-sm font-medium hover:underline">{item.name}</StoreLink></SheetClose><p className="mt-2 text-sm">{formatPrice(item.price)}</p>{item.source === "demo" && <p className="mt-1 text-xs text-muted-foreground">Sample product</p>}</div>
            <Button variant="icon" size="icon" aria-label={`Remove ${item.name} from saved items`} onClick={() => remove(item.id)}><X /></Button>
          </li>
        ))}</ul>}
      </SheetContent>
    </Sheet>
  );
}
