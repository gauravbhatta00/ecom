"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/stores/wishlist-store";

export function StoreHydration() {
  useEffect(() => { void useWishlistStore.persist.rehydrate(); }, []);
  return null;
}
