"use client";
import { WishlistSheet } from "@/components/product/wishlist-sheet";
import { SearchDialog } from "@/components/navigation/search-dialog";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Logo } from "./logo";
import { MobileNavigation } from "./mobile-nav";
import { AccountMenu } from "./account-menu";
import { MegaMenu } from "@/components/navigation/mega-menu";
import { useCategories } from "@/hooks/use-categories";
import type { StoreUser } from "@/types/session";

export function Header({ user, authenticated, count, onLogout }: { user: StoreUser | null; authenticated: boolean; count: number; onLogout: () => void }) {
  const categories = useCategories();
  return <header className="relative z-50 border-b border-border bg-background">
    <div className="page-shell flex h-20 items-center justify-between gap-1 sm:h-24 sm:gap-4">
      <div className="flex items-center gap-0.5 sm:gap-3"><MobileNavigation {...categories} authenticated={authenticated} /><Logo /></div>
      <MegaMenu {...categories} />
      <div className="flex shrink-0 items-center"><SearchDialog /><div className="hidden min-[375px]:block"><WishlistSheet /></div><div className="hidden sm:block"><AccountMenu user={user} authenticated={authenticated} onLogout={onLogout} /></div><CartDrawer count={count} /></div>
    </div>
  </header>;
}
