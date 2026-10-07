import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return <main className="page-shell grid min-h-screen place-content-center gap-5 py-16 text-center"><p className="eyebrow">404 — Page not found</p><h1 className="font-display text-4xl">A little off the beaten path.</h1><p className="text-sm text-muted-foreground">Let’s get you back to the collection.</p><Button asChild><Link href="/products">Explore the shop</Link></Button></main>;
}
