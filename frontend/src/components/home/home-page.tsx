import type { HomeCatalog } from "@/lib/api/home";
import { FeaturedCategories } from "./featured-categories";
import { BestSellersSection } from "./best-sellers";
import { NewArrivalsSection } from "./new-arrivals";
import { ShopByCategory } from "./shop-by-category";
import { FeaturedCollection } from "./featured-collection";
import { BrandStorySection } from "./brand-story";
import { NewsletterSection } from "./newsletter";
import { StoreLink } from "@/components/ui/store-link";
import { homeContent } from "@/data/home";

export function HomePage({ catalog, newsletterEnabled }: { catalog: HomeCatalog; newsletterEnabled: boolean }) {
  const bestsellers = catalog.products.filter(product => product.bestseller);
  const edit = bestsellers.length ? bestsellers : [...catalog.products].sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0)).slice(0, 8);
  return <>
    {catalog.source === "demo" && <p className="border-b border-border px-4 py-3 text-center text-xs">Sample collection preview · Sample clothing, prices and availability. Purchasing is disabled.</p>}
    <div className="border-b border-border">
      <div className="page-shell grid gap-6 py-7 sm:grid-cols-3 sm:gap-8">{homeContent.principles.map((item, i) => <div key={item.title} className="flex gap-4"><span className="pt-1 font-display text-lg italic text-muted-foreground">0{i + 1}</span><div><p className="text-xs font-medium">{item.title}</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.text}</p></div></div>)}</div>
    </div>
    <FeaturedCategories categories={catalog.categories} products={catalog.products} />
    {catalog.unavailable ? <section className="page-shell py-16 text-center" aria-labelledby="catalog-error"><h2 id="catalog-error" className="font-display text-3xl">The collection is taking a moment.</h2><p className="mt-3 text-sm text-muted-foreground">We couldn’t load the products. Please try again shortly.</p><StoreLink to="/" className="mt-5 inline-block border-b border-foreground pb-1 text-sm">Try again</StoreLink></section> : catalog.products.length === 0 ? <section className="page-shell py-16 text-center"><h2 className="font-display text-3xl">Good things are on their way.</h2><p className="mt-3 text-sm text-muted-foreground">Our next collection is being prepared. Come back soon.</p></section> : <BestSellersSection products={edit} title={bestsellers.length ? "The favourites" : "The everyday edit"} eyebrow={bestsellers.length ? "Bestsellers" : "Discover the collection"} />}
    <NewArrivalsSection products={catalog.products} />
    <ShopByCategory categories={catalog.categories} />
    <FeaturedCollection products={catalog.products} />
    <BrandStorySection />
    <NewsletterSection enabled={newsletterEnabled} />
  </>;
}
