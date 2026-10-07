"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api/categories";
import type { Category } from "@/types/category";

export function useCategories() {
  const [state, setState] = useState<{ categories: Category[]; loading: boolean; error: string | null }>({ categories: [], loading: true, error: null });
  useEffect(() => {
    const controller = new AbortController();
    getCategories(controller.signal).then(categories => { if (!controller.signal.aborted) setState({ categories, loading: false, error: null }); }).catch(() => { if (!controller.signal.aborted) setState({ categories: [], loading: false, error: "Categories are temporarily unavailable." }); });
    return () => controller.abort();
  }, []);
  return state;
}
