"use client";
import { WishlistSheet } from "@/components/product/wishlist-sheet";


import { StoreLink as Link } from "@/components/ui/store-link";
import { Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { MobileNavigation } from "./mobile-nav";
import { AccountMenu } from "./account-menu";
import { MegaMenu } from "@/components/navigation/mega-menu";
import { useCategories } from "@/hooks/use-categories";
import type { StoreUser } from "@/types/session";

export function Header({ user, authenticated, count, onLogout }: { user: StoreUser | null; authenticated: boolean; count: number; onLogout: () => void }) {
  const categories = useCategories();
  return <header className="relative z-50 border-b border-border bg-background"><div className="page-shell flex h-[76px] items-center justify-between gap-1 sm:h-[88px] sm:gap-4"><div className="flex items-center gap-0.5 sm:gap-3"><MobileNavigation {...categories} authenticated={authenticated} /><Logo /></div><MegaMenu {...categories} /><div className="flex shrink-0 items-center"><Button asChild variant="icon" size="icon" className="hidden min-[375px]:inline-flex"><Link to="/products#product-search" aria-label="Search products"><Search /></Link></Button><WishlistSheet /><div className="hidden sm:block"><AccountMenu user={user} authenticated={authenticated} onLogout={onLogout} /></div><Button asChild variant="icon" size="icon" className="relative"><Link to="/cart" aria-label={`Shopping bag with ${count} ${count === 1 ? "item" : "items"}`}><ShoppingBag />{count > 0 && <span aria-hidden="true" className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">{count > 99 ? "99+" : count}</span>}</Link></Button></div></div></header>;
}
