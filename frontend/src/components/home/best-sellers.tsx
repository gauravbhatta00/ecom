"use client";

import { useCallback, useId, useSyncExternalStore } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";

export function BestSellersSection({ products, title = "The everyday edit", eyebrow = "A few good finds" }: { products: Product[]; title?: string; eyebrow?: string }) {
  const [viewportRef, api] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", slidesToScroll: 1 });
  const id = useId();
  const subscribe = useCallback((notify: () => void) => {
    if (!api) return () => {};
    api.on("select", notify).on("reInit", notify);
    return () => { api.off("select", notify).off("reInit", notify); };
  }, [api]);
  const snapshot = useCallback(() => `${api?.canScrollPrev() || false}|${api?.canScrollNext() || false}|${api?.selectedScrollSnap() || 0}`, [api]);
  const state = useSyncExternalStore(subscribe, snapshot, () => "false|false|0").split("|");
  if (!products.length) return null;

  return <section className="border-y border-border bg-white/40 py-14 sm:py-20" aria-labelledby={id}>
    <div className="page-shell">
      <SectionHeading id={id} eyebrow={eyebrow} title={title} href="/products" linkLabel="Shop the edit" />
      <div role="region" aria-roledescription="carousel" aria-label={title} tabIndex={0}
        onKeyDown={event => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowLeft") { event.preventDefault(); api?.scrollPrev(); }
          if (event.key === "ArrowRight") { event.preventDefault(); api?.scrollNext(); }
        }}>
        <div ref={viewportRef} className="overflow-hidden py-1">
          <div className="-ml-4 flex touch-pan-y lg:-ml-6">
            {products.map((product, index) => <div key={product.id} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${products.length}`} className="min-w-0 flex-[0_0_76%] pl-4 sm:flex-[0_0_48%] md:flex-[0_0_32%] lg:flex-[0_0_25%] lg:pl-6"><ProductCard product={product} /></div>)}
          </div>
        </div>
        <div className="mt-7 flex items-center justify-between">
          <p aria-live="polite" aria-atomic="true" className="text-xs text-muted-foreground">Explore the edit <span className="ml-3 font-medium tabular-nums text-foreground">{Number(state[2]) + 1} / {products.length}</span></p>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" aria-label="Previous products" disabled={state[0] !== "true"} onClick={() => api?.scrollPrev()}><ArrowLeft /></Button>
            <Button variant="outline" size="icon" aria-label="Next products" disabled={state[1] !== "true"} onClick={() => api?.scrollNext()}><ArrowRight /></Button>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
