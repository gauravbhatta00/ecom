import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLink } from "@/components/ui/store-link";
import { homeContent } from "@/data/home";
import { Reveal } from "./reveal";

export function PromotionalBanner() {
  return <section className="grid bg-primary text-white lg:grid-cols-2">
    <div className="relative min-h-80 sm:min-h-[440px]"><Image src={homeContent.campaignImage} alt="Linen, canvas and natural wood in warm afternoon light" fill sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover object-left" /></div>
    <Reveal className="flex flex-col items-start justify-center px-6 py-12 sm:px-12 lg:px-16">
      <p className="text-[10px] uppercase tracking-[.2em] text-white/70">The slow living edit</p>
      <h2 className="mt-6 max-w-lg font-display text-4xl leading-[1.1] sm:text-5xl">Make room for<br /><span className="italic text-[#dce3c9]">the little things.</span></h2>
      <p className="mt-6 max-w-sm text-sm leading-7 text-white/75">A favourite corner. A quieter morning. A piece you reach for, again and again. Find a little more joy in the everyday.</p>
      <Button asChild variant="secondary" className="mt-8"><StoreLink to="/products">Discover the edit <ArrowRight /></StoreLink></Button>
    </Reveal>
  </section>;
}
