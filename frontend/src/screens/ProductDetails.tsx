"use client";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart, Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getProduct } from "@/lib/api/products";
import { ApiError } from "@/lib/api/client";
import { formatPrice } from "@/lib/product";
import { relatedProducts } from "@/lib/catalog";
import { categoryLabel } from "@/lib/categories";
import { useCatalog } from "@/hooks/use-catalog";
import { useQuickAdd } from "@/hooks/use-quick-add";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreLink } from "@/components/ui/store-link";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import type { Product } from "@/types/product";

function ProductContent({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { add, adding, disabled } = useQuickAdd(product, quantity);
  const saved = useWishlistStore(state => state.items.some(item => item.id === product.id));
  const toggle = useWishlistStore(state => state.toggle);
  const recentIds = useRecentlyViewedStore(state => state.ids);
  const { products } = useCatalog();
  const related = relatedProducts(products, product);
  const recent = recentIds.filter(id => id !== product.id).map(id => products.find(p => p.id === id)).filter((p): p is Product => Boolean(p)).slice(0, 4);
  useEffect(() => { useRecentlyViewedStore.getState().add(product.id); document.title = `${product.name} | LeloVaiLelo`; }, [product.id, product.name]);
  const cta = <Button disabled={disabled} onClick={() => void add()} size="lg" className="w-full">{adding ? <Loader2 className="animate-spin" /> : <Plus />}{adding ? "Adding to bag…" : product.source === "demo" ? "Sample item · Preview only" : product.stock > 0 ? `Add to bag · ${formatPrice(product.price * quantity)}` : "Currently unavailable"}</Button>;
  return <main className="page-shell pb-28 pt-8 md:pb-20">
    <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap gap-3 text-xs text-muted-foreground"><StoreLink to="/" className="hover:underline">Home</StoreLink><span>/</span><StoreLink to={`/products?category=${encodeURIComponent(product.category.slug)}`} className="hover:underline">{categoryLabel(product.category)}</StoreLink><span>/</span><span aria-current="page">{product.name}</span></nav>
    <div className="grid items-start gap-8 md:grid-cols-[1.1fr_1fr] lg:gap-16">
      <ProductGallery product={product} />
      <section className="md:sticky md:top-8">
        <p className="eyebrow">{product.category.name}</p><h1 className="mt-4 font-display text-4xl leading-tight tracking-tight lg:text-5xl">{product.name}</h1>
        <p className="mt-5 text-xl">{formatPrice(product.price)}</p>
        <p className={`mt-5 flex items-center gap-2 text-xs ${product.stock > 0 ? "text-primary" : "text-muted-foreground"}`}><span className={`size-1.5 rounded-full ${product.stock > 0 ? "bg-primary" : "bg-muted-foreground"}`} />{product.stock === 0 ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} available` : "In stock"}</p>
        <p className="mt-6 whitespace-pre-line text-sm leading-7 text-muted-foreground">{product.description || "Explore this piece from the LeloVaiLelo collection."}</p>
        {product.source === "demo" && <div className="mt-6 border-y border-border py-5"><p className="text-xs text-muted-foreground">Sample sizing · {product.sizes.join(" / ")}</p><p className="mt-2 text-xs text-muted-foreground">Colour shown: {product.colors.map(color => color.name).join(", ")}</p></div>}
        {product.source === "live" && <div className="mt-8 flex items-center justify-between gap-4 border-y border-border py-4"><span className="text-sm">Quantity</span><div className="flex items-center border border-border"><Button variant="ghost" size="icon" disabled={quantity <= 1 || adding} onClick={() => setQuantity(q => q - 1)} aria-label="Decrease quantity"><Minus /></Button><output className="w-9 text-center text-sm" aria-label="Quantity">{quantity}</output><Button variant="ghost" size="icon" disabled={quantity >= product.stock || adding} onClick={() => setQuantity(q => q + 1)} aria-label="Increase quantity"><Plus /></Button></div></div>}
        <div className="mt-6 hidden md:block">{cta}</div>
        <Button variant="outline" className="mt-3 w-full" aria-pressed={saved} onClick={() => { toggle(product); toast(saved ? "Removed from saved pieces." : "Saved for later."); }}><Heart className={saved ? "fill-current" : ""} />{saved ? "Saved to your edit" : "Save for later"}</Button>
        <Accordion type="multiple" className="mt-8">
          <AccordionItem value="details"><AccordionTrigger>About this piece</AccordionTrigger><AccordionContent><p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{product.description || "Contact us if you would like to know more about this product."}</p><p className="mt-3 text-xs text-muted-foreground">Product reference: {product.backendId || product.id}</p></AccordionContent></AccordionItem>
          <AccordionItem value="delivery"><AccordionTrigger>Delivery & returns</AccordionTrigger><AccordionContent><p className="text-sm leading-7 text-muted-foreground">For delivery availability, timing, or return questions, our team can help before you order.</p><StoreLink to="/contact" className="mt-3 inline-flex min-h-11 items-center text-sm underline">Contact the team</StoreLink></AccordionContent></AccordionItem>
        </Accordion>
      </section>
    </div>
    {related.length > 0 && <section className="mt-20 border-t border-border pt-12"><p className="eyebrow">Keep exploring</p><h2 className="mb-8 mt-3 font-display text-3xl sm:text-4xl">More in {product.category.name.toLowerCase()}</h2><ProductGrid products={related} /></section>}
    {recent.length > 0 && <section className="mt-16 border-t border-border pt-12"><h2 className="mb-8 font-display text-3xl">Another look.</h2><p className="-mt-4 mb-8 text-sm text-muted-foreground">Pieces you recently explored.</p><ProductGrid products={recent} /></section>}
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] md:hidden">{cta}</div>
  </main>;
}
function ProductLoader({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    let active = true;
    getProduct(id, controller.signal).then(data => { if (active) setProduct(data); }).catch(err => { if (active) setError(err instanceof ApiError && err.status === 404 ? "This piece is no longer available." : "We couldn't load this piece. Please try again."); }).finally(() => clearTimeout(timer));
    return () => { active = false; controller.abort(); clearTimeout(timer); };
  }, [id, attempt]);
  if (error) return <main className="page-shell py-24 text-center"><h1 className="font-display text-4xl">A little interruption.</h1><p role="alert" className="my-5 text-sm text-muted-foreground">{error}</p><Button onClick={() => { setError(""); setAttempt(n => n + 1); }}>Try again</Button><StoreLink to="/products" className="mx-4 inline-flex min-h-11 items-center text-sm underline">Back to the collection</StoreLink></main>;
  if (!product) return <main className="page-shell grid gap-10 py-10 md:grid-cols-2" role="status"><span className="sr-only">Loading product details</span><Skeleton className="aspect-[4/5]" /><div className="space-y-6 pt-8"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-12 w-3/4" /><Skeleton className="h-7 w-1/4" /><Skeleton className="h-28 w-full" /><Skeleton className="h-12 w-full" /></div></main>;
  return <ProductContent product={product} />;
}
export default function ProductDetails() {
  const { id = "" } = useParams();
  return <ProductLoader key={id} id={id} />;
}
