"use client";

import { Heart, Loader2, Plus, Star } from "lucide-react";
import { QuickView } from "./quick-view";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { ProductImage } from "./product-image";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useQuickAdd } from "@/hooks/use-quick-add";
import { productHref, formatPrice, discountPercent } from "@/lib/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoreLink } from "@/components/ui/store-link";

export function ProductCard({ product }: { product: Product }) {
  const saved = useWishlistStore(state => state.items.some(item => item.id === product.id));
  const toggle = useWishlistStore(state => state.toggle);
  const { add, adding, disabled } = useQuickAdd(product);
  const discount = discountPercent(product);
  const imageSizes = "(max-width: 639px) 48vw, (max-width: 1023px) 32vw, 25vw";
  const toggleSaved = () => {
    toggle(product);
    toast(saved ? "Removed from saved items." : "Saved for later.");
  };

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <StoreLink to={productHref(product)} className="block h-full w-full" aria-label={`View ${product.name}`}>
          <ProductImage key={product.images[0]} src={product.images[0]} alt={product.name} sizes={imageSizes}
            className="transition-transform duration-500 group-hover:scale-[1.035]" />
          {product.images[1] && (
            <span className="absolute inset-0 hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 sm:block">
              <ProductImage key={product.images[1]} src={product.images[1]} alt={`${product.name}, alternate view`} sizes={imageSizes} />
            </span>
          )}
        </StoreLink>
        <div className="pointer-events-none absolute left-2 top-2 flex max-w-[calc(100%-56px)] flex-wrap gap-1 sm:left-3 sm:top-3">
          {product.source === "demo" && <Badge>Sample</Badge>}
          {product.badges.slice(0, 1).map(badge => <Badge key={badge}>{badge}</Badge>)}
          {discount > 0 && <Badge className="border-transparent bg-primary text-white">−{discount}%</Badge>}
        </div>
        <Button variant="icon" size="icon" onClick={toggleSaved} aria-pressed={saved}
          aria-label={`${saved ? "Remove" : "Save"} ${product.name}`}
          className="absolute right-1 top-1 bg-background/95 sm:right-2 sm:top-2">
          <Heart className={saved ? "fill-primary text-primary" : ""} />
        </Button>
        <QuickView product={product} />
      </div>
      <div className="pt-3 sm:pt-4">
        <p className="truncate text-[10px] uppercase tracking-[.13em] text-muted-foreground">{product.category.name}</p>
        <StoreLink to={productHref(product)} className="mt-1.5 block text-sm font-medium leading-5 hover:underline sm:text-base">
          <h3 className="line-clamp-2 min-h-10">{product.name}</h3>
        </StoreLink>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span>{formatPrice(product.price)}</span>
          {discount > 0 && <><span className="sr-only">Previously</span><del className="text-xs text-muted-foreground">{formatPrice(product.compareAtPrice!)}</del></>}
        </div>
        {(product.colors.length > 0 || product.rating !== undefined) && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1.5" aria-label={`Colors: ${product.colors.map(color => color.name).join(", ")}`}>
              {product.colors.map(color => <span key={color.name} title={color.name} className="size-3 rounded-full border border-black/20" style={{ backgroundColor: color.hex }} />)}
            </div>
            {product.rating !== undefined && <span className="flex items-center gap-1 text-[11px]" aria-label={`${product.rating} out of 5 stars from ${product.reviewCount || 0} reviews`}><Star size={11} className="fill-current" />{product.rating.toFixed(1)}<span className="text-muted-foreground">({product.reviewCount})</span></span>}
          </div>
        )}
        <Button variant="outline" className="mt-4 w-full px-2 text-[11px] sm:text-xs"
          disabled={disabled} onClick={add} aria-label={`Add ${product.name} to bag`}>
          {adding ? <Loader2 className="animate-spin" /> : <Plus />}
          {adding ? "Adding…" : product.source === "demo" ? "Preview only" : product.stock === 0 ? "Out of stock" : "Quick add"}
        </Button>
      </div>
    </article>
  );
}
