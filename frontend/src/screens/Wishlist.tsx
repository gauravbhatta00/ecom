"use client";
import { Heart, X } from "lucide-react";
import { useCatalog } from "@/hooks/use-catalog";
import { useWishlistStore, type SavedItem } from "@/stores/wishlist-store";
import { useQuickAdd } from "@/hooks/use-quick-add";
import { ProductImage } from "@/components/product/product-image";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { StoreLink } from "@/components/ui/store-link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/product";
import type { Product } from "@/types/product";

function MoveToBag({ product, id }: { product: Product; id: string }) {
  const { add, adding, disabled } = useQuickAdd(product);
  const remove = useWishlistStore(state => state.remove);
  return <Button disabled={disabled} className="mt-4 w-full" onClick={async () => { if (await add()) remove(id); }}>{adding ? "Moving…" : product.source === "demo" ? "Preview only" : product.stock > 0 ? "Move to bag" : "Out of stock"}</Button>;
}
function SavedPiece({ item, product }: { item: SavedItem; product?: Product }) {
  const remove = useWishlistStore(state => state.remove);
  return <article><div className="relative aspect-[4/5] bg-muted"><StoreLink to={item.href}><ProductImage src={product?.images[0] || item.image} alt={item.name} sizes="(max-width: 639px) 45vw, 25vw" /></StoreLink><Button variant="icon" size="icon" className="absolute right-2 top-2 bg-background" aria-label={`Remove ${item.name}`} onClick={() => remove(item.id)}><X /></Button></div><h2 className="mt-4 text-sm"><StoreLink to={item.href}>{product?.name || item.name}</StoreLink></h2><p className="mt-2 text-sm">{formatPrice(product?.price ?? item.price)}</p>{product ? <MoveToBag product={product} id={item.id} /> : <p className="mt-4 text-xs text-muted-foreground">This piece is no longer in the current collection.</p>}</article>;
}
export default function Wishlist() {
  const items = useWishlistStore(state => state.items);
  const { products, loading, error, reload } = useCatalog(items.length > 0);
  return <main className="page-shell py-12 sm:py-16"><p className="eyebrow">Collected by you</p><h1 className="mt-3 font-display text-4xl sm:text-6xl">Your personal edit.</h1><p className="mb-10 mt-4 text-sm text-muted-foreground">Saved on this device. Revisit your favourites, at your own pace.</p>{items.length === 0 ? <div className="border-y border-border py-20 text-center"><Heart className="mx-auto mb-5" /><h2 className="font-display text-3xl">Room for something you love.</h2><p className="mb-7 mt-4 text-sm text-muted-foreground">Tap the heart on a piece to keep it here.</p><Button asChild><StoreLink to="/products">Explore the collection</StoreLink></Button></div> : loading ? <ProductGridSkeleton /> : error ? <div role="alert"><p className="mb-4 text-sm">{error}</p><Button onClick={reload}>Check availability again</Button></div> : <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">{items.map(item => <SavedPiece key={item.id} item={item} product={products.find(p => p.id === item.id)} />)}</div>}</main>;
}

