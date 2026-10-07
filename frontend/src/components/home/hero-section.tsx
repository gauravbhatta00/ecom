import Image from "next/image";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLink } from "@/components/ui/store-link";
import { homeContent } from "@/data/home";
import { Reveal } from "./reveal";

export function HeroSection() {
  return (
    <section aria-labelledby="home-title" className="border-b border-border bg-[#eeede5]">
      <div className="mx-auto grid max-w-[1600px] lg:min-h-[620px] lg:grid-cols-[.85fr_1.15fr]">
        <Reveal className="flex flex-col justify-center px-6 py-12 sm:px-12 sm:py-16 lg:pl-16 xl:pl-24">
          <p className="eyebrow mb-7">{homeContent.eyebrow}</p>
          <h1 id="home-title" className="font-display text-[52px] leading-[1.02] tracking-[-.045em] sm:text-7xl xl:text-[88px]">
            {homeContent.headline[0]}<br /><span className="italic text-primary">{homeContent.headline[1]}</span>
          </h1>
          <p className="mt-7 max-w-sm text-sm leading-7 text-muted-foreground sm:text-base">{homeContent.introduction}</p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Button asChild size="lg"><StoreLink to="/products">Explore the collection <ArrowRight /></StoreLink></Button>
            <StoreLink to="/about" className="border-b border-foreground pb-1 text-xs font-medium">Our story</StoreLink>
          </div>
          <p className="mt-10 flex items-center gap-3 text-[10px] uppercase tracking-[.18em] text-muted-foreground"><ArrowDown size={13} /> Find your everyday favourites</p>
        </Reveal>
        <div className="relative min-h-[350px] sm:min-h-[460px] lg:min-h-[620px]">
          <Image src={homeContent.campaignImage} alt={homeContent.campaignAlt} fill priority sizes="(max-width: 1023px) 100vw, 58vw" className="object-cover object-[58%_center]" />
          <div className="absolute bottom-5 left-5 border border-white/50 bg-background/95 px-5 py-4 sm:bottom-8 sm:left-8">
            <p className="text-[9px] uppercase tracking-[.2em] text-muted-foreground">A considered everyday</p>
            <p className="mt-1 font-display text-xl">Good things, in good company.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
