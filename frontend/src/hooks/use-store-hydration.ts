"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";

export function StoreHydration() {
  useEffect(() => { void useWishlistStore.persist.rehydrate(); void useRecentlyViewedStore.persist.rehydrate(); }, []);
  return null;
}
