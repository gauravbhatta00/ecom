import { getProducts, catalogMode } from "../lib/api/products";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, RefreshCw } from "lucide-react";
import { ProductGrid } from "../components/product/product-grid";
import { ProductGridSkeleton } from "../components/product/product-card-skeleton";

import { Input } from "../components/ui/input";



export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "featured";
  const setQuery = (value) => setSearchParams(previous => { const next = new URLSearchParams(previous); if (value) next.set("q", value); else next.delete("q"); return next; }, { replace: true });
  const setSort = (value) => setSearchParams(previous => { const next = new URLSearchParams(previous); next.set("sort", value); return next; });
  const location = useLocation();
  const sectionRef = useRef(null);
  const category = searchParams.get("category") || "all";


  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setProducts(await getProducts());
      setError("");
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => {
    if (location.hash === "#product-search") document.getElementById("product-search")?.focus();
    else if (!loading && (location.hash === "#product-list" || category !== "all")) sectionRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [loading, location.hash, category]);

  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => { if (p.category) map.set(String(p.category.id), p.category.name); });
    return [...map.entries()];
  }, [products]);

  const visible = useMemo(() => {
    const filtered = products.filter((p) => {
      const matchesCategory = category === "all" || String(p.category?.id) === category || String(p.category?.name).toLowerCase() === category.toLowerCase();
      const text = `${p.name} ${p.description || ""} ${p.category?.name || ""}`.toLowerCase();
      return matchesCategory && text.includes(query.toLowerCase());
    });
    return [...filtered].sort((a, b) => sort === "low" ? Number(a.price) - Number(b.price) : sort === "high" ? Number(b.price) - Number(a.price) : sort === "new" ? Date.parse(b.createdAt) - Date.parse(a.createdAt) : 0);
  }, [products, category, query, sort]);

  const chooseCategory = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("category"); else next.set("category", value);
    setSearchParams(next);
  };

  return (
    <main className="min-h-screen bg-[#f7f6f1]">
      {catalogMode === "demo" && <p className="page-shell py-3 text-xs text-muted-foreground">Sample collection preview. Purchasing is disabled.</p>}
      <section id="product-list" ref={sectionRef} className="page-shell scroll-mt-28 py-16 sm:py-20">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-[#71813d]">Curated for you</p>
            <h1 className="display-font text-4xl tracking-tight text-[#18231c] sm:text-5xl">Explore the collection</h1>
            <p className="mt-2 text-sm text-[#68716b]">Useful pieces, honest prices, and no clutter.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#68716b]"><span className="font-semibold text-[#18231c]">{visible.length}</span> products</div>
        </div>

        <div className="mb-9 rounded-2xl border border-[#dedfd7] bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-[#f4f4ee] px-4 py-3">
              <Search size={18} className="text-[#788078]" />
              <Input id="product-search" aria-label="Search products" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="border-0 bg-transparent text-sm" />
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
              <button onClick={() => chooseCategory("all")} className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-bold ${category === "all" ? "bg-[#173c2b] text-white" : "bg-[#f4f4ee] text-[#5e675f] hover:bg-[#e9eadf]"}`}>All</button>
              {categories.map(([id, name]) => <button key={id} onClick={() => chooseCategory(id)} className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-bold ${category === id ? "bg-[#173c2b] text-white" : "bg-[#f4f4ee] text-[#5e675f] hover:bg-[#e9eadf]"}`}>{name}</button>)}
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-[#dedfd7] px-3 py-2.5 text-xs font-semibold text-[#596259]">
              <SlidersHorizontal size={15} />
              <select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)} className="bg-white outline-none">
                <option value="featured">Featured</option><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>

        {loading ? <ProductGridSkeleton count={8} /> : error ? (
          <div className="rounded-3xl border border-red-100 bg-white py-16 text-center"><p className="font-semibold text-[#18231c]">{error}</p><button onClick={loadProducts} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#173c2b] px-5 py-2.5 text-sm font-bold text-white"><RefreshCw size={15} /> Try again</button></div>
        ) : visible.length ? (
          <ProductGrid products={visible} />
        ) : (
          <div className="rounded-3xl border border-dashed border-[#cfd2c7] py-20 text-center"><p className="display-font text-2xl text-[#18231c]">No matches found</p><button onClick={() => setSearchParams(previous => { const next = new URLSearchParams(previous); next.delete("q"); next.delete("category"); return next; })} className="mt-3 text-sm font-bold text-[#71813d] underline">Clear filters</button></div>
        )}
      </section>
    </main>
  );
}
