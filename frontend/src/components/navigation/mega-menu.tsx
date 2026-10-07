"use client";

import { useState } from "react";
import Image from "next/image";
import { StoreLink as Link } from "@/components/ui/store-link";
import { ArrowUpRight } from "lucide-react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { CategoryLinks, type CategoryLinksProps } from "./category-links";
import { mainLinks, shopLinks } from "@/data/navigation";

export function MegaMenu(props: CategoryLinksProps) {
  const [value, setValue] = useState("");
  return <NavigationMenu value={value} onValueChange={setValue} aria-label="Main navigation" className="relative hidden lg:block"><NavigationMenuList className="flex items-center gap-2"><NavigationMenuItem><NavigationMenuTrigger>Shop</NavigationMenuTrigger><NavigationMenuContent><div className="grid grid-cols-[1fr_1.2fr] gap-8"><div><p className="eyebrow mb-4">The everyday edit</p>{shopLinks.map(link => <NavigationMenuLink key={link.href} asChild><Link to={link.href} onClick={() => setValue("")} className="block py-2 text-sm font-medium">{link.label}</Link></NavigationMenuLink>)}<div className="my-4 border-t border-border" /><p className="eyebrow mb-3">By category</p><CategoryLinks {...props} onNavigate={() => setValue("")} /></div><Link to="/products" onClick={() => setValue("")} className="group"><div className="relative aspect-[4/3] overflow-hidden bg-muted"><Image src="/images/everyday-editorial.png" alt="A considered collection of everyday essentials" fill sizes="280px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" /></div><p className="mt-4 flex items-center justify-between font-display text-2xl">Made for real life <ArrowUpRight size={18} /></p><p className="mt-2 text-xs leading-5 text-muted-foreground">Useful things. Beautiful details. Find your everyday favourites.</p></Link></div></NavigationMenuContent></NavigationMenuItem>{mainLinks.map(link => <NavigationMenuItem key={link.href}><NavigationMenuLink asChild><Link to={link.href} className="inline-flex h-11 items-center px-3 text-sm hover:text-primary">{link.label}</Link></NavigationMenuLink></NavigationMenuItem>)}</NavigationMenuList></NavigationMenu>;
}
