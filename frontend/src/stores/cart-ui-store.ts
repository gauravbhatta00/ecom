"use client";

import { create } from "zustand";

interface CartUiState {
  open: boolean;
  setOpen: (open: boolean) => void;
  addingId: string | null;
  begin: (id: string) => boolean;
  finish: () => void;
}
export const useCartUiStore = create<CartUiState>((set, get) => ({
  open: false,
  setOpen: open => set({ open }),
  addingId: null,
  begin: id => {
    if (get().addingId !== null) return false;
    set({ addingId: id });
    return true;
  },
  finish: () => set({ addingId: null }),
}));
