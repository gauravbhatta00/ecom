import { Quote } from "lucide-react";
import { homeContent } from "@/data/home";
import { SectionHeading } from "./section-heading";
import { StoreLink } from "@/components/ui/store-link";

export function Testimonials({ demo }: { demo: boolean }) {
  return <section className="border-y border-border bg-white/40 py-14 sm:py-20">
    <div className="page-shell">
      <SectionHeading eyebrow="In good company" title="Everyday things. Personal stories." />
      {demo ? <><p className="mb-5 text-xs text-muted-foreground">Design preview · These are sample testimonials, not verified customer reviews.</p><div className="grid gap-6 md:grid-cols-3">{homeContent.demoTestimonials.map(story => <figure key={story.name} className="border-t border-border pt-6"><Quote size={22} strokeWidth={1} /><blockquote className="mt-4 font-display text-2xl leading-relaxed">“{story.quote}”</blockquote><figcaption className="mt-6 text-xs">{story.name}<span className="mt-1 block text-muted-foreground">{story.location}</span></figcaption></figure>)}</div></> : <div className="grid gap-6 border-t border-border pt-8 md:grid-cols-[1fr_auto] md:items-center"><div><p className="font-display text-2xl">The next story could be yours.</p><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Our customer story collection is just beginning. Have a favourite find? We would love to hear how it fits into your everyday.</p></div><StoreLink to="/contact" className="w-fit border-b border-foreground pb-2 text-sm">Share your story</StoreLink></div>}
    </div>
  </section>;
}
