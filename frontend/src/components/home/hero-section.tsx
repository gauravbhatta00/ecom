import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLink } from "@/components/ui/store-link";

export function HeroSection() {
  return (
    <section aria-labelledby="home-title" className="overflow-hidden border-b border-border bg-[#f2eee6]">
      <div className="mx-auto grid max-w-[1440px] items-center gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-16 lg:py-14">
        <div className="relative z-10">
          <p className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.24em] text-primary"><span className="h-px w-8 bg-primary" />The everyday wardrobe</p>
          <h1 id="home-title" className="max-w-xl font-display text-[clamp(3.2rem,6vw,5.8rem)] leading-[1.02] tracking-[-.045em]">Good days.<br />Great <span className="italic text-primary">clothes.</span></h1>
          <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground sm:text-base">Easy layers, favourite fits, and a little something new. Find your next everyday favourite.</p>
          <Button asChild size="lg" className="mt-7 gap-6"><StoreLink to="/products?sort=new">Shop the collection <ArrowUpRight aria-hidden="true" /></StoreLink></Button>
          <nav aria-label="Shop clothing departments" className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-foreground/15 pt-5">
            {["Women", "Men", "Kids"].map(name => <StoreLink key={name} to={`/products?category=${name.toLowerCase()}#product-list`} className="group inline-flex min-h-11 items-center gap-2 text-xs font-medium uppercase tracking-[.12em]">{name}<ArrowUpRight size={14} aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></StoreLink>)}
          </nav>
        </div>
        <div className="relative pb-7 pl-9 sm:pl-14">
          <div className="relative aspect-[4/4.3] overflow-hidden rounded-t-[45%] bg-[#ded7ca]">
            <Image src="/images/fashion/studio.jpg" alt="An everyday wardrobe of neutral coats, knitwear, and denim" fill priority sizes="(max-width: 1023px) 90vw, 46vw" className="object-cover" />
          </div>
          <StoreLink to="/products?category=women#product-list" className="group absolute bottom-10 left-0 w-[35%] rotate-[-5deg] border-[5px] border-[#faf8f2] bg-[#faf8f2] shadow-lg transition-transform hover:rotate-0 focus-visible:rotate-0">
            <div className="relative aspect-[3/4]"><Image src="/images/fashion/wool-coat.jpg" alt="Camel belted coat from the women's collection" fill sizes="(max-width: 1023px) 30vw, 17vw" className="object-cover" /></div>
            <span className="flex items-center justify-between gap-2 px-1 py-3 text-[10px] font-semibold uppercase tracking-[.1em]">The layer edit<ArrowUpRight size={14} aria-hidden="true" /></span>
          </StoreLink>
          <p className="absolute bottom-0 right-0 text-[9px] uppercase tracking-[.2em] text-muted-foreground">Wear it your way / LeloVaiLelo</p>
        </div>
      </div>
    </section>
  );
}
