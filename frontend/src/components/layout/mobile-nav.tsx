"use client";

import { useState } from "react";
import { StoreLink as Link } from "@/components/ui/store-link";
import { Menu, ArrowUpRight, User, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CategoryLinks, type CategoryLinksProps } from "@/components/navigation/category-links";
import { mainLinks, shopLinks } from "@/data/navigation";

export function MobileNavigation({ authenticated, ...categories }: CategoryLinksProps & { authenticated: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="icon" size="icon" className="lg:hidden" aria-label="Open navigation"><Menu /></Button></SheetTrigger><SheetContent><SheetTitle className="pr-10 font-display text-2xl">LeloVaiLelo.</SheetTitle><SheetDescription className="mt-2 text-xs text-muted-foreground">Good finds for your everyday.</SheetDescription><nav aria-label="Mobile navigation" className="mt-8"><Link onClick={close} to="/" className="block border-b border-border py-4 text-sm">Home</Link><Accordion type="single" collapsible defaultValue="shop"><AccordionItem value="shop"><AccordionTrigger>Shop the collection</AccordionTrigger><AccordionContent><div className="space-y-1 border-l border-border pl-4">{shopLinks.map(link => <Link key={link.href} to={link.href} onClick={close} className="block py-2 text-sm font-medium">{link.label}</Link>)}<p className="eyebrow pb-1 pt-4">By category</p><CategoryLinks {...categories} onNavigate={close} /></div></AccordionContent></AccordionItem></Accordion>{mainLinks.map(link => <Link key={link.href} to={link.href} onClick={close} className="flex items-center justify-between border-b border-border py-4 text-sm">{link.label}<ArrowUpRight size={14} /></Link>)}</nav><div className="mt-auto space-y-3 pt-10"><Button asChild className="w-full"><Link to={authenticated ? "/dashboard" : "/login"} onClick={close}><User />{authenticated ? "My account" : "Log in / Create account"}</Link></Button><Button asChild variant="outline" className="w-full"><Link to="/cart" onClick={close}><ShoppingBag />View shopping bag</Link></Button></div></SheetContent></Sheet>;
}
