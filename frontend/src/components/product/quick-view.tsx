"use client";
import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import type { Product } from "@/types/product";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StoreLink } from "@/components/ui/store-link";
import { ProductImage } from "./product-image";
import { formatPrice, productHref } from "@/lib/product";
import { useQuickAdd } from "@/hooks/use-quick-add";
export function QuickView({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const { add, adding, disabled } = useQuickAdd(product);
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="ghost" size="icon" aria-label={`Quick view: ${product.name}`} className="absolute bottom-2 right-2 bg-background/95"><Eye /></Button></DialogTrigger><DialogContent><div className="grid gap-6 sm:grid-cols-2"><div className="relative aspect-[4/5] bg-muted"><ProductImage src={product.images[0]} alt={product.name} sizes="(max-width: 639px) 80vw, 320px" /></div><div className="flex flex-col justify-center"><p className="eyebrow">{product.category.name}</p><DialogTitle className="mt-3 font-display text-3xl">{product.name}</DialogTitle><p className="mt-4 text-lg">{formatPrice(product.price)}</p><DialogDescription className="mt-4 line-clamp-5 text-sm leading-7 text-muted-foreground">{product.description || "Discover this piece from the collection."}</DialogDescription><p className="my-5 text-xs">{product.stock > 0 ? "In stock" : "Currently unavailable"}</p><Button disabled={disabled} onClick={async () => { if (await add()) setOpen(false); }}>{adding && <Loader2 className="animate-spin" />}{adding ? "Adding…" : product.source === "demo" ? "Preview only" : product.stock > 0 ? "Add to bag" : "Out of stock"}</Button><DialogClose asChild><StoreLink to={productHref(product)} className="mt-4 flex min-h-11 items-center justify-center text-xs underline">View full details</StoreLink></DialogClose></div></div></DialogContent></Dialog>;
}
