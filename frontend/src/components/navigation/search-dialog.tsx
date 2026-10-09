"use client";
import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { Search, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StoreLink } from "@/components/ui/store-link";
import { ProductImage } from "@/components/product/product-image";
import { useCatalog } from "@/hooks/use-catalog";
import { filterProducts } from "@/lib/catalog";
import { formatPrice, productHref } from "@/lib/product";
import { safeLocalStorage } from "@/lib/safe-storage";

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const { products, loading, error, reload } = useCatalog(open);
  const deferred = useDeferredValue(query);
  const results = filterProducts(products, new URLSearchParams({ q: deferred })).slice(0, 6);
  const categories = [...new Map(products.map(p => [p.category.slug, p.category.name])).entries()].slice(0, 6);
  const changeOpen = useCallback((value: boolean) => {
    setOpen(value);
    if (!value) return;
    try { const saved: unknown = JSON.parse(String(safeLocalStorage.getItem("lelovailelo-searches") || "[]")); if (Array.isArray(saved)) setRecent(saved.filter((s): s is string => typeof s === "string" && s.length < 100).slice(0, 5)); } catch { /* Optional history. */ }
  }, []);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key === "k") { event.preventDefault(); changeOpen(true); } };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [changeOpen]);
  const remember = () => {
    const value = query.trim(); if (!value) return;
    const next = [value, ...recent.filter(s => s !== value)].slice(0, 5);
    setRecent(next); safeLocalStorage.setItem("lelovailelo-searches", JSON.stringify(next));
  };
  return <Dialog open={open} onOpenChange={changeOpen}><DialogTrigger asChild><Button variant="icon" size="icon" aria-label="Search products"><Search /></Button></DialogTrigger>
    <DialogContent><DialogTitle className="font-display text-3xl sm:text-4xl">Find your next favourite.</DialogTitle><DialogDescription className="mt-3 text-sm text-muted-foreground">Search the collection by product or category.</DialogDescription>
      <form action="/products" onSubmit={remember} className="mt-6 flex gap-2"><label className="sr-only" htmlFor="overlay-search">Search products</label><Input id="overlay-search" name="q" autoComplete="off" value={query} onChange={e => setQuery(e.target.value)} placeholder="What are you looking for?" className="min-w-0 flex-1" /><Button type="submit" aria-label="Show all search results"><Search /></Button></form>
      <div className="mt-6" aria-busy={loading || query !== deferred}>
        {loading ? <p role="status" className="py-10 text-sm text-muted-foreground">Loading the collection…</p> : error ? <div role="alert"><p className="text-sm">{error}</p><Button variant="outline" onClick={reload} className="mt-4">Try again</Button></div> : query.trim() ? <><p role="status" className="mb-4 text-xs text-muted-foreground">{results.length ? "Matching pieces" : "No matches. Try another product or category."}</p><ul className="divide-y divide-border">{results.map(product => <li key={product.id}><DialogClose asChild><StoreLink to={productHref(product)} onClick={remember} className="flex items-center gap-4 py-3 hover:bg-muted"><span className="relative h-20 w-16 shrink-0"><ProductImage src={product.images[0]} alt={product.name} sizes="64px" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm">{product.name}</span><span className="mt-1 block text-xs text-muted-foreground">{formatPrice(product.price)}{product.stock === 0 ? " · Out of stock" : ""}</span></span><ArrowUpRight size={16} /></StoreLink></DialogClose></li>)}</ul><DialogClose asChild><StoreLink to={`/products?q=${encodeURIComponent(query)}`} onClick={remember} className="mt-5 inline-flex min-h-11 items-center text-sm underline">View all results</StoreLink></DialogClose></> : <div className="grid gap-6 sm:grid-cols-2"><div><h3 className="eyebrow mb-3">Explore categories</h3>{categories.map(([id, name]) => <DialogClose key={id} asChild><StoreLink className="flex min-h-11 items-center text-sm hover:underline" to={`/products?category=${id}`}>{name}</StoreLink></DialogClose>)}</div><div><h3 className="eyebrow mb-3">Recent searches</h3>{recent.length ? <>{recent.map(value => <button key={value} onClick={() => setQuery(value)} className="block min-h-11 text-left text-sm hover:underline">{value}</button>)}<button className="mt-2 min-h-11 text-xs underline" onClick={() => { setRecent([]); safeLocalStorage.removeItem("lelovailelo-searches"); }}>Clear history</button></> : <p className="text-sm leading-6 text-muted-foreground">Your recent searches will appear here.</p>}</div></div>}
      </div>
    </DialogContent>
  </Dialog>;
}
