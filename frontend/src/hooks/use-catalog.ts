"use client";
import { useEffect, useState } from "react";
import { getProducts } from "@/lib/api/products";
import type { Product } from "@/types/product";

export function useCatalog(enabled = true) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, retry] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    let active = true;
    getProducts({ signal: controller.signal }).then(data => {
      if (active) { setProducts(data); setError(""); }
    }).catch(() => { if (active) setError("The collection couldn't be loaded. Please try again."); })
      .finally(() => { clearTimeout(timer); if (active) setLoading(false); });
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [enabled, attempt]);
  return { products, loading, error, reload: () => { setLoading(true); setError(""); retry(n => n + 1); } };
}

