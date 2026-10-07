import { StoreLink as Link } from "@/components/ui/store-link";
import { Button } from "@/components/ui/button";

export function NotFound() { return <main className="page-shell grid min-h-[60vh] place-content-center gap-5 py-16 text-center"><p className="eyebrow">404 — Page not found</p><h1 className="font-display text-4xl">A little off the beaten path.</h1><p className="text-sm text-muted-foreground">Let’s get you back to the collection.</p><Button asChild><Link to="/products">Explore the shop</Link></Button></main>; }
