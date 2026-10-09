"use client";
import { useState } from "react";
import { Expand } from "lucide-react";
import { ProductImage } from "./product-image";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import type { Product } from "@/types/product";
export function ProductGallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(0);
  return <div><Dialog><DialogTrigger asChild><button type="button" disabled={!product.images.length} aria-label={`Enlarge image of ${product.name}`} className="group relative block aspect-[4/5] w-full overflow-hidden bg-muted"><ProductImage key={product.images[selected]} src={product.images[selected]} alt={product.name} sizes="(max-width: 767px) 94vw, 52vw" priority className="transition-transform duration-300 motion-safe:group-hover:scale-[1.025]" />{product.images.length > 0 && <span className="absolute bottom-4 right-4 flex items-center gap-2 bg-background px-3 py-2 text-xs"><Expand size={14} />Explore detail</span>}</button></DialogTrigger><DialogContent className="max-w-5xl p-4"><DialogTitle className="pr-10 text-sm">{product.name}</DialogTitle><DialogDescription className="sr-only">Enlarged product photograph.</DialogDescription><div className="relative mt-4 h-[70dvh]"><ProductImage key={product.images[selected]} src={product.images[selected]} alt={product.name} sizes="(max-width: 1023px) 90vw, 1000px" className="object-contain" /></div></DialogContent></Dialog>
    {product.images.length > 1 && <div className="mt-3 flex gap-3 overflow-x-auto pb-2" aria-label="Product images">{product.images.map((src, index) => <button key={src} type="button" onClick={() => setSelected(index)} aria-pressed={selected === index} aria-label={`View image ${index + 1}`} className={`relative h-24 w-20 shrink-0 border-2 ${selected === index ? "border-primary" : "border-transparent"}`}><ProductImage src={src} alt={`${product.name}, view ${index + 1}`} sizes="80px" /></button>)}</div>}
  </div>;
}

