import type { StateStorage } from "zustand/middleware";

export const safeLocalStorage: StateStorage = {
  getItem: name => { try { return typeof window === "undefined" ? null : window.localStorage.getItem(name); } catch { return null; } },
  setItem: (name, value) => { try { window.localStorage.setItem(name, value); } catch { /* State remains usable when storage is unavailable. */ } },
  removeItem: name => { try { window.localStorage.removeItem(name); } catch { /* Storage may be disabled. */ } },
};
