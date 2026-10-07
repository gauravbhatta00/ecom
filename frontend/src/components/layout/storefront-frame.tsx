"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider, useCart } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { StoreHydration } from "@/hooks/use-store-hydration";
import { Header } from "./header";
import { Footer } from "./footer";
import type { StoreUser } from "@/types/session";

function Frame({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth() as { user: StoreUser | null; isAuthenticated: boolean; logout: () => void };
  const { cartItems } = useCart() as { cartItems: { quantity: number }[] };
  const count = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  return <>
    <StoreHydration />
    <div id="top" />
    <a href="#main-content" className="skip-link">Skip to content</a>
    <Header user={user} authenticated={isAuthenticated} count={count} onLogout={logout} />
    {children}
    <Footer />
  </>;
}

export function StorefrontFrame({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user"><AuthProvider><ToastProvider><CartProvider><Frame>{children}</Frame></CartProvider></ToastProvider></AuthProvider></MotionConfig>;
}
