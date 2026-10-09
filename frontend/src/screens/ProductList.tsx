"use client";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCatalog } from "@/hooks/use-catalog";
import { filterProducts, filterKeys, readFilters } from "@/lib/catalog";
import { catalogMode } from "@/lib/api/products";
import { catalogCategories, categoryLabel } from "@/lib/categories";
import { useCategories } from "@/hooks/use-categories";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { ProductFilters } from "@/components/product/product-filters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { StoreLink } from "@/components/ui/store-link";

export default function ProductList() {
  const { products, loading, error, reload } = useCatalog();
  const { categories } = useCategories();
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const section = useRef<HTMLElement>(null);
  const f = readFilters(params);
  const deferred = useDeferredValue(params.toString());
  const visible = filterProducts(products, new URLSearchParams(deferred));
  const limit = Math.max(12, Math.min(1200, Number(params.get("limit")) || 12));
  const selectedCategory = (categories.length ? categories : catalogCategories(products)).find(category => [String(category.id), category.name.toLowerCase(), category.slug].includes(f.category.toLowerCase()));
  const categoryName = selectedCategory ? categoryLabel(selectedCategory) : undefined;
  const active = filterKeys.filter(key => key === "min" ? f.min !== undefined : key === "max" ? f.max !== undefined : key === "available" ? f.available : Boolean(f[key]));
  const change = (values: Record<string, string>, replace = false) => {
    setParams(previous => { const next = new URLSearchParams(previous); Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key)); next.delete("limit"); return next; }, { replace });
  };
  useEffect(() => {
    if (location.hash === "#product-search") document.getElementById("product-search")?.focus();
    else if (location.hash === "#product-list") section.current?.scrollIntoView({ behavior: "instant" });
  }, [location.hash]);
  const apply = (values: Record<string, string>) => { change(values); setOpen(false); };
  return <main className="page-shell pb-20 pt-8 sm:pt-12">
    <nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted-foreground"><StoreLink to="/" className="hover:underline">Home</StoreLink><span className="mx-3">/</span>Collection</nav>
    <section id="product-list" ref={section}>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">The LeloVaiLelo edit</p><h1 className="mt-3 font-display text-4xl tracking-tight sm:text-6xl">{categoryName || "Your everyday wardrobe."}</h1><p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">A considered collection. Find the pieces that feel like you.</p></div><p role="status" className="text-xs text-muted-foreground">{loading ? "Loading collection…" : `${visible.length} pieces`}</p></div>
      {catalogMode === "demo" && <p className="mb-5 text-xs">Sample collection. Purchasing disabled.</p>}
      <div className="mb-7 grid gap-4 border-y border-border py-4 sm:grid-cols-[1fr_auto]">
        <div className="relative max-w-lg"><Search size={17} className="pointer-events-none absolute left-3 top-3.5 text-muted-foreground" /><Input id="product-search" aria-label="Search collection" placeholder="Search by product or category" value={params.get("q") || ""} maxLength={100} onChange={e => change({ q: e.target.value }, true)} className="w-full pl-10" /></div>
        <div className="flex gap-3">
          <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="outline" className="lg:hidden"><SlidersHorizontal />Filters{active.length > 0 && ` (${active.length})`}</Button></SheetTrigger><SheetContent side="right"><SheetTitle className="font-display text-3xl">Refine your edit</SheetTitle><SheetDescription className="mb-8 mt-2 text-sm text-muted-foreground">Choose your preferences, then apply.</SheetDescription><ProductFilters key={params.toString() + ":" + categories.length + ":" + products.length} categories={categories} products={products} params={params} onApply={apply} /></SheetContent></Sheet>
          <label className="flex min-w-0 flex-1 items-center gap-2 text-xs"><span className="sr-only">Sort products</span><select value={f.sort} onChange={e => change({ sort: e.target.value })} className="h-11 w-full border border-border bg-background px-3 text-xs sm:min-w-44"><option value="featured">Featured</option><option value="new">Newest arrivals</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
        </div>
      </div>
      {active.length > 0 && <div className="mb-7 flex flex-wrap items-center gap-2">{active.map(key => <Button key={key} variant="outline" className="h-11 px-3 text-xs" onClick={() => change({ [key]: "" })} aria-label={`Remove ${key} filter`}>{key === "category" ? categoryName || f.category : key === "available" ? "In stock" : key === "min" ? `From $${f.min}` : key === "max" ? `Up to $${f.max}` : `“${f.q}”`}<X size={12} /></Button>)}<Button variant="ghost" onClick={() => change(Object.fromEntries(filterKeys.map(key => [key, ""])))} className="text-xs underline">Clear all</Button></div>}
      <div className="grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside aria-label="Product filters" className="hidden lg:block"><h2 className="mb-6 font-display text-2xl">Refine</h2><ProductFilters key={params.toString() + ":" + categories.length + ":" + products.length} categories={categories} products={products} params={params} onApply={apply} /></aside>
        <div aria-busy={loading || params.toString() !== deferred}>
          {loading ? <ProductGridSkeleton count={8} /> : error ? <div role="alert" className="py-20 text-center"><h2 className="font-display text-3xl">A little interruption.</h2><p className="my-4 text-sm text-muted-foreground">{error}</p><Button onClick={reload}>Try again</Button></div> : visible.length ? <><ProductGrid products={visible.slice(0, limit)} /><div className="mt-12 text-center"><p className="mb-4 text-xs text-muted-foreground">Showing {Math.min(limit, visible.length)} of {visible.length} pieces</p>{limit < visible.length && <Button variant="outline" onClick={() => setParams(previous => { const next = new URLSearchParams(previous); next.set("limit", String(limit + 12)); return next; })}>Discover more</Button>}</div></> : <div className="border border-border px-6 py-20 text-center"><Search className="mx-auto mb-5 text-muted-foreground" /><h2 className="font-display text-3xl">Nothing quite matches.</h2><p className="my-4 text-sm text-muted-foreground">Try a broader search or remove a filter.</p><Button variant="outline" onClick={() => change(Object.fromEntries(filterKeys.map(key => [key, ""])))}>Reset your search</Button></div>}
        </div>
      </div>
    </section>
  </main>;
}
