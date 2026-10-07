import { authFetch } from "@/utils/auth";
import { apiBaseUrl } from "../config";

export interface SyncCartItem {
  id: number | string;
  product_id?: number | string;
  quantity: number;
  [key: string]: unknown;
}

// Save each acknowledged unit so a rejected request cannot erase or replay the whole guest bag.
export async function syncGuestItems(items: SyncCartItem[], saveRemaining: (items: SyncCartItem[]) => void) {
  let remaining = [...items];
  for (const item of items) {
    const productId = Number(item.product_id ?? item.id);
    if (!Number.isInteger(productId) || productId < 1 || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Error("Invalid guest cart item.");
    }
    for (let index = 0; index < item.quantity; index++) {
      const response = await authFetch(`${apiBaseUrl}/api/cart/add/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      if (!response.ok) throw new Error("Couldn't sync your bag. Your remaining items are saved.");
      remaining = remaining.map(saved => Number(saved.product_id ?? saved.id) === productId
        ? { ...saved, quantity: saved.quantity - 1 } : saved).filter(saved => saved.quantity > 0);
      saveRemaining(remaining);
    }
  }
}
