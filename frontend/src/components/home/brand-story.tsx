import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { StoreLink } from "@/components/ui/store-link";


export function BrandStorySection() {
  return <section className="page-shell grid gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-20">
    <div className="relative aspect-[5/4] overflow-hidden bg-muted"><Image src="/images/fashion/studio.jpg" alt="The natural materials and quiet details that inspire our collection" fill sizes="(max-width: 1023px) 90vw, 45vw" className="object-cover object-[25%_center]" /></div>
    <div><p className="eyebrow">Behind the collection</p><h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">A simpler way<br />to find <span className="italic text-primary">your own style.</span></h2><p className="mt-6 max-w-lg text-sm leading-7 text-muted-foreground">Getting dressed should feel like you. LeloVaiLelo brings together easy silhouettes, tactile layers, and expressive details for a wardrobe with personality.</p><p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">Explore at your own pace. Choose what speaks to you. Make it part of your story.</p><StoreLink to="/about" className="mt-7 inline-flex items-center gap-4 border-b border-foreground pb-2 text-sm">The story of LeloVaiLelo <ArrowUpRight size={16} /></StoreLink></div>
  </section>;
}
