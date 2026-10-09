import type { Metadata } from "next";
import { Suspense } from "react";
import { getHomeCatalog } from "@/lib/api/home";
import { HomePage } from "@/components/home/home-page";
import { StorefrontFrame } from "@/components/layout/storefront-frame";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";
import { HeroSection } from "@/components/home/hero-section";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "LeloVaiLelo — Less ordinary. More you.",
  description: "Discover everyday clothing at LeloVaiLelo. Explore shirts, denim, knitwear, outerwear, dresses, and matching sets.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "LeloVaiLelo — Less ordinary. More you.",
    description: "Considered clothing for the way you dress.",
    images: [{ url: "/images/fashion/campaign.jpg", alt: "A considered everyday, by LeloVaiLelo" }],
  },
};

async function HomeContent() {
  const catalog = await getHomeCatalog();
  return <HomePage catalog={catalog} newsletterEnabled={Boolean(process.env.NEWSLETTER_ENDPOINT)} />;
}

export default function Page() {
  return <StorefrontFrame><main id="main-content" tabIndex={-1} className="outline-none"><HeroSection /><Suspense fallback={<div className="page-shell py-12"><p className="mb-8 font-display text-3xl">Good things are on their way.</p><ProductGridSkeleton /></div>}><HomeContent /></Suspense></main></StorefrontFrame>;
}
