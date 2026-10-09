"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeLocalStorage } from "@/lib/safe-storage";
interface RecentState { ids: string[]; add: (id: string) => void }
export const useRecentlyViewedStore = create<RecentState>()(persist(set => ({
  ids: [], add: id => set(state => ({ ids: [id, ...state.ids.filter(value => value !== id)].slice(0, 12) })),
}), {
  name: `lelovailelo-recently-viewed${process.env.NEXT_PUBLIC_CATALOG_REVISION ? ":" + process.env.NEXT_PUBLIC_CATALOG_REVISION : ""}`, storage: createJSONStorage(() => safeLocalStorage), skipHydration: true,
  partialize: state => ({ ids: state.ids }),
  merge: (saved, current) => {
    const ids = (saved as { ids?: unknown } | null)?.ids;
    return { ...current, ids: Array.isArray(ids) ? [...new Set(ids.filter((id): id is string => typeof id === "string" && /^(?:live-\d+|demo-fashion-\d+)$/.test(id)))].slice(0, 12) : [] };
  },
}));
