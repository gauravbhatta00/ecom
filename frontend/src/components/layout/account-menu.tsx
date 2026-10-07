"use client";

import { StoreLink as Link } from "@/components/ui/store-link";
import { UserRound, Package, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import type { StoreUser } from "@/types/session";

export function AccountMenu({ user, authenticated, onLogout }: { user: StoreUser | null; authenticated: boolean; onLogout: () => void }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="icon" size="icon" aria-label="Account menu"><UserRound /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>{authenticated ? `Hello, ${user?.first_name || user?.username || "there"}` : "Welcome to LeloVaiLelo"}</DropdownMenuLabel><DropdownMenuSeparator />{authenticated ? <>{user?.role === "admin" && <DropdownMenuItem asChild><Link to="/admin"><LayoutDashboard />Admin dashboard</Link></DropdownMenuItem>}<DropdownMenuItem asChild><Link to="/dashboard"><UserRound />My account</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/orders"><Package />My orders</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/profile">Edit profile</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onSelect={onLogout} className="text-destructive"><LogOut />Log out</DropdownMenuItem></> : <><DropdownMenuItem asChild><Link to="/login">Log in</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/signup">Create an account</Link></DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu>;
}
