import Image from "next/image";
import { homeContent } from "@/data/home";
import { SectionHeading } from "./section-heading";

export function SocialGallery() {
  return <section className="page-shell py-14 sm:py-20" aria-labelledby="social-title">
    <SectionHeading id="social-title" eyebrow="An everyday moodboard" title="A little inspiration, collected." description="Campaign and sample collection imagery. Our community gallery is coming soon." />
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{homeContent.socialImages.map(item => <div key={item.src} className="relative aspect-square overflow-hidden bg-muted"><Image src={item.src} alt={item.alt} fill sizes="(max-width: 767px) 45vw, 23vw" className="object-cover transition-transform duration-500 hover:scale-[1.035]" /></div>)}</div>
  </section>;
}
